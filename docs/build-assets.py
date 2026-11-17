# -*- coding: utf-8 -*-
"""哪都通 · 静态资源打包脚本（v100）

把 index.html 里原本一个个引入的 CSS / JS 合并成 2 个文件，再压缩。
只在“改完源码、要重新出包”时跑一次；服务器上不需要任何构建步骤。

用法（需要 Node + npx，esbuild 会自动下载）：
    python docs/build-assets.py
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, "assets", "css")
JS = os.path.join(ROOT, "assets", "js")

# 顺序必须与旧 index.html 完全一致：CSS 靠后覆盖靠前，JS 是按执行顺序注册监听器的
CSS_ORDER = [
    "main.css",
    "badge-effects-extra.css",
    "ui-polish.css",
    "divination-polish.css",
    "mobile-polish.css",
    "pro-polish.css",
    "pro-tools.css",
    "pro-forum.css",
    "responsive-v2.css",
    "motion-polish.css",
    "guofeng-texture.css",
    "preloader-tone.css",
    "topbar-hide.css",
    "track-realism.css",
]

JS_ORDER = [
    "qrcode.min.js",
    "net-resilience.js",
    "app.js",
    "invite-share.js",
    "ui-polish.js",
    "divination-polish.js",
    "mobile-polish.js",
    "pro-polish.js",
    "pro-tools.js",
    "restrict-tools.js",
    "visit-stat.js",
    "pro-forum.js",
    "patch-fixes.js",
    "mobile-nav.js",
    "visual-polish.js",
    "track-realism.js",
    "topbar-hide.js",
    "intranet-entry.js",
    "sidebar-order.js",
    "bazi-lunar.js",
    "bazi-core.js",
    "bazi.js",
    "login-hud.js",
    "nav-scroll-fix.js",
    # bazi-region.js 故意不打包：由 bazi.js 在需要时按需加载（省 116KB 首屏）
]


def cat(files, base, sep):
    parts = []
    for name in files:
        path = os.path.join(base, name)
        with open(path, encoding="utf-8") as f:
            parts.append("/* ==== %s ==== */\n%s" % (name, f.read()))
    return sep.join(parts)


def esbuild(src, out, args):
    cmd = ["npx", "--yes", "esbuild@0.24.0", src, "--outfile=" + out] + args
    subprocess.run(cmd, check=True, shell=(os.name == "nt"))


def main():
    tmp = os.path.join(ROOT, ".build-tmp")
    os.makedirs(tmp, exist_ok=True)

    css_src = os.path.join(tmp, "bundle.css")
    with open(css_src, "w", encoding="utf-8", newline="\n") as f:
        f.write(cat(CSS_ORDER, CSS, "\n"))
    esbuild(css_src, os.path.join(CSS, "app.bundle.css"), ["--minify"])

    js_src = os.path.join(tmp, "bundle.js")
    with open(js_src, "w", encoding="utf-8", newline="\n") as f:
        # 用 "\n;\n" 分隔，避免某个文件结尾缺分号时和下一个文件粘成一条语句
        f.write(cat(JS_ORDER, JS, "\n;\n"))
    esbuild(js_src, os.path.join(JS, "app.bundle.js"),
            ["--charset=utf8", "--minify-whitespace", "--minify-syntax", "--target=es2018"])

    for f in ("assets/css/app.bundle.css", "assets/js/app.bundle.js"):
        p = os.path.join(ROOT, f.replace("/", os.sep))
        print("%-28s %8d bytes" % (f, os.path.getsize(p)))


if __name__ == "__main__":
    sys.exit(main())
