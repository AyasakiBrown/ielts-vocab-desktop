#!/usr/bin/env python3
"""Append hand-written extra senses (dict-supplement.json) to src/dict.js entries as
' / 〔补充〕…'. Idempotent: an entry that already carries a supplement is rewritten, not doubled."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
p = root / 'src' / 'dict.js'
s = p.read_text(encoding='utf-8')
head, body = s[:s.index('{')], s[s.index('{'):s.rindex('}') + 1]
tail = s[s.rindex('}') + 1:]
d = json.loads(body)
sup = json.loads((root / 'release-tools' / 'dict-supplement.json').read_text(encoding='utf-8'))
MARK = ' / 〔补充〕'
for w, extra in sup.items():
    if w not in d:
        raise SystemExit('not in dict: ' + w)
    ph, _, tr = d[w].partition('\t') if '\t' in d[w] else ('', '', d[w])
    tr = tr.split(MARK)[0]
    d[w] = ph + '\t' + tr + MARK + extra
p.write_text(head + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + tail, encoding='utf-8')
print('supplemented', len(sup), 'entries')
