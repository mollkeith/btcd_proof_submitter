#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "js"

def read(name):
    return (JS / f"_block_{name}.js").read_text(encoding="utf-8")

def write(name, content):
    (JS / name).write_text(content.rstrip() + "\n", encoding="utf-8")

def export_const(code, names):
    for n in names:
        code = code.replace(f"const {n}", f"export const {n}", 1)
    return code

# Regenerate blocks first
import subprocess
subprocess.run(["python3", str(ROOT / "scripts" / "gen_modules.py"),], check=True)

write("config.js", export_const(read("config"), ["NETWORKS", "BTC_APIS", "MIN_CONFIRMATIONS"]))
config_js = (JS / "config.js").read_text(encoding="utf-8")
if "MIN_CONFIRMATIONS" not in config_js:
    (JS / "config.js").write_text(config_js.rstrip() + "\n\nexport const MIN_CONFIRMATIONS = 3;\n", encoding="utf-8")

abi = export_const(read("abi"), ["ORDER_ABI", "ISSUER_ABI", "ERROR_ABI", "ERROR_INTERFACE"])
write("abi.js", abi)

i18n = export_const(read("i18n_data"), ["LANG_STORAGE_KEY", "I18N"])
write("i18n.js", i18n)

state = export_const(read("state"), ["state", "elements"])
write("state.js", 'import { LANG_STORAGE_KEY } from "./i18n.js";\n\n' + state)

app_parts = ["ui", "utils", "wallet", "btc", "validation", "proof", "submit", "init"]
app = "\n\n".join(read(p) for p in app_parts)
app = app.replace("function init()", "export function init()")
app = app.replace("\ninit();", "")
write(
    "app.js",
    """import { NETWORKS, BTC_APIS, MIN_CONFIRMATIONS } from "./config.js";
import { ORDER_ABI, ISSUER_ABI, ERROR_INTERFACE } from "./abi.js";
import { LANG_STORAGE_KEY, I18N } from "./i18n.js";
import { state, elements } from "./state.js";

"""
    + app,
)

write("main.js", 'import { init } from "./app.js";\n\ninit();\n')

print("done")
