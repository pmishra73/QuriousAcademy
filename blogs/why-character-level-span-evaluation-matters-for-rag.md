# Why Character-Level Span Evaluation Matters for RAG

**Category:** RAG & Evaluation
**Read time:** 10 min
**Description:** Why aggregate RAG faithfulness scores hide the root cause of failures, and how character-level span evaluation pinpoints which pipeline stage broke.

Your RAG pipeline scores 0.82 on faithfulness. Your users still complain. These two facts are not contradictory—they point to the same underlying problem: aggregate metrics measure answer quality but cannot diagnose retrieval failure.

When a generated answer contains a hallucination, there are exactly four possible causes. The relevant passage was never retrieved. The passage was retrieved but ranked below the context window cutoff. The passage was retrieved and ranked correctly but the LLM ignored it. Or the LLM synthesized correctly from a passage that was itself wrong. A faithfulness score of 0.82 cannot distinguish between these cases. Character-level span evaluation can.

## What a Span Is

A span is a tuple `(doc_id, char_start, char_end)` that identifies a specific substring within a source document. When you evaluate a RAG answer using character-level spans, you're asking: for each claim in the generated answer, can I find a span in the source corpus that supports it?

The power of this framing is that it connects evaluation directly back to the retrieval index. If claim C is supported by span S, and S lies within a chunk ranked 12th and therefore excluded from the context window, you've diagnosed a rank failure—not a synthesis failure. That distinction tells you to tune your ranker, not your prompt.

> Aggregate metrics tell you how bad things are. Span evaluation tells you why—and where in the pipeline to fix it.

## Mapping Answers to Source Offsets

The core operation is claim decomposition followed by span extraction. Given a generated answer and the full source corpus, you decompose the answer into atomic verifiable claims, then find the specific character range in the corpus that best supports each claim.

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Span:
    doc_id: str
    char_start: int
    char_end: int
    text: str
    claim: str
    support_score: float

def extract_spans(
    answer: str,
    chunks: list[dict],  # [{doc_id, text, char_offset_in_doc}]
    llm_judge,
) -> list[Optional[Span]]:
    claims = decompose_to_claims(answer, llm_judge)
    return [find_best_supporting_span(c, chunks, llm_judge) for c in claims]
```

`decompose_to_claims` uses an LLM to break the answer into independent, verifiable statements. `find_best_supporting_span` scores each chunk against each claim and identifies the minimal substring that provides support—not just the chunk boundary, but the specific character range within it:

```python
def find_best_supporting_span(
    claim: str,
    chunks: list[dict],
    llm_judge,
) -> Optional[Span]:
    candidates = []

    for chunk in chunks:
        result = llm_judge.invoke({
            "task": "span_extraction",
            "claim": claim,
            "passage": chunk["text"],
        })
        # result: {supported: bool, span_text: str, confidence: float}

        if result["supported"]:
            offset = chunk["char_offset"]
            start = offset + chunk["text"].find(result["span_text"])
            candidates.append(Span(
                doc_id=chunk["doc_id"],
                char_start=start,
                char_end=start + len(result["span_text"]),
                text=result["span_text"],
                claim=claim,
                support_score=result["confidence"],
            ))

    return max(candidates, key=lambda s: s.support_score) if candidates else None
```

## A Taxonomy of Retrieval Failures

Once you have spans, you can classify each unsupported claim into one of four buckets. The classification logic is what turns raw evaluation into a diagnostic tool:

```python
def diagnose_claim(
    claim: str,
    span: Optional[Span],
    retrieved_doc_ids: set[str],
    corpus_chunks: list[dict],
    llm_judge,
) -> str:
    if span is None:
        # Check corpus-wide — was this ever retrievable?
        if not any_corpus_support(claim, corpus_chunks, llm_judge):
            return "hallucination"    # LLM invented this
        else:
            return "retrieval_miss"   # exists but wasn't fetched

    if span.doc_id not in retrieved_doc_ids:
        return "rank_failure"         # retrieved but cut off by window

    if span.support_score < 0.6:
        return "synthesis_error"      # retrieved correctly, misread

    return "correct"
```

## What the Taxonomy Unlocks

Each failure category points to a different fix.

- **Retrieval miss** — your embedding model isn't capturing the relevant semantic domain. Consider domain-adaptive fine-tuning or hybrid retrieval.
- **Rank failure** — your reranker is deprioritizing the right chunks. Inspect reranker inputs and consider cross-encoder reranking with more context.
- **Synthesis error** — the LLM is misreading correctly-retrieved content. Check for chunking artifacts, truncation, or prompt formatting issues.
- **Hallucination** — the answer has no grounding in the corpus at all. A fundamental generation constraint to apply.

At enterprise scale, you can aggregate this taxonomy across your document corpus. If 40% of failures are rank failures concentrated in documents with complex metadata headers, you know to invest in metadata-aware chunking. If 30% are retrieval misses on one document type, your embedding model is underperforming on that domain. These are roadmaps, not scores.

## Implementation Notes

The LLM judge for span extraction should be a capable model with a structured output schema. Use JSON mode or structured outputs to ensure `span_text` is always a substring of the passage you sent—hallucinated span text produces garbage offsets. Validate this with an exact-match check before computing character offsets.

Cache judge calls aggressively. The same claim-passage pair will be evaluated many times across test runs. A simple content-hash key over `(claim, passage_md5)` eliminates most redundant API calls in development.

Faithfulness at 0.82 is a number. A breakdown of 12% retrieval_miss, 6% rank_failure, 2% synthesis_error is a roadmap. Build the second kind of evaluation first.
