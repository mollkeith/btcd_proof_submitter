#!/usr/bin/env python3
"""One-time helper to split index.html into css/, js/ modules."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

css_match = re.search(r"<style>(.*?)</style>", html, re.DOTALL)
body_match = re.search(r"<body>(.*?)\s*<script src=", html, re.DOTALL)
script_match = re.search(r"<script>\s*(.*?)\s*</script>\s*</body>", html, re.DOTALL)

if not css_match or not body_match or not script_match:
    raise SystemExit("Failed to parse index.html sections")

css = css_match.group(1).strip()
body = body_match.group(1).strip()
js = script_match.group(1)

(ROOT / "css").mkdir(exist_ok=True)
(ROOT / "js").mkdir(exist_ok=True)
(ROOT / "css" / "styles.css").write_text(css + "\n", encoding="utf-8")
(ROOT / "js" / "_extracted.js").write_text(js, encoding="utf-8")
(ROOT / "_body_fragment.html").write_text(body + "\n", encoding="utf-8")
print("OK", len(css), len(body), len(js))
