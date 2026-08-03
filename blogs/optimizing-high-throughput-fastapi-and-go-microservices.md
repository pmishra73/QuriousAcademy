# Optimizing High-Throughput FastAPI & Go Microservices

**Category:** Core Systems
**Read time:** 11 min
**Description:** Concurrency pitfalls and performance techniques for FastAPI (ML/Python) and Go (high-volume data plane) services at scale.

FastAPI and Go fill different slots in the enterprise backend. FastAPI handles the ML-adjacent services—embedding calls, model inference, RAG orchestration—where Python's ecosystem matters more than raw throughput. Go handles the high-volume data plane—ingestion pipelines, notification fans, API gateways—where goroutine-per-connection concurrency and sub-millisecond latency are the requirements. Getting both to perform at scale requires understanding each runtime's concurrency model precisely.

## FastAPI: The Event Loop Is Not a Thread Pool

The most expensive FastAPI performance mistake is treating async as free concurrency. It isn't. FastAPI's event loop is single-threaded; `async def` endpoints cooperate rather than parallelize. If any function in your async call chain blocks synchronously—a synchronous database driver, a CPU-bound computation, a blocking file read—it stalls the entire event loop for every concurrent request.

```python
# Stalls the event loop for every other request during this query
@app.get("/bad")
async def bad_endpoint():
    result = db.execute("SELECT ...")  # synchronous driver — blocks!
    return result

# Correct: async driver, truly non-blocking
@app.get("/good")
async def good_endpoint():
    async with async_session() as session:
        result = await session.execute(text("SELECT ..."))
        return result.fetchall()

# For CPU-bound: offload to thread pool, don't block the loop
@app.get("/cpu-bound")
async def cpu_endpoint():
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, cpu_intensive_fn, arg)
```

## Connection Pool Sizing for FastAPI

SQLAlchemy's async engine pool has different pressure characteristics than the sync engine. The right pool size is not `cpu_count × 2`—it's a function of your database's `max_connections`, your number of replicas, and your average query latency.

```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,           # sustained concurrent connections per replica
    max_overflow=20,        # burst headroom above pool_size
    pool_pre_ping=True,     # validate connections before handing out
    pool_recycle=3600,      # recycle connections older than 1 hour
    connect_args={
        "server_settings": {
            "statement_timeout": "30s",
            "idle_in_transaction_session_timeout": "60s",
        }
    }
)
```

For a 3-replica deployment where the database allows 200 connections: budget 180 for the application (leaving 20 for admin and migrations), divide by replicas, and set `pool_size + max_overflow` to 60 per replica. Overprovisioning causes database contention under load; underprovisioning causes request queuing at the application layer before the database is even reached.

## Go: Goroutine Hygiene

Go goroutines are cheap at 4KB initial stack, but they're not free. The primary risk is leaking goroutines—launching them without a reliable exit path. A goroutine that reads from a channel has no guaranteed termination unless it also listens for a done signal on a context or a done channel.

```go
func processBatch(ctx context.Context, items []Item) error {
    sem := make(chan struct{}, 50)  // cap concurrency at 50
    eg, ctx := errgroup.WithContext(ctx)

    for _, item := range items {
        item := item  // capture loop variable
        sem <- struct{}{}
        eg.Go(func() error {
            defer func() { <-sem }()
            return processItem(ctx, item)
        })
    }

    return eg.Wait()
}
```

The semaphore channel caps concurrent goroutines without blocking the scheduler. `errgroup` propagates the first error and cancels the context, which signals all in-flight goroutines to terminate gracefully via `ctx.Done()`. No goroutine leaks, no silent errors dropped on the floor.

## pgxpool Configuration for Go

pgxpool is the standard connection pool for Go PostgreSQL applications. Its configuration parameters have direct, measurable performance implications:

```go
config, _ := pgxpool.ParseConfig(DATABASE_URL)
config.MaxConns = 20
config.MinConns = 5                        // keep a floor of warm connections
config.MaxConnLifetime = 30 * time.Minute  // force rotation; prevents stale connections
config.MaxConnIdleTime = 5 * time.Minute
config.HealthCheckPeriod = 1 * time.Minute

// Statement timeout at the driver level, not just application logic
config.ConnConfig.RuntimeParams["statement_timeout"] = "15000"

pool, err := pgxpool.NewWithConfig(ctx, config)
```

`MinConns` eliminates cold-start latency on burst traffic by keeping warm connections ready. `MaxConnLifetime` forces connection rotation, preventing issues with long-lived connections during PostgreSQL failover or PgBouncer reconnections. The statement timeout set at the driver level catches runaway queries that would otherwise hold connections indefinitely under load.

## Cache Validation Layer

Between your application and your database, a validation cache reduces read load for frequently accessed, slowly changing data. The critical invariant is that the cache must never silently serve stale data after a write. Versioned cache keys eliminate the need for explicit cache invalidation—a write that increments the version automatically invalidates downstream caches by making old keys unreachable.

```python
async def get_course(course_id: str, version: int) -> Course:
    cache_key = f"course:{course_id}:v{version}"

    if cached := await redis.get(cache_key):
        return Course.model_validate_json(cached)

    async with async_session() as session:
        course = await session.get(Course, course_id)

        if course.version != version:
            raise StaleVersionError(course_id)

        await redis.setex(cache_key, 300, course.model_dump_json())
        return course
```

The version embedded in the key means callers must know the current version to construct a cache hit. Reads that hit stale version keys simply miss the cache and fetch fresh data—there's no explicit invalidation required, and there's no window where a write and a cache read can race.

> **When to prefer Go over FastAPI:** If the service does no model inference or ML library calls and handles more than ~1,000 RPS with latency requirements under 10ms, Go is the right default. The goroutine scheduler outperforms asyncio at sustained high concurrency because it uses real OS threads. FastAPI stays ahead where Python library compatibility matters more than raw throughput.
