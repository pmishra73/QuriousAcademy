# Hybrid Search: Combining Vector and Graph Database Indexes

**Category:** RAG & Evaluation
**Read time:** 11 min
**Description:** Why neither vector search nor graph traversal alone is sufficient for enterprise retrieval, and how to combine them correctly.

Ask "Who approved the vendor contract with Acme Corp in Q3?" against a pure vector store: you'll retrieve chunks mentioning "vendor contract" and "Acme Corp." You'll miss the approval chain—the relationship between the contract, the approver, their role, and the approval timestamp—because that relationship lives in structure, not in semantic proximity. The answer isn't near the question in embedding space; it's connected to it through a graph.

Ask the same question against a pure graph database: you'll traverse the contract-to-approver edge precisely, but you'll fail on queries like "find contracts similar to the Acme Corp agreement"—because graph databases don't measure semantic distance. You need both, and combining them correctly requires more than running two queries and merging results.

## Where Vector Search Falls Short

Embedding-based retrieval finds semantically similar passages but is structurally blind. "The contract was approved by the CFO" and "The contract was rejected by the CFO" have nearly identical embeddings despite describing opposite outcomes. Pure vector search retrieves both with similar scores.

Additionally, vector search has a recall floor determined by chunk granularity. If a relevant relationship spans multiple chunks—a contract entity in one chunk, its approval event in another—retrieval may return neither chunk independently because neither has high similarity to the query on its own. The signal is distributed across chunks that the retrieval step never combines.

## Where Graph Traversal Falls Short

Cypher queries are precise but brittle. They require the query to specify relationship types, directions, and entity labels in advance. A query like `MATCH (c:Contract)-[:APPROVED_BY]->(u:User) WHERE c.vendor = 'Acme'` works perfectly for the exact graph shape it was written for, but fails on variations: a contract approved through a workflow node rather than directly, a vendor name stored with different casing, a user stored as a contractor with a different label.

Graph traversal also can't handle queries where the graph structure itself is unknown—"find documents relevant to our current compliance posture" requires semantic understanding, not just traversal.

## Neo4j's Native Vector Index

Neo4j supports vector indexes natively since version 5.11. You embed node properties and index them, then issue vector similarity queries directly in Cypher—which means you can combine semantic recall and graph traversal in a single query round-trip.

```cypher
// Create vector index on Contract nodes
CREATE VECTOR INDEX contract_embeddings IF NOT EXISTS
FOR (c:Contract) ON (c.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}

// Inline hybrid: vector recall + immediate graph traversal
CALL db.index.vector.queryNodes(
    'contract_embeddings', 10, $query_embedding
)
YIELD node AS contract, score AS vector_score
MATCH (contract)-[:APPROVED_BY]->(approver:User)-[:HAS_ROLE]->(role:Role)
WHERE vector_score > 0.75
RETURN
    contract.id,
    contract.value,
    approver.name,
    role.name,
    vector_score
ORDER BY vector_score DESC
```

This is the key capability: a single Cypher query that uses vector similarity for the initial recall step, then immediately traverses the graph for structural enrichment. The LLM receives not just similar documents but the structured relationships surrounding them—all in one database round-trip.

## Parallel Hybrid with Reciprocal Rank Fusion

When you run separate vector and graph queries against different systems, you need a fusion strategy that doesn't require normalizing scores across incompatible scales. Reciprocal Rank Fusion provides a robust merge that depends only on rank order, not raw scores:

```python
def reciprocal_rank_fusion(
    result_sets: list[list[str]],  # each list is ranked doc_ids, best first
    k: int = 60
) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}

    for result_set in result_sets:
        for rank, doc_id in enumerate(result_set, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank)

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

RRF's constant `k = 60` is the damping factor. A document ranked 1st in both result sets receives score `1/61 + 1/61 ≈ 0.033`. A document ranked 5th in one list and absent from the other receives `1/65 ≈ 0.015`. Documents appearing in multiple result sets are rewarded proportionally to how well they ranked in each—without requiring any score normalization across different retrieval systems.

## Structuring the Full Pipeline

A production hybrid retrieval pipeline with query routing looks like this:

```python
async def hybrid_retrieve(
    query: str,
    query_embedding: list[float],
    top_k: int = 8,
) -> list[dict]:
    # Classify query intent: structural or semantic?
    intent = await classify_query_intent(query)

    if intent == "structural":
        # Inline Neo4j hybrid: vector recall + graph traversal
        return await neo4j.query(INLINE_HYBRID_CYPHER, {
            "query_embedding": query_embedding,
            "k": top_k
        })

    elif intent == "semantic":
        # Pure vector: faster, no graph join overhead
        return await vector_store.query(query_embedding, top_k=top_k)

    else:
        # Parallel: run both and fuse
        vector_results, graph_results = await asyncio.gather(
            vector_store.query(query_embedding, top_k=top_k * 2),
            neo4j.query(GRAPH_ONLY_CYPHER, {"query": query}),
        )
        fused = reciprocal_rank_fusion([
            [r["id"] for r in vector_results],
            [r["id"] for r in graph_results],
        ])
        doc_ids = [doc_id for doc_id, _ in fused[:top_k]]
        return await fetch_docs_by_ids(doc_ids)
```

## Architecture Decision: Inline vs. Parallel

Two patterns exist for combining retrieval modes. **Inline hybrid** (the Neo4j Cypher example) issues one query that handles both semantic recall and structural traversal in a single database. It's faster (one round-trip), more precise, and simpler operationally. **Parallel hybrid** runs vector and graph queries against separate systems and fuses with RRF. It's more flexible—your vector store can stay as Pinecone or Weaviate—and each system can be tuned independently.

For teams already committed to Neo4j, inline hybrid is the clear choice—the vector index in Neo4j is mature and the single-query architecture is simpler to operate. For teams with existing vector infrastructure they don't want to replace, parallel hybrid with RRF gets you most of the benefit at less migration cost.

The choice between vector search and graph traversal is a false one. The queries your users actually ask live in both worlds simultaneously.
