# Designing Stateful Multi-Agent Systems with LangGraph

**Category:** Agentic Workflows
**Read time:** 12 min
**Description:** How LangGraph's graph-based state model solves the hardest problem in multi-agent pipelines: shared mutable state that survives failures and human-in-the-loop pauses.

State is the hardest problem in multi-agent systems. Not reasoning quality, not tool selection—state. When an agent hands work to another, when a pipeline loops back on validation failure, when a human needs to approve before execution continues—all of that complexity lives in shared mutable state that must survive across steps, survive failures, and survive the arbitrary pauses that human-in-the-loop systems require.

LangGraph models agent pipelines as directed graphs—optionally cyclic—where nodes are state-transforming functions and edges route control flow. This structure maps naturally to the stateful workflows that production agentic systems require, because it forces you to think explicitly about what state is, who owns it, and how it changes.

## The State Schema

Every LangGraph application starts with a state definition. The graph passes this object between nodes; each node receives the current state and returns a partial update. Reducers control how updates are merged.

```python
from typing import Annotated, TypedDict
from langgraph.graph import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # reducer: append, not replace
    plan: str | None
    validation_errors: list[str]
    tool_results: dict
    iteration_count: int
    requires_human: bool
```

The `Annotated` type with `add_messages` is a reducer. Instead of replacing the messages list on each node update, LangGraph appends new messages to it. You can write custom reducers for any field where merge semantics are more appropriate than replace semantics—a running log of tool calls, an accumulating set of retrieved documents, a score that should track a running maximum.

## Building the Graph

Nodes and edges are registered on a `StateGraph` builder. Conditional edges accept a routing function that reads state and returns a string key. This is where branching and cycling live.

```python
from langgraph.graph import StateGraph, END

builder = StateGraph(AgentState)

builder.add_node("planner", planner_node)
builder.add_node("executor", executor_node)
builder.add_node("validator", validator_node)
builder.add_node("human_review", human_review_node)

builder.set_entry_point("planner")
builder.add_edge("planner", "executor")
builder.add_edge("executor", "validator")

builder.add_conditional_edges(
    "validator",
    route_after_validation,  # reads state → returns routing key
    {
        "retry": "executor",    # cycle: back to executor
        "human": "human_review",
        "done": END,
    }
)
builder.add_edge("human_review", "executor")
```

The conditional edge after `validator` is where cyclic control flow happens. The routing function reads the current state and returns a key. The executor → validator → executor cycle is the loop; the routing function's job is to know when to break it.

> **Design note:** Keep routing logic out of nodes and in routing functions. Nodes should transform state; routing functions should read it. This separation makes graphs much easier to reason about and test independently.

## Validation Nodes as State Guards

A validation node doesn't execute tools or call the LLM. It reads state, enforces invariants, and writes diagnostic information back. It's a pure state transformer that the rest of the graph routes decisions through.

```python
def validator_node(state: AgentState) -> dict:
    errors = []

    if state["iteration_count"] > 5:
        errors.append("max_iterations_exceeded")

    for result in state["tool_results"].values():
        if result.get("status") == "error":
            errors.append(f"tool_error:{result['tool']}")

    return {
        "validation_errors": errors,
        "iteration_count": state["iteration_count"] + 1,
    }

def route_after_validation(state: AgentState) -> str:
    if "max_iterations_exceeded" in state["validation_errors"]:
        return "human"
    if state["validation_errors"]:
        return "retry"
    return "done"
```

## Human-in-the-Loop Controls

LangGraph's `interrupt` mechanism lets a graph pause at a node boundary and wait for external input. The graph state is serialized to the checkpointer; when a human responds, execution resumes from exactly where it paused.

```python
from langgraph.graph import interrupt

async def human_review_node(state: AgentState) -> dict:
    # interrupt() raises a special exception that serializes state
    # and pauses the graph — execution does not continue past this line
    decision = interrupt({
        "errors": state["validation_errors"],
        "context": state["messages"][-3:],
        "question": "Retry with modifications, or abort?",
    })

    return {
        "requires_human": False,
        "messages": [{"role": "human", "content": decision["guidance"]}],
    }
```

On the application layer, you detect the interrupt, surface its payload to a UI, collect human input, and resume using `Command(resume=...)`. The thread ID reconnects the resumed call to the checkpointed state:

```python
# Initial invocation
result = graph.invoke(
    initial_state,
    config={"configurable": {"thread_id": "task-42"}}
)

# After collecting human input:
from langgraph.types import Command

graph.invoke(
    Command(resume={"guidance": "Focus on the schema migration step only"}),
    config={"configurable": {"thread_id": "task-42"}}
)
```

## Checkpointing for Production

Threads are the unit of state persistence. Every `invoke` or `stream` call with a `thread_id` is automatically checkpointed. SQLite works for development; PostgreSQL is appropriate for production where you need concurrent access and durability across process restarts.

```python
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg import Connection

conn = Connection.connect(DATABASE_URL)
checkpointer = PostgresSaver(conn)
checkpointer.setup()  # creates tables on first run

graph = builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_review"],  # mandatory pause before this node
)
```

`interrupt_before=["human_review"]` means the graph always pauses before executing that node—an approval gate enforced at the graph level, not inside node logic that could be bypassed by a code change.

## Keeping Cyclic Flows Safe

Three patterns keep cycles bounded: an iteration counter in state (shown above), a timeout at the application layer via `asyncio.wait_for` around the graph call, and a maximum token budget tracked across iterations. For long-running tasks, emit intermediate state via `graph.stream()` so your application layer can make the abort decision externally rather than baking termination logic into the graph alone.

State is the hardest problem. LangGraph doesn't make state easy—it makes state explicit. And explicit is the only foundation you can actually build on in production.
