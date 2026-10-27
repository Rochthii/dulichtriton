"""Test get_allowed_origins() trong backend/main.py mà không cần FastAPI/Supabase.

Lý do: main.py import FastAPI + Supabase ở top-level, và tạo Supabase client
ngay khi import, nên test này trích đúng hàm thuần (chỉ dùng os.getenv)
ra khỏi file và chạy nó, thay vì import cả module.
"""
import ast
import os
import sys

MAIN_PY = os.path.join(os.path.dirname(__file__), "..", "backend", "main.py")


def load_get_allowed_origins():
    source = open(MAIN_PY, encoding="utf-8").read()
    tree = ast.parse(source)
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name == "get_allowed_origins":
            code = ast.Module(body=[node], type_ignores=[])
            namespace = {"os": os}
            exec(compile(code, MAIN_PY, "exec"), namespace)
            return namespace["get_allowed_origins"]
    raise AssertionError("không tìm thấy get_allowed_origins() trong backend/main.py")


def run_case(env_value, expected):
    if env_value is None:
        os.environ.pop("BACKEND_CORS_ORIGINS", None)
    else:
        os.environ["BACKEND_CORS_ORIGINS"] = env_value
    fn = load_get_allowed_origins()
    got = fn()
    assert got == expected, f"env={env_value!r}: got {got!r}, expected {expected!r}"
    assert "*" not in got, f"wildcard '*' không được phép: {got!r}"
    print(f"PASS env={env_value!r} -> {got!r}")


def main():
    # 1. Không đặt biến -> chỉ localhost dev, fail-closed
    run_case(None, ["http://localhost:3000", "http://127.0.0.1:3000"])
    # 2. Đặt 1 domain production
    run_case("https://dulichtriton.vercel.app", ["https://dulichtriton.vercel.app"])
    # 3. Nhiều domain, có khoảng trắng, trailing slash, trùng lặp
    run_case(
        " https://a.example.com/ , https://b.example.com, https://a.example.com ",
        ["https://a.example.com", "https://b.example.com"],
    )
    # 4. "*" bị loại bỏ hoàn toàn, không rơi về wildcard mà về localhost
    run_case("*", ["http://localhost:3000", "http://127.0.0.1:3000"])
    run_case(
        "*, https://a.example.com",
        ["https://a.example.com"],
    )
    # 5. Chuỗi rỗng -> localhost
    run_case("", ["http://localhost:3000", "http://127.0.0.1:3000"])
    print("ALL 6 CASES PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
