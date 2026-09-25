from typing import List, Optional
from app.rag.vector_store import vector_store
from app.rag.schema import RetrievalResult

class KnowledgeRetriever:
    """
    Retrieves verified documents with source verification and strict guardrails.
    Prioritizes Tier 1 (Primary Sources) over Tier 2.
    """
    def __init__(self):
        self.store = vector_store

    def retrieve(
        self,
        query: str,
        framework: Optional[str] = None,
        top_k: int = 3
    ) -> List[RetrievalResult]:
        # First attempt: search Tier 1 (PRIMARY) sources
        primary_results = self.store.search(
            query=query,
            top_k=top_k,
            framework=framework,
            source_type="PRIMARY"
        )
        
        # If we have strong primary results (score > 0.15), return them
        if primary_results and primary_results[0].score >= 0.15:
            return primary_results

        # Otherwise, hybrid search across all sources
        all_results = self.store.search(
            query=query,
            top_k=top_k,
            framework=framework
        )
        return all_results

retriever = KnowledgeRetriever()
