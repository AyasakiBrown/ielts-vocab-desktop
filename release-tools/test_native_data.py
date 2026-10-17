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
try backupRoot(root, reason:"before-restore")
try writeRoot(["v":1,"decks":[:]])
assert((loadRoot().0["decks"] as! [String: Any]).isEmpty)
let backups = try FileManager.default.contentsOfDirectory(at: backupDirectory(), includingPropertiesForKeys:nil)
assert(backups.count == 2)
var reported = false; reportDataError = { _ in reported = true }
try "damaged".write(to: dataFileURL(), atomically:true, encoding:.utf8)
persistDeck("{\"deck\":\"config\",\"payload\":{\"zoom\":1.2}}")
assert(reported); assert(try String(contentsOf: dataFileURL(), encoding:.utf8) == "damaged")
print("Swift: history, category preservation, pre-restore backup, exact replacement and corruption protection passed")
'''.replace('assert(try String(contentsOf: dataFileURL(), encoding:.utf8) == "damaged")', 'let unchanged = try String(contentsOf: dataFileURL(), encoding:.utf8); assert(unchanged == "damaged")')
with tempfile.TemporaryDirectory(prefix='ielts-native-data-test-') as folder:
    folder = Path(folder)
    file = folder / 'test.swift'
    file.write_text(source)
    subprocess.run(['swiftc', str(file), '-o', str(folder / 'test')], check=True)
    subprocess.run([str(folder / 'test'), str(folder)], check=True)
