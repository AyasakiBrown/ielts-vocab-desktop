"""Exercise the actual Swift persistence helpers in an isolated temporary profile."""
from pathlib import Path
import subprocess
import tempfile

source = (Path(__file__).resolve().parent.parent / 'src/main.swift').read_text()
source = source[:source.index('final class AppDelegate')]
source = source.replace('import Cocoa', 'import Foundation\nimport Darwin').replace('import WebKit', '').replace('import UniformTypeIdentifiers', '')
start = source.index('func dataFileURL() -> URL {')
end = source.index('// Whole-file JSON', start)
source = source[:start] + 'func dataFileURL() -> URL { URL(fileURLWithPath: CommandLine.arguments[1]).appendingPathComponent("data.json") }\n' + source[end:]
source += r'''
let original: [String: Any] = ["v":1,"decks":["p1":["prog":["apple":["box":2,"star":true]],"daily":["date":"2026-09-14","done":8,"ok":6]], "notebook":["list":[["w":"apple","ww":true,"sw":true]],"del":[:]]]]
try writeRoot(original)
persistDeck("{\"deck\":\"p1\",\"payload\":{\"prog\":{\"pear\":{\"box\":1}},\"daily\":{\"date\":\"2026-09-15\",\"done\":3,\"ok\":2}}}")
let (root, safe) = loadRoot(); assert(safe)
let decks = root["decks"] as! [String: Any]
let p1 = decks["p1"] as! [String: Any]
assert((p1["prog"] as! [String: Any]).count == 2)
assert((p1["history"] as! [String: Any]).count == 2)
assert(((decks["notebook"] as! [String: Any])["list"] as! [[String: Any]])[0]["ww"] as! Bool)
let checkpoint: [String: Any] = ["words":["apple","pear"],"idx":1,"ts":200]
let nb = mergeDeckPayload(existing: decks["notebook"] as? [String: Any], deck:"notebook", payload:["sessions":["review:rw":checkpoint]])
let stale = mergeDeckPayload(existing: nb, deck:"notebook", payload:["sessions":["review:rw":["idx":0,"ts":100],"dict:ww":["idx":2,"ts":300]]])
let kept = mergeDeckPayload(existing: stale, deck:"notebook", payload:["list":[]])
let sessions = kept["sessions"] as! [String: Any]
assert((sessions["review:rw"] as! [String: Any])["idx"] as! Int == 1)
assert(sessions.count == 2)
assert((kept["list"] as! [[String: Any]])[0]["ww"] as! Bool)
let event: [String: Any] = ["word":"apple","date":"2026-09-21","time":"12:00:00","ts":100,"source":"p1","mode":"dict","answer":"aple"]
let wrong1 = mergeDeckPayload(existing:nil, deck:"wrong", payload:["events":["device-a":event]])
let wrong2 = mergeDeckPayload(existing:wrong1, deck:"wrong", payload:["events":["device-a":event,"device-b":event]])
let wrong3 = mergeDeckPayload(existing:wrong2, deck:"wrong", payload:["list":[],"del":["apple":200]])
assert((wrong3["events"] as! [String: Any]).count == 2)
assert((wrong3["list"] as! [Any]).isEmpty)
// A mastered word answered wrong must come back lower; an older, higher record must not undo it.
func box(_ deck: [String: Any], _ word: String) -> Int { boxOf((deck["prog"] as! [String: Any])[word]) }
let mastered: [String: Any] = ["prog":["apple":["box":5,"seen":9],"kiwi":["box":1]]]
let lapsed = mergeDeckPayload(existing: mastered, deck:"p1", payload:["prog":["apple":["box":0,"seen":10,"t":2000]]])
assert(box(lapsed, "apple") == 0)
let staleHigh = mergeDeckPayload(existing: lapsed, deck:"p1", payload:["prog":["apple":["box":5,"seen":9],"kiwi":["box":3]]])
assert(box(staleHigh, "apple") == 0); assert(box(staleHigh, "kiwi") == 3)
let olderStamp = mergeDeckPayload(existing: lapsed, deck:"p1", payload:["prog":["apple":["box":4,"t":1500]]])
assert(box(olderStamp, "apple") == 0)
let relearned = mergeDeckPayload(existing: lapsed, deck:"p1", payload:["prog":["apple":["box":1,"t":3000]]])
assert(box(relearned, "apple") == 1)
let ledgerA = mergeDeckPayload(existing:nil, deck:"srs", payload:["items":["apple":["t":100,"zh":"苹果","src":["p1"],"d":["t":100,"lv":5]]],"meta":["seed":1,"cap":60,"capT":10]])
let ledgerB = mergeDeckPayload(existing:ledgerA, deck:"srs", payload:["items":["apple":["t":200,"src":["vj"],"d":["t":200,"lv":2],"m":["t":150,"lv":1]],"pear":["t":5,"d":["t":5,"lv":1]]],"meta":["cap":30,"capT":20]])
let ledgerC = mergeDeckPayload(existing:ledgerB, deck:"srs", payload:["items":["apple":["t":120,"d":["t":120,"lv":4]]],"meta":["cap":99,"capT":15]])
let apple = (ledgerC["items"] as! [String: Any])["apple"] as! [String: Any]
assert(((apple["d"] as! [String: Any])["lv"] as! NSNumber).intValue == 2)
assert(((apple["m"] as! [String: Any])["lv"] as! NSNumber).intValue == 1)
assert((apple["zh"] as! String) == "苹果"); assert((apple["src"] as! [String]).sorted() == ["p1","vj"])
assert((ledgerC["items"] as! [String: Any]).count == 2)
let ledgerMeta = ledgerC["meta"] as! [String: Any]
assert((ledgerMeta["cap"] as! NSNumber).intValue == 30); assert((ledgerMeta["seed"] as! NSNumber).intValue == 1)
try backupRoot(root, reason:"before-restore")
try writeRoot(["v":1,"decks":[:]])
assert((loadRoot().0["decks"] as! [String: Any]).isEmpty)
let backups = try FileManager.default.contentsOfDirectory(at: backupDirectory(), includingPropertiesForKeys:nil)
assert(backups.count == 2)
var reported = false; reportDataError = { _ in reported = true }
try "damaged".write(to: dataFileURL(), atomically:true, encoding:.utf8)
persistDeck("{\"deck\":\"config\",\"payload\":{\"zoom\":1.2}}")
assert(reported); assert(try String(contentsOf: dataFileURL(), encoding:.utf8) == "damaged")
print("Swift: history, category preservation, newer-answer-wins progress, review ledger merge, pre-restore backup, exact replacement and corruption protection passed")
'''.replace('assert(try String(contentsOf: dataFileURL(), encoding:.utf8) == "damaged")', 'let unchanged = try String(contentsOf: dataFileURL(), encoding:.utf8); assert(unchanged == "damaged")')
with tempfile.TemporaryDirectory(prefix='ielts-native-data-test-') as folder:
    folder = Path(folder)
    file = folder / 'test.swift'
    file.write_text(source)
    subprocess.run(['swiftc', str(file), '-o', str(folder / 'test')], check=True)
    subprocess.run([str(folder / 'test'), str(folder)], check=True)
