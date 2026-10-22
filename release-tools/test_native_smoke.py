"""Run the actual Mac shell/pages with disposable data and WebKit storage.

Requires ./build.sh first. Does not request the microphone or use personal data.
"""
from pathlib import Path
import json
import plistlib
import shutil
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent.parent
resources = (Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / '雅思词汇听写合集.app') / 'Contents/Resources'
if not resources.is_dir():
    raise SystemExit('Pass a built .app path, or run ./build.sh in the local checkout first')

with tempfile.TemporaryDirectory(prefix='ielts-native-smoke-') as folder:
    folder = Path(folder)
    app = folder / 'Smoke.app'
    binary = app / 'Contents/MacOS/Smoke'
    binary.parent.mkdir(parents=True)
    shutil.copytree(resources, app / 'Contents/Resources')
    with (app / 'Contents/Info.plist').open('wb') as f:
        plistlib.dump({'CFBundleExecutable': 'Smoke', 'CFBundleIdentifier': 'local.ielts.smoke', 'CFBundlePackageType': 'APPL'}, f)
    profile = folder / 'profile'
    profile.mkdir()
    (profile / 'data.json').write_text(json.dumps({'v': 1, 'decks': {
        'notebook': {'list': [{'id': 'a', 'w': 'apple', 'tr': '苹果', 'ww': True, 'sw': True}], 'del': {}},
    }}), encoding='utf-8')
    source = (root / 'src/main.swift').read_text(encoding='utf-8')
    start = source.index('func dataFileURL() -> URL {')
    end = source.index('// Whole-file JSON', start)
    source = source[:start] + 'func dataFileURL() -> URL { URL(fileURLWithPath: CommandLine.arguments[1]).appendingPathComponent("data.json") }\n' + source[end:]
    source = source.replace('config.userContentController = controller', 'config.userContentController = controller\n        config.websiteDataStore = .nonPersistent()')
    source = source.replace('window.makeKeyAndOrderFront(nil)', 'window.orderBack(nil)').replace('NSApp.activate(ignoringOtherApps: true)', '')
    source = source.replace('controller.removeAllUserScripts()', '''controller.removeAllUserScripts()
        controller.addUserScript(WKUserScript(source: "window.__smokeErrors=[]; window.addEventListener('error',function(e){__smokeErrors.push(e.message)});", injectionTime: .atDocumentStart, forMainFrameOnly: true))''')
    source = source.replace('func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {', '''func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { smokeStep() }''')
    source = source.replace('let app = NSApplication.shared', r'''
let smokePages = ["index", "review", "edef", "p1", "vj", "scene", "notebook", "wrong", "notebook"]
var smokeIndex = 0
func smokeStep() {
    let page = smokePages[smokeIndex]
    guard delegate.webView.url?.deletingPathExtension().lastPathComponent == page else { exit(2) }
    let js = "JSON.stringify({ready:document.readyState, errors:window.__smokeErrors, data:typeof IELTSData, review:typeof IELTSReview, words:(window.__INITIAL_STATE__.decks.notebook.list||[]).length})"
    delegate.webView.evaluateJavaScript(js) { value, error in
        guard error == nil, let text = value as? String,
              let data = text.data(using:.utf8), let state = try? JSONSerialization.jsonObject(with:data) as? [String: Any],
              state["ready"] as? String == "complete", state["data"] as? String == "object",
              state["review"] as? String == "object", (state["words"] as? Int) == 1,
              let errors = state["errors"] as? [String], errors.isEmpty else {
            print("FAIL \(page): \(String(describing:value)) \(String(describing:error))"); exit(1)
        }
        print("PASS Mac WKWebView: \(page)")
        smokeIndex += 1
        if smokeIndex == smokePages.count {
            guard delegate.scriptCache.count == 6 else { exit(3) }
            exit(0)
        }
        delegate.loadResource(smokePages[smokeIndex])
    }
}
DispatchQueue.main.asyncAfter(deadline:.now() + 45) { print("FAIL: navigation timeout"); exit(4) }
let app = NSApplication.shared''')
    file = folder / 'smoke.swift'
    file.write_text(source, encoding='utf-8')
    subprocess.run(['swiftc', str(file), '-o', str(binary), '-framework', 'Cocoa', '-framework', 'WebKit'], check=True)
    subprocess.run(['codesign', '--force', '--deep', '-s', '-', str(app)], check=True, capture_output=True)
    subprocess.run([str(binary), str(profile)], check=True, timeout=55)
