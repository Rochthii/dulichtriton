import json
import os
import sys
import logging
import asyncio

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("rag_evaluator")

from tourism_ai_core.orchestrator.ai_orchestrator import AIOrchestrator

async def evaluate_rag():
    logger.info("=== STARTING AUTOMATED RAG EVALUATION SUITE ===")
    
    golden_path = "tests/golden_dataset.json"
    if not os.path.exists(golden_path):
        logger.error(f"Golden dataset not found at {golden_path}")
        return

    with open(golden_path, "r", encoding="utf-8") as f:
        golden_cases = json.load(f)

    orchestrator = AIOrchestrator()
    passed_tests = 0

    for test in golden_cases:
        t_id = test["id"]
        query = test["query"]
        expected_place = test["ground_truth_place"]
        banned = test.get("banned_phrases", [])

        logger.info(f"[{t_id}] Querying: '{query}'")
        res = await orchestrator.process_user_request(f"eval-{t_id}", query)
        text_ans = res.get("text_response", "")

        # Check banned terms
        has_banned = any(b in text_ans for b in banned)
        if has_banned:
            logger.error(f"[{t_id}] FAILED: Banned term found in response!")
            continue

        # Check keyword matches
        keywords_matched = sum(1 for kw in test["expected_keywords"] if kw.lower() in text_ans.lower())
        accuracy = (keywords_matched / len(test["expected_keywords"])) * 100.0 if test["expected_keywords"] else 100.0

        if accuracy >= 75.0:
            passed_tests += 1
            logger.info(f"[{t_id}] PASSED! Accuracy Score: {accuracy:.1f}%")
        else:
            logger.warning(f"[{t_id}] LOW ACCURACY: {accuracy:.1f}%")

    overall_faithfulness = (passed_tests / len(golden_cases)) * 100.0
    logger.info("==================================================")
    logger.info(f"RAG EVALUATION COMPLETED: {passed_tests}/{len(golden_cases)} Passed")
    logger.info(f"Overall Faithfulness & Accuracy Score: {overall_faithfulness:.1f}%")
    logger.info("==================================================")

def main():
    asyncio.run(evaluate_rag())

if __name__ == "__main__":
    main()
