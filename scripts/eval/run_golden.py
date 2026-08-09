import json
import os
import sys
import time
import asyncio
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = os.environ.get("EVAL_API_URL", "http://localhost:3000/api/v1/chat/query")
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tests", "eval", "golden_dataset.jsonl")
REPORT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs", "eval_report_latest.md")

THRESHOLDS = {
    "retrieval_mean": 0.85,
    "factuality_mean": 0.90,
    "forbidden_total": 0,
    "rejection_acc": 1.00,
    "edge_in_scope_acc": 1.00,
}

POI_NAME_MAP = {}
csv_master_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "tri_ton_master_cleaned.csv")
if os.path.exists(csv_master_path):
    import csv
    with open(csv_master_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            POI_NAME_MAP[row['id'].strip().upper()] = row['name'].strip()

def call_chat_api(query: str, session_id: str = "eval-runner"):
    payload = json.dumps({"query": query, "session_id": session_id}).encode('utf-8')
    req = urllib.request.Request(API_URL, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            if res.status == 200:
                data = json.loads(res.read().decode('utf-8'))
                return data
    except Exception as e:
        print(f"[API Error] Failed query '{query}': {e}")
    return {"text_response": "", "places": []}

def score_case(case: dict, api_res: dict) -> dict:
    import unicodedata
    def norm(s: str) -> str:
        return unicodedata.normalize('NFC', s.lower()) if s else ""

    text_resp = api_res.get("text_response", "")
    r_lower = norm(text_resp)
    
    # Extract retrieved POI IDs / slugs (support raw ID, slug, and text_response content matching)
    places = api_res.get("places", [])
    retrieved_ids = []
    for p in places:
        if not p: continue
        if p.get("id"): retrieved_ids.append(str(p["id"]).upper())
        if p.get("slug"):
            slug_upper = str(p["slug"]).upper()
            retrieved_ids.append(slug_upper)
            import re
            m = re.search(r'[A-Z]{2}\d{3}', slug_upper)
            if m: retrieved_ids.append(m.group(0))

    # Also extract POI IDs or POI names present directly in text_response
    import re
    text_poi_ids = re.findall(r'[A-Z]{2}\d{3}', text_resp.upper())
    retrieved_ids.extend(text_poi_ids)

    res = {
        "id": case["id"],
        "q": case["q"],
        "intent": case["intent"],
        "type": case["type"],
        "retrieval_score": None,
        "factuality_score": None,
        "forbidden_hit": False,
        "forbidden_phrases": [],
        "pass": False,
        "text_preview": text_resp[:150] + "..." if len(text_resp) > 150 else text_resp
    }

    # 1. Retrieval Hit Score (match via POI ID, Slug, or POI Name presence in response)
    target_pois = [str(x).upper() for x in case.get("pois", [])]
    if target_pois:
        # Load POI name mapping from csv if needed
        matched_count = 0
        for poi_id in target_pois:
            if poi_id in retrieved_ids:
                matched_count += 1
            elif poi_id in POI_NAME_MAP:
                p_name_norm = norm(POI_NAME_MAP[poi_id])
                if p_name_norm in r_lower:
                    matched_count += 1
        res["retrieval_score"] = round(matched_count / len(target_pois), 2)

    # 2. Factuality Score
    facts = case.get("facts", [])
    if facts:
        fact_matches = sum(1 for f in facts if norm(f) in r_lower)
        res["factuality_score"] = round(fact_matches / len(facts), 2)

    # 3. Forbidden Hit (Hallucination Check)
    forbid = case.get("forbid", [])
    hit_phrases = [x for x in forbid if norm(x) in r_lower]
    if hit_phrases:
        res["forbidden_hit"] = True
        res["forbidden_phrases"] = hit_phrases

    # 4. Rejection & Edge-in-scope evaluation
    test_type = case.get("type")
    if test_type == "rejection":
        res["pass"] = "chỉ hỗ trợ" in r_lower
    elif test_type == "edge_in_scope":
        res["pass"] = "chỉ hỗ trợ" not in r_lower
    else:
        # Default pass logic: high factuality, high retrieval, no forbidden hits
        ret_ok = res["retrieval_score"] is None or res["retrieval_score"] >= 0.5
        fact_ok = res["factuality_score"] is None or res["factuality_score"] >= 0.5
        forbid_ok = not res["forbidden_hit"]
        res["pass"] = ret_ok and fact_ok and forbid_ok

    return res

def run_evaluation():
    print(f"🚀 Launching Golden Dataset Evaluation on API: {API_URL}")
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset not found at: {DATASET_PATH}")
        sys.exit(1)

    cases = []
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                cases.append(json.loads(line.strip()))

    print(f"Loaded {len(cases)} test cases from golden_dataset.jsonl")

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def process_one(idx_case):
        idx, case = idx_case
        time.sleep(0.2) # Avoid LLM API rate limits
        print(f"[{idx}/{len(cases)}] Testing ({case['id']} - {case['type']}): {case['q']}")
        api_res = call_chat_api(case["q"], session_id=f"eval-{case['id']}")
        s = score_case(case, api_res)
        return (idx, s)

    results_map = {}
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(process_one, (idx, case)) for idx, case in enumerate(cases, 1)]
        for future in as_completed(futures):
            idx, res = future.result()
            results_map[idx] = res

    # Sort back by original case order
    results = [results_map[i] for i in sorted(results_map.keys())]
    elapsed = round(time.time() - t0, 2)

    # Compute Aggregate Metrics
    ret_scores = [r["retrieval_score"] for r in results if r["retrieval_score"] is not None]
    fact_scores = [r["factuality_score"] for r in results if r["factuality_score"] is not None]
    forbidden_hits = [r for r in results if r["forbidden_hit"]]
    rejection_cases = [r for r in results if r["type"] == "rejection"]
    edge_in_scope_cases = [r for r in results if r["type"] == "edge_in_scope"]

    ret_mean = round(sum(ret_scores) / len(ret_scores), 4) if ret_scores else 0.0
    fact_mean = round(sum(fact_scores) / len(fact_scores), 4) if fact_scores else 0.0
    rejection_acc = round(sum(1 for r in rejection_cases if r["pass"]) / len(rejection_cases), 4) if rejection_cases else 1.0
    edge_acc = round(sum(1 for r in edge_in_scope_cases if r["pass"]) / len(edge_in_scope_cases), 4) if edge_in_scope_cases else 1.0
    forbid_total = len(forbidden_hits)

    pass_all_thresholds = (
        ret_mean >= THRESHOLDS["retrieval_mean"] and
        fact_mean >= THRESHOLDS["factuality_mean"] and
        forbid_total <= THRESHOLDS["forbidden_total"] and
        rejection_acc >= THRESHOLDS["rejection_acc"] and
        edge_acc >= THRESHOLDS["edge_in_scope_acc"]
    )

    # Generate Markdown Report
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("# 📊 Golden Dataset AI Chat Evaluation Report\n\n")
        f.write(f"- **Execution Time**: {elapsed}s\n")
        f.write(f"- **Total Test Cases**: {len(cases)}\n")
        f.write(f"- **Status**: {'✅ PASSED (All Criteria Met)' if pass_all_thresholds else '⚠️ NEEDS IMPROVEMENT'}\n\n")

        f.write("## 🎯 Benchmark Summary Matrix\n\n")
        f.write("| Metric | Target | Actual Score | Status |\n")
        f.write("|---|---|---|---|\n")
        f.write(f"| Retrieval Mean (@top-4) | >= {THRESHOLDS['retrieval_mean']} | {ret_mean:.2f} | {'✅ PASS' if ret_mean >= THRESHOLDS['retrieval_mean'] else '❌ FAIL'} |\n")
        f.write(f"| Factuality Mean | >= {THRESHOLDS['factuality_mean']} | {fact_mean:.2f} | {'✅ PASS' if fact_mean >= THRESHOLDS['factuality_mean'] else '❌ FAIL'} |\n")
        f.write(f"| Forbidden Hits (Hallucinations) | == {THRESHOLDS['forbidden_total']} | {forbid_total} | {'✅ PASS' if forbid_total == THRESHOLDS['forbidden_total'] else '❌ FAIL'} |\n")
        f.write(f"| Rejection Accuracy | == {THRESHOLDS['rejection_acc']} | {rejection_acc*100:.1f}% | {'✅ PASS' if rejection_acc >= THRESHOLDS['rejection_acc'] else '❌ FAIL'} |\n")
        f.write(f"| Edge-in-Scope Pass Rate | == {THRESHOLDS['edge_in_scope_acc']} | {edge_acc*100:.1f}% | {'✅ PASS' if edge_acc >= THRESHOLDS['edge_in_scope_acc'] else '❌ FAIL'} |\n\n")

        f.write("## 🔍 Detailed Case Results\n\n")
        f.write("| ID | Intent | Query | Ret Score | Fact Score | Forbidden | Pass |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        for r in results:
            ret_str = f"{r['retrieval_score']:.2f}" if r['retrieval_score'] is not None else "N/A"
            fact_str = f"{r['factuality_score']:.2f}" if r['factuality_score'] is not None else "N/A"
            forb_str = "⚠️ YES" if r["forbidden_hit"] else "NO"
            pass_str = "✅ PASS" if r["pass"] else "❌ FAIL"
            f.write(f"| {r['id']} | {r['intent']} | {r['q']} | {ret_str} | {fact_str} | {forb_str} | {pass_str} |\n")

    print("\n==================================================")
    print(f"📊 REPORT GENERATED: {REPORT_PATH}")
    print(f"Execution Time: {elapsed}s")
    print(f"Status: {'✅ ACCEPTANCE PASSED' if pass_all_thresholds else '⚠️ BELOW ACCEPTANCE THRESHOLD'}")
    print(f"Retrieval Mean: {ret_mean:.2f} (Target: >= {THRESHOLDS['retrieval_mean']})")
    print(f"Factuality Mean: {fact_mean:.2f} (Target: >= {THRESHOLDS['factuality_mean']})")
    print(f"Forbidden Hits: {forbid_total} (Target: 0)")
    print(f"Rejection Accuracy: {rejection_acc*100:.1f}% (Target: 100%)")
    print(f"Edge-in-Scope Pass Rate: {edge_acc*100:.1f}% (Target: 100%)")
    print("==================================================")

if __name__ == "__main__":
    run_evaluation()
