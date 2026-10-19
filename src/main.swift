import Cocoa
import WebKit
import UniformTypeIdentifiers

let APP_NAME = "雅思词汇听写合集"
let DATA_DIR = "IELTSVocab"
var reportDataError: ((String) -> Void)?
var reportCorrupt: (() -> Void)?
let CORRUPT_TEXT = "学习数据文件 data.json 无法读取，已停止保存，原文件保持不动。请在菜单「学习数据 → 从最近的有效备份恢复…」恢复后再继续练习。"

func backupDirectory() throws -> URL {
    let dir = dataFileURL().deletingLastPathComponent().appendingPathComponent("backups")
    try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir
}
func backupRoot(_ root: [String: Any], reason: String = "daily") throws {
    let dir = try backupDirectory()
    let stamp = ISO8601DateFormatter().string(from: Date())
    let name = reason == "daily" ? String(stamp.prefix(10)) : UUID().uuidString
    let url = dir.appendingPathComponent("\(reason)-\(name).json")
    if !FileManager.default.fileExists(atPath: url.path) {
        let wrapped: [String: Any] = ["format":"IELTSVocabBackup", "version":1, "createdAt":stamp, "data":root]
        try JSONSerialization.data(withJSONObject: wrapped, options: [.prettyPrinted, .sortedKeys]).write(to: url, options: .atomic)
    }
    if reason == "daily" {
        let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
            .filter { $0.lastPathComponent.hasPrefix("daily-") && $0.pathExtension == "json" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
        for file in files.prefix(max(0, files.count - 30)) { try FileManager.default.removeItem(at: file) }
    }
}
func writeRoot(_ root: [String: Any]) throws {
    try JSONSerialization.data(withJSONObject: root, options: [.prettyPrinted, .sortedKeys]).write(to: dataFileURL(), options: .atomic)
}
func rememberDaily(_ deck: inout [String: Any], _ daily: [String: Any]?) {
    guard let daily = daily, let date = daily["date"] as? String, !date.isEmpty else { return }
    var history = deck["history"] as? [String: Any] ?? [:]
    let parts = date.split(separator: "-").compactMap { Int($0) }
    guard parts.count == 3 else { return }
    let key = String(format: "%04d-%02d-%02d", parts[0], parts[1], parts[2])
    var normalized = daily; normalized["date"] = key
    history[key] = mergeDaily(history[key] as? [String: Any], normalized)
    deck["history"] = history
}

func dataFileURL() -> URL {
    let fm = FileManager.default
    let base = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
    let dir = base.appendingPathComponent(DATA_DIR, isDirectory: true)
    if !fm.fileExists(atPath: dir.path) {
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
    }
    return dir.appendingPathComponent("data.json")
}

// Whole-file JSON string, injected into every deck page as window.__INITIAL_STATE__.
func loadData() -> String {
    if let s = try? String(contentsOf: dataFileURL(), encoding: .utf8),
       !s.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        return s
    }
    return "{}"
}

// MARK: merge-begin — Merge (NOT replace) one deck's payload into data.json.
// Replacing wholesale caused a real data-loss race: progress the phone pushed via the
// sync server while the Mac app sat open got clobbered by the Mac page's next persist.
// Semantics mirror server.py merge(): prog per-key newer-record-wins, notebook/wrong
// union by word with deletion tombstones, daily same-date max, review ledger per track.
func isEmptyVal(_ v: Any?) -> Bool {
    if v == nil || v is NSNull { return true }
    if let s = v as? String { return s.isEmpty }
    if let a = v as? [Any] { return a.isEmpty }
    return false
}
func boxOf(_ e: Any?) -> Int {
    (((e as? [String: Any])?["box"]) as? NSNumber)?.intValue ?? 0
}
func stampOf(_ e: Any?) -> Double {
    (((e as? [String: Any])?["t"]) as? NSNumber)?.doubleValue ?? 0
}
// Records written since the review update carry t (ms of the last change): the later
// one wins, so a fresh mistake lowers the saved level instead of being swallowed by an
// older, higher box. Two records without t keep the old rule; >= (not >) there so
// same-box updates from this page (star/counters) still apply.
func progressWins(_ new: Any?, over old: Any?) -> Bool {
    let nt = stampOf(new), ot = stampOf(old)
    if nt > 0 || ot > 0 { return nt >= ot }
    return boxOf(new) >= boxOf(old)
}
func mergeReview(existing: [String: Any]?, payload: [String: Any]) -> [String: Any] {
    var items = (existing?["items"] as? [String: Any]) ?? [:]
    for (k, v) in (payload["items"] as? [String: Any]) ?? [:] {
        guard let inc = v as? [String: Any] else { continue }
        guard let old = items[k] as? [String: Any] else { items[k] = inc; continue }
        let incNewer = stampOf(inc) > stampOf(old)
        var rec = incNewer ? old : inc
        for (f, x) in (incNewer ? inc : old) { rec[f] = x }
        var src: [String] = []
        for s in ((old["src"] as? [Any]) ?? []) + ((inc["src"] as? [Any]) ?? []) {
            if let name = s as? String, !src.contains(name) { src.append(name) }
        }
        rec["src"] = src
        for name in ["d", "m"] {
            let a = old[name] as? [String: Any], b = inc[name] as? [String: Any]
            if let a = a, let b = b { rec[name] = stampOf(b) > stampOf(a) ? b : a }
            else if let one = a ?? b { rec[name] = one }
        }
        rec["t"] = max(stampOf(old), stampOf(inc))
        items[k] = rec
    }
    var meta = (existing?["meta"] as? [String: Any]) ?? [:]
    let incoming = (payload["meta"] as? [String: Any]) ?? [:]
    for (k, v) in incoming where k != "cap" && k != "capT" {
        if let n = v as? NSNumber { meta[k] = max((meta[k] as? NSNumber)?.doubleValue ?? 0, n.doubleValue) }
        else if meta[k] == nil { meta[k] = v }
    }
    if ((incoming["capT"] as? NSNumber)?.doubleValue ?? 0) > ((meta["capT"] as? NSNumber)?.doubleValue ?? 0) {
        meta["cap"] = incoming["cap"]; meta["capT"] = incoming["capT"]
    }
    return ["items": items, "meta": meta]
}
func tsOf(_ e: [String: Any]) -> Double {
    (e["ts"] as? NSNumber)?.doubleValue ?? 0
}
func dateTuple(_ s: Any?) -> [Int] {
    ((s as? String) ?? "").split(separator: "-").map { Int($0) ?? 0 }
}
func mergeDaily(_ old: [String: Any]?, _ new: [String: Any]) -> [String: Any] {
    guard let old = old, !old.isEmpty else { return new }
    if (old["date"] as? String) == (new["date"] as? String) {
        return ["date": new["date"] ?? "",
                "done": max((old["done"] as? NSNumber)?.intValue ?? 0, (new["done"] as? NSNumber)?.intValue ?? 0),
                "ok":   max((old["ok"] as? NSNumber)?.intValue ?? 0, (new["ok"] as? NSNumber)?.intValue ?? 0)]
    }
    let ot = dateTuple(old["date"]), nt = dateTuple(new["date"])
    return nt.lexicographicallyPrecedes(ot) ? old : new
}
// Daily answer log (srs.js IELTSStats): per day and device the record with more answers
// wins, so devices add up and a record synced twice still counts once.
func mergeStats(existing: [String: Any]?, payload: [String: Any]) -> [String: Any] {
    var days = (existing?["days"] as? [String: Any]) ?? [:]
    for (date, raw) in (payload["days"] as? [String: Any]) ?? [:] {
        guard let day = raw as? [String: Any] else { continue }
        var mine = (days[date] as? [String: Any]) ?? [:]
        for (dev, rec) in day {
            guard let r = rec as? [String: Any] else { continue }
            let n = (r["n"] as? NSNumber)?.intValue ?? 0
            let old = ((mine[dev] as? [String: Any])?["n"] as? NSNumber)?.intValue ?? 0
            if mine[dev] == nil || n > old { mine[dev] = r }
        }
        days[date] = mine
    }
    return ["days": days]
}
func mergeDeckPayload(existing: [String: Any]?, deck: String, payload: [String: Any]) -> [String: Any] {
    var cur = existing ?? [:]
    if deck == "notebook" || deck == "wrong" {
        let key = deck == "notebook" ? "w" : "en"
        var dl = (cur["del"] as? [String: Any]) ?? [:]           // tombstones: newest deletion wins
        for (k, v) in (payload["del"] as? [String: Any]) ?? [:] {
            let nv = (v as? NSNumber)?.doubleValue ?? 0
            if nv > ((dl[k] as? NSNumber)?.doubleValue ?? 0) { dl[k] = v }
        }
        func dead(_ e: [String: Any]) -> Bool {
            guard let k = (e[key] as? String)?.lowercased(), !k.isEmpty,
                  let dv = (dl[k] as? NSNumber)?.doubleValue else { return false }
            return tsOf(e) <= dv
        }
        var lst = ((cur["list"] as? [Any]) ?? []).compactMap { $0 as? [String: Any] }.filter { !dead($0) }
        var idx: [String: Int] = [:]
        for (i, e) in lst.enumerated() { if let k = (e[key] as? String)?.lowercased() { idx[k] = i } }
        for raw in (payload["list"] as? [Any]) ?? [] {
            guard let e = raw as? [String: Any],
                  let k = (e[key] as? String)?.lowercased(), !k.isEmpty, !dead(e) else { continue }
            if let i = idx[k] {
                var o = lst[i]
                if deck == "wrong" {
                    o["n"] = max((o["n"] as? NSNumber)?.intValue ?? 1, (e["n"] as? NSNumber)?.intValue ?? 1)
                    if tsOf(e) > tsOf(o) { o["ts"] = e["ts"] }
                    for f in ["zh", "pos", "col", "src", "alts"] where isEmptyVal(o[f]) && !isEmptyVal(e[f]) { o[f] = e[f] }
                } else {
                    // ut = last edit time of the entry: a newer edit replaces the text + marks
                    let eu = (e["ut"] as? NSNumber)?.doubleValue ?? 0, ou = (o["ut"] as? NSNumber)?.doubleValue ?? 0
                    if eu > ou {
                        for f in ["ph", "tr", "ex", "tag", "lw", "rw", "ww", "sw", "ut"] where e[f] != nil { o[f] = e[f] }
                    } else {
                        for f in ["ph", "tr", "ex", "tag"] where isEmptyVal(o[f]) && !isEmptyVal(e[f]) { o[f] = e[f] }
                        if eu == ou {
                            for f in ["lw", "rw", "ww", "sw"] where (e[f] as? NSNumber)?.boolValue == true { o[f] = true }
                        }
                    }
                }
                lst[i] = o
            } else {
                lst.append(e); idx[k] = lst.count - 1
            }
        }
        var result: [String: Any] = ["list": lst, "del": dl]
        if deck == "notebook" {
            var sessions = (cur["sessions"] as? [String: Any]) ?? [:]
            for (key, value) in (payload["sessions"] as? [String: Any]) ?? [:] {
                guard let incoming = value as? [String: Any] else { continue }
                let old = (sessions[key] as? [String: Any]) ?? [:]
                if sessions[key] == nil || tsOf(incoming) >= tsOf(old) { sessions[key] = incoming }
            }
            result["sessions"] = sessions
        }
        if deck == "wrong" {
            var events = (cur["events"] as? [String: Any]) ?? [:]
            for (id, event) in (payload["events"] as? [String: Any]) ?? [:] where events[id] == nil { events[id] = event }
            result["events"] = events
        }
        return result
    }
    if deck == "config" {                                        // shallow update, like the server
        for (k, v) in payload { cur[k] = v }
        return cur
    }
    if deck == "srs" { return mergeReview(existing: existing, payload: payload) }
    if deck == "stats" { return mergeStats(existing: existing, payload: payload) }
    // deck pages (p1/vj/scene): per word the newer record wins (see progressWins).
    var prog = (cur["prog"] as? [String: Any]) ?? [:]
    for (k, v) in (payload["prog"] as? [String: Any]) ?? [:] {
        if prog[k] == nil || progressWins(v, over: prog[k]) { prog[k] = v }
    }
    rememberDaily(&cur, cur["daily"] as? [String: Any])
    cur["prog"] = prog
    if let nd = payload["daily"] as? [String: Any] { cur["daily"] = mergeDaily(cur["daily"] as? [String: Any], nd) }
    rememberDaily(&cur, payload["daily"] as? [String: Any])
    if let s = payload["settings"], !isEmptyVal(s) { cur["settings"] = s }
    return cur
}
// MARK: merge-end

// Cross-PROCESS lock shared with server.py (same .datalock file, same flock protocol):
// both this app and the sync server read-modify-write data.json, and without it one
// side's save can silently erase what the other just merged.
func withDataLock(_ body: () -> Void) {
    let lockPath = dataFileURL().deletingLastPathComponent().appendingPathComponent(".datalock").path
    let fd = open(lockPath, O_CREAT | O_WRONLY, 0o644)
    guard fd >= 0, flock(fd, LOCK_EX) == 0 else {
        if fd >= 0 { close(fd) }
        reportDataError?("无法锁定学习数据文件，已停止写入。请检查目录权限。")
        return
    }
    defer { flock(fd, LOCK_UN); close(fd) }
    body()
}

// Returns (root, safeToWrite). A file that exists but cannot be parsed must NOT be
// overwritten — a rewrite from an empty root would silently wipe every deck.
func loadRoot() -> ([String: Any], Bool) {
    let url = dataFileURL()
    guard let s = try? String(contentsOf: url, encoding: .utf8) else {
        return ([:], !FileManager.default.fileExists(atPath: url.path))
    }
    if let d = s.data(using: .utf8),
       let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any] {
        return (o, true)
    }
    return ([:], false)                           // exists but unreadable — refuse to clobber
}

// Valid backups, newest first: the app's daily-/before-restore-/migration- files and the
// sync server's data-*.json copies. Each must unwrap to {v:1, decks:{…}}.
func backupCandidates() -> [(URL, Date, [String: Any])] {
    guard let dir = try? backupDirectory(),
          let files = try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: [.contentModificationDateKey]) else { return [] }
    var out: [(URL, Date, [String: Any])] = []
    for url in files where url.pathExtension == "json" {
        guard let d = try? Data(contentsOf: url), var o = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else { continue }
        if o["format"] as? String == "IELTSVocabBackup" { guard let inner = o["data"] as? [String: Any] else { continue }; o = inner }
        guard (o["v"] as? NSNumber)?.intValue == 1, o["decks"] is [String: Any] else { continue }
        let date = (try? url.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
        out.append((url, date, o))
    }
    return out.sorted { $0.1 > $1.1 }
}
// Replace data.json with `root`. A healthy current file is backed up first; a damaged one
// is kept beside it as data.json.corrupt-<time> (never deleted, never overwritten).
func replaceRoot(_ root: [String: Any]) throws {
    let (current, safe) = loadRoot()
    let url = dataFileURL()
    if !safe {
        let f = DateFormatter(); f.dateFormat = "yyyyMMddHHmmss"
        try FileManager.default.moveItem(at: url, to: url.appendingPathExtension("corrupt-" + f.string(from: Date())))
    } else if !current.isEmpty {
        try backupRoot(current, reason: "before-restore")
    }
    try writeRoot(root)
}

func persistDeck(_ body: String) {
    guard let bd = body.data(using: .utf8),
          let obj = try? JSONSerialization.jsonObject(with: bd) as? [String: Any],
          let deck = obj["deck"] as? String else { return }
    withDataLock {
        let (rootIn, safe) = loadRoot()
        guard safe else { reportCorrupt?(); return }
        var root = rootIn
        var decks = root["decks"] as? [String: Any] ?? [:]
        decks[deck] = mergeDeckPayload(existing: decks[deck] as? [String: Any],
                                       deck: deck,
                                       payload: (obj["payload"] as? [String: Any]) ?? [:])
        root["decks"] = decks
        root["v"] = 1
        do {
            if !rootIn.isEmpty { try backupRoot(rootIn) }
            try writeRoot(root)
        } catch { reportDataError?(error.localizedDescription) }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var zoom: CGFloat = 1.0
    var dataBusy = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildMenu()
        reportDataError = { [weak self] message in self?.dataError(message) }
        reportCorrupt = { [weak self] in DispatchQueue.main.async { self?.showCorrupt() } }

        let controller = WKUserContentController()
        controller.add(self, name: "persist")
        controller.add(self, name: "zoom")
        controller.add(self, name: "learningData")
        let initial = loadData()
        // Display mode (decks.config.imgMode) controls how much loads — lets the user
        // shrink the app's memory use: "photo"=emoji+images, "emoji"=emoji only, "off"=neither.
        var assets = ["emoji", "images"]
        if let d = initial.data(using: .utf8),
           let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
           let cfg = (o["decks"] as? [String: Any])?["config"] as? [String: Any] {
            if let mode = cfg["imgMode"] as? String {
                if mode == "emoji" { assets = ["emoji"] }
                else if mode == "off" { assets = [] }
            }
            if let z = cfg["zoom"] as? NSNumber { zoom = CGFloat(truncating: z) }
        }
        for asset in assets {
            if let u = Bundle.main.url(forResource: asset, withExtension: "js"),
               let s = try? String(contentsOf: u, encoding: .utf8) {
                controller.addUserScript(WKUserScript(source: s, injectionTime: .atDocumentStart, forMainFrameOnly: true))
            }
        }

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 760, height: 900), configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.pageZoom = zoom

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 760, height: 900),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = APP_NAME
        window.isReleasedWhenClosed = false
        window.minSize = NSSize(width: 380, height: 560)
        window.setFrameAutosaveName("IELTSVocabWindow")
        window.center()
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        loadResource("index")
        NSApp.activate(ignoringOtherApps: true)
    }

    func loadResource(_ name: String) {
        if let url = Bundle.main.url(forResource: name, withExtension: "html") {
            refreshScripts()
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            webView.loadHTMLString("<h2 style='font:16px -apple-system;padding:30px'>\(name).html not found.</h2>", baseURL: nil)
        }
    }

    func refreshScripts() {
        let controller = webView.configuration.userContentController
        controller.removeAllUserScripts()
        let (root, safe) = loadRoot()
        let initial = safe ? ((try? JSONSerialization.data(withJSONObject: root)).flatMap { String(data: $0, encoding: .utf8) } ?? "{}") : "{}"
        controller.addUserScript(WKUserScript(source: "window.__INITIAL_STATE__ = \(initial);", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        if !safe {
            let msg = String(data: try! JSONSerialization.data(withJSONObject: [CORRUPT_TEXT]), encoding: .utf8)!
            controller.addUserScript(WKUserScript(source: "window.__DATA_ERROR__ = \(msg)[0]; document.addEventListener('DOMContentLoaded', function(){ var b=document.createElement('div'); b.setAttribute('role','alert'); b.style.cssText='position:sticky;top:0;z-index:2147483647;background:#8b1e18;color:#fff;padding:12px 16px;font:14px/1.5 system-ui'; b.textContent=window.__DATA_ERROR__; document.body.prepend(b); });", injectionTime: .atDocumentStart, forMainFrameOnly: true))
            DispatchQueue.main.async { self.showCorrupt() }
        }
        for name in ["learning-data", "shortcuts", "mistakes", "srs", "emoji", "images"] {
            let cfg = (root["decks"] as? [String: Any])?["config"] as? [String: Any]
            if name == "images" && ["off", "emoji"].contains(cfg?["imgMode"] as? String ?? "") { continue }
            if name == "emoji" && cfg?["imgMode"] as? String == "off" { continue }
            if let url = Bundle.main.url(forResource: name, withExtension: "js"), let script = try? String(contentsOf: url, encoding: .utf8) {
                controller.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
                if name == "learning-data" && safe && root["decks"] != nil {
                    controller.addUserScript(WKUserScript(source: "try { IELTSData.hydrate(window.__INITIAL_STATE__, localStorage); } catch(e) { window.__DATA_ERROR__ = e.message; }", injectionTime: .atDocumentStart, forMainFrameOnly: true))
                }
            }
        }
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if navigationAction.navigationType == .linkActivated, let url = navigationAction.request.url, url.isFileURL {
            decisionHandler(.cancel); loadResource(url.deletingPathExtension().lastPathComponent); return
        }
        if navigationAction.navigationType == .other { refreshScripts() }
        decisionHandler(.allow)
    }
    func dataError(_ message: String) {
        let alert = NSAlert(); alert.messageText = "学习数据操作失败"; alert.informativeText = message
        if window != nil && window.attachedSheet == nil { alert.beginSheetModal(for: window, completionHandler: nil) }
    }
    @objc func showLearningData() {
        let (root, safe) = loadRoot()
        guard safe, let data = try? JSONSerialization.data(withJSONObject: root.isEmpty ? ["v":1,"decks":[:]] : root), let text = String(data: data, encoding: .utf8) else { dataError("数据文件无法读取"); return }
        webView.evaluateJavaScript("window.__INITIAL_STATE__ = \(text); window.showLearningData();", completionHandler: nil)
    }
    @objc func exportLearningData() { dataAction("export") }
    @objc func importLearningData() { dataAction("import") }
    @objc func openBackupFolder() { dataAction("folder") }
    @objc func restoreLatestBackup() { dataAction("latest") }
    func dataAction(_ action: String) {
        guard !dataBusy else { return }
        if action == "folder" {
            do { NSWorkspace.shared.open(try backupDirectory()) } catch { dataError(error.localizedDescription) }
            return
        }
        dataBusy = true
        if action == "export" {
            let panel = NSSavePanel(); panel.title = "导出完整学习备份"; panel.nameFieldStringValue = "IELTSVocab-backup.json"; panel.allowedContentTypes = [.json]
            panel.beginSheetModal(for: window) { [weak self] result in
                guard let self = self else { return }; defer { self.dataBusy = false }
                guard result == .OK, let url = panel.url else { return }
                withDataLock {
                    let (root, safe) = loadRoot()
                    guard safe else { self.dataError("原数据文件无法读取"); return }
                    do {
                        let data: [String: Any] = root.isEmpty ? ["v":1,"decks":[:]] : root
                        let wrapped: [String: Any] = ["format":"IELTSVocabBackup","version":1,"createdAt":ISO8601DateFormatter().string(from: Date()),"data":data]
                        try JSONSerialization.data(withJSONObject: wrapped, options: [.prettyPrinted,.sortedKeys]).write(to: url, options: .atomic)
                    } catch { self.dataError(error.localizedDescription) }
                }
            }
        } else if action == "import" {
            let panel = NSOpenPanel(); panel.title = "选择完整学习备份"; panel.allowedContentTypes = [.json]; panel.allowsMultipleSelection = false
            panel.beginSheetModal(for: window) { [weak self] result in
                guard let self = self else { return }
                guard result == .OK, let url = panel.url else { self.dataBusy = false; return }
                do {
                    let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
                    guard size <= 32 * 1024 * 1024 else { throw NSError(domain: "备份超过 32 MB", code: 1) }
                    let text = try String(contentsOf: url, encoding: .utf8)
                    self.confirmRestore(text, note: "")
                } catch { self.dataBusy = false; self.dataError(error.localizedDescription) }
            }
        } else if action == "latest" {
            guard let (url, date, root) = backupCandidates().first,
                  let bytes = try? JSONSerialization.data(withJSONObject: root), let text = String(data: bytes, encoding: .utf8) else {
                dataBusy = false; dataError("备份目录里没有可用的备份。可用「从备份恢复…」选择自己导出的备份文件。"); return
            }
            let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd HH:mm"
            confirmRestore(text, note: "最近的有效备份：\(url.lastPathComponent)（\(f.string(from: date))）\n")
        } else { dataBusy = false }
    }
    // Validate with IELTSData.parse (the same rules as every other import), confirm, restore.
    func confirmRestore(_ text: String, note: String) {
        guard let encoded = try? JSONSerialization.data(withJSONObject: [text]), let argument = String(data: encoded, encoding: .utf8) else { dataBusy = false; return }
        webView.evaluateJavaScript("JSON.stringify(IELTSData.parse((\(argument))[0]))") { value, error in
            guard error == nil, let validated = value as? String, let bytes = validated.data(using: .utf8), let root = try? JSONSerialization.jsonObject(with: bytes) as? [String: Any] else {
                self.dataBusy = false; self.dataError("备份格式无效或版本不受支持。未修改当前记录。"); return
            }
            self.webView.evaluateJavaScript("IELTSData.summary(\(validated))") { value, _ in
                let (_, safe) = loadRoot()
                let confirm = NSAlert(); confirm.messageText = "用此备份恢复学习数据？"
                confirm.informativeText = note + (value as? String ?? "") + (safe ? "\n将替换当前记录；恢复前会自动备份原数据。" : "\n当前数据文件无法读取，会原样保留为 data.json.corrupt-<时间>，不会删除。")
                confirm.addButton(withTitle: "取消"); confirm.addButton(withTitle: "恢复")
                confirm.beginSheetModal(for: self.window) { result in
                    defer { self.dataBusy = false }
                    guard result == .alertSecondButtonReturn else { return }
                    self.applyRestore(root)
                }
            }
        }
    }
    func applyRestore(_ root: [String: Any]) {
        var success = false
        withDataLock {
            do { try replaceRoot(root); success = true } catch { self.dataError(error.localizedDescription) }
        }
        guard success else { return }
        corruptShown = false
        let cfg = (root["decks"] as? [String: Any])?["config"] as? [String: Any]
        zoom = CGFloat((cfg?["zoom"] as? NSNumber)?.doubleValue ?? 1)
        loadResource("index")
    }
    // One sheet per damaged state (not one per answer), offering the restore right away.
    var corruptShown = false
    func showCorrupt() {
        guard !corruptShown, window != nil, window.attachedSheet == nil else { return }
        corruptShown = true
        let alert = NSAlert(); alert.alertStyle = .critical
        alert.messageText = "学习数据文件无法读取"
        alert.informativeText = CORRUPT_TEXT
        alert.addButton(withTitle: "从最近的有效备份恢复…"); alert.addButton(withTitle: "打开备份目录"); alert.addButton(withTitle: "稍后")
        alert.beginSheetModal(for: window) { result in
            if result == .alertFirstButtonReturn { self.dataAction("latest") }
            else if result == .alertSecondButtonReturn { self.dataAction("folder") }
        }
    }

    @objc func goHome()  { loadResource("index") }
    @objc func goReview() { loadResource("review") }
    @objc func goP1()    { loadResource("p1") }
    @objc func goVj()    { loadResource("vj") }
    @objc func goScene() { loadResource("scene") }
    @objc func goNotebook() { loadResource("notebook") }
    @objc func goWrong() { loadResource("wrong") }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "persist", let s = message.body as? String { persistDeck(s) }
        else if message.name == "learningData", let action = message.body as? String { dataAction(action) }
        else if message.name == "zoom", let s = message.body as? String, let z = Double(s) { applyZoom(CGFloat(z)) }
    }

    // Re-apply zoom on every page load so it stays consistent across deck switches.
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.pageZoom = zoom
        webView.evaluateJavaScript("window.__INITIAL_STATE__ ||= {}; window.__INITIAL_STATE__.decks ||= {}; window.__INITIAL_STATE__.decks.config ||= {}; window.__INITIAL_STATE__.decks.config.zoom = \(Double(zoom)); window.dispatchEvent(new CustomEvent('ielts:zoom', {detail: \(Double(zoom))}));", completionHandler: nil)
    }

    // 生词本 口语练习 records the learner's own voice for playback (never saved): grant the
    // microphone to the app's own bundled pages only; macOS still asks the user once.
    @available(macOS 12.0, *)
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo,
                 type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(type == .microphone && frame.isMainFrame && (webView.url?.isFileURL ?? false) ? .grant : .deny)
    }

    // MARK: - WKUIDelegate — JS alert/confirm/prompt → native NSAlert.
    // WKWebView shows NOTHING for these unless the host implements them: alert() is a
    // no-op and confirm() returns false. That silently broke every confirm-gated action
    // (e.g. the 生词本 delete button) and every alert across all decks.
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "好")
        if window != nil { alert.beginSheetModal(for: window) { _ in completionHandler() } }
        else { alert.runModal(); completionHandler() }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "确定")
        alert.addButton(withTitle: "取消")
        if window != nil {
            alert.beginSheetModal(for: window) { resp in completionHandler(resp == .alertFirstButtonReturn) }
        } else {
            completionHandler(alert.runModal() == .alertFirstButtonReturn)
        }
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let alert = NSAlert()
        alert.messageText = prompt
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 240, height: 24))
        field.stringValue = defaultText ?? ""
        alert.accessoryView = field
        alert.addButton(withTitle: "确定")
        alert.addButton(withTitle: "取消")
        let finish: (NSApplication.ModalResponse) -> Void = { resp in
            completionHandler(resp == .alertFirstButtonReturn ? field.stringValue : nil)
        }
        if window != nil { alert.beginSheetModal(for: window, completionHandler: finish) }
        else { finish(alert.runModal()) }
    }

    // Global font zoom: scales the whole webview, persisted to data.json decks.config.zoom.
    func applyZoom(_ z: CGFloat) {
        zoom = min(1.8, max(0.6, (z * 100).rounded() / 100))
        webView.pageZoom = zoom
        webView.evaluateJavaScript("window.__INITIAL_STATE__ ||= {}; window.__INITIAL_STATE__.decks ||= {}; window.__INITIAL_STATE__.decks.config ||= {}; window.__INITIAL_STATE__.decks.config.zoom = \(Double(zoom)); window.dispatchEvent(new CustomEvent('ielts:zoom', {detail: \(Double(zoom))}));", completionHandler: nil)
        withDataLock {
            let (rootIn, safe) = loadRoot()
            guard safe else { reportCorrupt?(); return }
            var root = rootIn
            var decks = root["decks"] as? [String: Any] ?? [:]
            var cfg = decks["config"] as? [String: Any] ?? [:]
            cfg["zoom"] = Double(zoom); decks["config"] = cfg; root["decks"] = decks; root["v"] = 1
            do {
                if !rootIn.isEmpty { try backupRoot(rootIn) }
                try writeRoot(root)
            } catch { reportDataError?(error.localizedDescription) }
        }
    }
    @objc func zoomIn()    { applyZoom(zoom + 0.1) }
    @objc func zoomOut()   { applyZoom(zoom - 0.1) }
    @objc func zoomReset() { applyZoom(1.0) }

    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }

    @objc func showShortcuts() {
        webView.evaluateJavaScript("window.showShortcutHelp()", completionHandler: nil)
    }

    func buildMenu() {
        let main = NSMenu()

        let appItem = NSMenuItem(); main.addItem(appItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "关于 \(APP_NAME)", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "隐藏 \(APP_NAME)", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: "退出 \(APP_NAME)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu

        let deckItem = NSMenuItem(); main.addItem(deckItem)
        let deckMenu = NSMenu(title: "词库")
        let home = deckMenu.addItem(withTitle: "📚 词库主页", action: #selector(goHome), keyEquivalent: ""); home.target = self
        let today = deckMenu.addItem(withTitle: "📅 今日复习", action: #selector(goReview), keyEquivalent: ""); today.target = self
        deckMenu.addItem(.separator())
        let m1 = deckMenu.addItem(withTitle: "① Part 1 高频词", action: #selector(goP1), keyEquivalent: ""); m1.target = self
        let m2 = deckMenu.addItem(withTitle: "② 词汇真经", action: #selector(goVj), keyEquivalent: ""); m2.target = self
        let m3 = deckMenu.addItem(withTitle: "③ 听力场景词汇", action: #selector(goScene), keyEquivalent: ""); m3.target = self
        deckMenu.addItem(.separator())
        let m4 = deckMenu.addItem(withTitle: "📒 生词本", action: #selector(goNotebook), keyEquivalent: ""); m4.target = self
        let m5 = deckMenu.addItem(withTitle: "📕 错词本", action: #selector(goWrong), keyEquivalent: ""); m5.target = self
        deckItem.submenu = deckMenu

        let dataItem = NSMenuItem(); main.addItem(dataItem)
        let dataMenu = NSMenu(title: "学习数据")
        for (title, action) in [("学习记录与数据转移", #selector(showLearningData)), ("导出完整备份…", #selector(exportLearningData)), ("从备份恢复…", #selector(importLearningData)), ("从最近的有效备份恢复…", #selector(restoreLatestBackup)), ("打开自动备份目录", #selector(openBackupFolder))] {
            let item = dataMenu.addItem(withTitle: title, action: action, keyEquivalent: ""); item.target = self
        }
        dataItem.submenu = dataMenu
        let editItem = NSMenuItem(); main.addItem(editItem)
        let editMenu = NSMenu(title: "编辑")
        editMenu.addItem(withTitle: "撤销", action: Selector(("undo:")), keyEquivalent: "z")
        editMenu.addItem(withTitle: "重做", action: Selector(("redo:")), keyEquivalent: "Z")
        editMenu.addItem(.separator())
        editMenu.addItem(withTitle: "剪切", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "复制", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "粘贴", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "全选", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editItem.submenu = editMenu

        let viewItem = NSMenuItem(); main.addItem(viewItem)
        let viewMenu = NSMenu(title: "显示")
        let zi = viewMenu.addItem(withTitle: "放大字号", action: #selector(zoomIn), keyEquivalent: ""); zi.target = self
        let zo = viewMenu.addItem(withTitle: "缩小字号", action: #selector(zoomOut), keyEquivalent: ""); zo.target = self
        viewMenu.addItem(.separator())
        let zr = viewMenu.addItem(withTitle: "重置字号", action: #selector(zoomReset), keyEquivalent: ""); zr.target = self; zr.keyEquivalentModifierMask = [.command, .shift]
        viewItem.submenu = viewMenu

        let helpItem = NSMenuItem(); main.addItem(helpItem)
        let helpMenu = NSMenu(title: "帮助")
        let keys = helpMenu.addItem(withTitle: "快捷键设置", action: #selector(showShortcuts), keyEquivalent: "")
        keys.target = self
        helpItem.submenu = helpMenu
        NSApp.mainMenu = main
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
