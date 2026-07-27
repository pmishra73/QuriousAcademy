# Building Custom Model Context Protocol (MCP) Servers

**Category:** Agentic Workflows
**Read time:** 10 min

MCP turns an LLM into a first-class client for your enterprise systems. Where the old approach was prompt-stuffing—serializing database records into context and hoping the model could navigate them—MCP gives the model a structured interface: typed tool calls with JSON Schema definitions, read-only resource access, and reusable prompt templates. The LLM doesn't need to know your schema; it just needs to know what tools are available and what they return.

## The MCP Primitive Stack

An MCP server exposes three kinds of primitives. **Tools** are functions the LLM can invoke—the primary primitive for database access. **Resources** are readable data objects, analogous to files. **Prompts** are reusable instruction templates the host can inject. For enterprise database tooling, tools do most of the work.

A tool is defined by a JSON Schema input definition and a typed response. The LLM sees the schema and decides whether to call the tool and with what arguments; your server implements the function and controls what actually executes. This separation is the entire security model.

## Defining a Tool with the Python SDK

```python
from mcp.server import Server
from mcp import types

app = Server("enterprise-db-tools")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="query_contracts",
            description=(
                "Search vendor contracts by status, date range, or value. "
                "Returns summarized contract metadata — never full document text."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["active", "expired", "pending"],
                    },
                    "min_value": {"type": "number"},
                    "start_date": {"type": "string", "format": "date"},
                    "end_date": {"type": "string", "format": "date"},
                },
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "query_contracts":
        results = await query_contracts_safe(arguments)
        return [types.TextContent(type="text", text=json.dumps(results))]
    raise ValueError(f"Unknown tool: {name}")
```

Tool descriptions matter as much as schemas. Write them from the model's perspective: what does this tool return, what are its limits, when should the model prefer it over another tool? Vague descriptions produce incorrect tool selection under ambiguous queries.

## Sandboxing Queries

The critical security property of an enterprise MCP server is that the LLM cannot issue arbitrary SQL. `query_contracts_safe` constructs a parameterized query from validated, allowlisted arguments. The LLM controls filter values; it does not control the query structure.

```python
async def query_contracts_safe(args: dict) -> list[dict]:
    conditions, params = [], {}

    if status := args.get("status"):
        conditions.append("status = :status")
        params["status"] = status

    if min_val := args.get("min_value"):
        conditions.append("contract_value >= :min_value")
        params["min_value"] = float(min_val)

    if start := args.get("start_date"):
        conditions.append("expiry_date >= :start")
        params["start"] = start

    where = " AND ".join(conditions) if conditions else "1=1"
    query = text(
        f"SELECT id, vendor_name, status, contract_value, expiry_date"
        f" FROM contracts WHERE {where} ORDER BY expiry_date DESC LIMIT 50"
    )

    # read_only_session() uses a DB principal with SELECT privileges only
    async with read_only_session() as session:
        result = await session.execute(query, params)
        return [dict(row._mapping) for row in result]
```

`read_only_session` connects using a database principal that has `SELECT` privileges only, on specific tables. Even a successful prompt injection attack cannot cause a mutation—the database role prevents it regardless of what SQL is attempted.

## Transport Options

MCP supports three transport modes. For local development and Claude Desktop integration, stdio is the default—your server process communicates via stdin/stdout:

```python
import asyncio
from mcp.server.stdio import stdio_server
from mcp.server.models import InitializationOptions

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, InitializationOptions(...))

asyncio.run(main())
```

For production deployments serving multiple clients, Streamable HTTP (MCP 2025-11 spec) is the recommended transport. FastMCP wraps the configuration:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("enterprise-db")

@mcp.tool()
async def query_contracts(
    status: str | None = None,
    min_value: float | None = None,
) -> str:
    results = await query_contracts_safe({"status": status, "min_value": min_value})
    return json.dumps(results)

mcp.run(transport="streamable-http", host="0.0.0.0", port=8080)
```

## Secrets and Authentication

Never hardcode credentials. The read-only database URL is the most sensitive secret in the server—it embeds a username and password that controls database access. Read it from the environment at startup, and rotate it via your secrets manager independently of deployments:

```python
DATABASE_URL = os.environ["DB_READ_ONLY_URL"]   # read-only principal
API_KEY_HASH = os.environ["MCP_API_KEY_SHA256"]  # for HTTP transport auth

async def verify_request(request) -> bool:
    key = request.headers.get("x-api-key", "")
    return hashlib.sha256(key.encode()).hexdigest() == API_KEY_HASH
```

For enterprise deployments, OAuth 2.0 against your existing identity provider replaces static API keys. MCP's HTTP transport supports standard Bearer token authentication in request headers, so your existing auth infrastructure slots in without protocol changes.

> The best MCP server is the one that exposes exactly the operations the LLM needs and no more. Start with a small tool surface and expand based on actual LLM behavior in testing.
