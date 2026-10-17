"""server.py merge rules on an in-memory root: no network, no real learning data."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import server

root = {"v": 1, "decks": {"p1": {"prog": {"apple": {"box": 5, "seen": 9}, "kiwi": {"box": 1}}}}}
# a mastered word answered wrong comes back lower …
server.merge(root, "p1", {"prog": {"apple": {"box": 0, "seen": 10, "t": 2000}}})
assert root["decks"]["p1"]["prog"]["apple"]["box"] == 0
# … and neither an old client's higher box nor an older stamped record undoes it
server.merge(root, "p1", {"prog": {"apple": {"box": 5, "seen": 9}, "kiwi": {"box": 3}}})
server.merge(root, "p1", {"prog": {"apple": {"box": 4, "t": 1500}}})
assert root["decks"]["p1"]["prog"]["apple"]["box"] == 0
assert root["decks"]["p1"]["prog"]["kiwi"]["box"] == 3          # two pre-update records: higher box
server.merge(root, "p1", {"prog": {"apple": {"box": 1, "t": 3000}}})
assert root["decks"]["p1"]["prog"]["apple"]["box"] == 1

server.merge(root, "srs", {"items": {"apple": {"t": 100, "zh": "苹果", "src": ["p1"], "d": {"t": 100, "lv": 5}}},
                           "meta": {"seed": 1, "cap": 60, "capT": 10}})
server.merge(root, "srs", {"items": {"apple": {"t": 200, "src": ["vj"], "d": {"t": 200, "lv": 2}, "m": {"t": 150, "lv": 1}},
                                     "pear": {"t": 5, "d": {"t": 5, "lv": 1}}, "bad": "x"},
                           "meta": {"cap": 30, "capT": 20}})
server.merge(root, "srs", {"items": {"apple": {"t": 120, "d": {"t": 120, "lv": 4}}}, "meta": {"cap": 99, "capT": 15}})
srs = root["decks"]["srs"]
apple = srs["items"]["apple"]
assert apple["d"]["lv"] == 2 and apple["m"]["lv"] == 1 and apple["zh"] == "苹果" and apple["t"] == 200
assert sorted(apple["src"]) == ["p1", "vj"] and sorted(srs["items"]) == ["apple", "pear"]
assert srs["meta"] == {"seed": 1, "cap": 30, "capT": 20}
server.merge(root, "srs", {"items": {}, "meta": {}})            # an empty push changes nothing
assert root["decks"]["srs"] == srs
print("server.py: newer answer wins for progress, review ledger merges per track, cap follows the latest change")
