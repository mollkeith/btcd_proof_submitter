#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / "js" / "_extracted.js").read_text(encoding="utf-8")
lines = src.splitlines()

def dedent_slice(ranges):
    if isinstance(ranges, tuple):
        ranges = [ranges]
    parts = []
    for start, end in ranges:
        chunk = []
        for line in lines[start - 1 : end]:
            chunk.append(line[6:] if line.startswith("      ") else line)
        parts.append("\n".join(chunk).strip())
    return "\n\n".join(parts) + "\n"

JS = ROOT / "js"

def write(name, content):
    (JS / f"_block_{name}.js").write_text(content, encoding="utf-8")

write("config", dedent_slice((1, 40)))
write("abi", dedent_slice((42, 149)))
write("i18n_data", dedent_slice((151, 426)))
write("state", dedent_slice((428, 500)))
write("ui", dedent_slice((502, 658)))
write("utils", dedent_slice((660, 759)))
write("wallet", dedent_slice([(761, 870), (872, 939), (1590, 1681)]))
write("btc", dedent_slice((941, 1043)))
write("validation", dedent_slice((1045, 1104)))
write("proof", dedent_slice((1106, 1244)))
write("submit", dedent_slice((1246, 1588)))
write("init", dedent_slice((1683, 1715)))
print("blocks ok")
