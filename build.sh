#!/bin/bash
# Build the unified "雅思词汇听写合集" macOS app (3 decks + one local data file).
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$DIR/src"
APP="$DIR/雅思词汇听写合集.app"

echo "Building $APP ..."
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cp "$SRC/Info.plist" "$APP/Contents/Info.plist"
cp "$SRC/index.html" "$APP/Contents/Resources/index.html"
cp "$SRC/p1.html"    "$APP/Contents/Resources/p1.html"
cp "$SRC/vj.html"    "$APP/Contents/Resources/vj.html"
cp "$SRC/scene.html" "$APP/Contents/Resources/scene.html"
cp "$SRC/wrong.html" "$APP/Contents/Resources/wrong.html"
# Inline the dictionary into notebook.html so it ALWAYS loads in WKWebView
# (a file:// <script src> sub-resource can fail silently; inlining can't).
python3 - "$SRC/notebook.html" "$SRC/dict.js" "$APP/Contents/Resources/notebook.html" "$SRC/defs.js" <<'PY'
import sys
nb=open(sys.argv[1],encoding='utf-8').read()
dj=open(sys.argv[2],encoding='utf-8').read()
out=nb.replace('<script src="dict.js"></script>', '<script>\n'+dj+'\n</script>')
out=out.replace('<script src="defs.js"></script>', '<script>\n'+open(sys.argv[4],encoding='utf-8').read()+'\n</script>')   # English definitions
out=out.replace('<script src="emoji.js"></script>', '')   # window.EMOJI injected natively
out=out.replace('<script src="images.js"></script>', '')  # window.IMG injected natively
open(sys.argv[3],'w',encoding='utf-8').write(out)
print('  notebook.html: dict inlined; emoji+images via native injection (%.1f MB)' % (len(out)/1e6))
PY
# review.html uses the same dictionary (error diagnosis, contrast drills) — inline it too.
python3 - "$SRC/review.html" "$SRC/dict.js" "$APP/Contents/Resources/review.html" <<'PY'
import sys
page=open(sys.argv[1],encoding='utf-8').read()
dj=open(sys.argv[2],encoding='utf-8').read()
assert '<script src="dict.js"></script>' in page
open(sys.argv[3],'w',encoding='utf-8').write(page.replace('<script src="dict.js"></script>', '<script>\n'+dj+'\n</script>'))
print('  review.html: dict inlined')
PY
# 英义猜词 question bank: inlined like the dictionaries so it cannot fail to load.
python3 - "$SRC/edef.html" "$SRC/edef.js" "$APP/Contents/Resources/edef.html" <<'PY'
import sys
page=open(sys.argv[1],encoding='utf-8').read()
assert '<script src="edef.js"></script>' in page
open(sys.argv[3],'w',encoding='utf-8').write(page.replace('<script src="edef.js"></script>', '<script>\n'+open(sys.argv[2],encoding='utf-8').read()+'\n</script>'))
print('  edef.html: question bank inlined')
PY
cp "$SRC/learning-data.js" "$APP/Contents/Resources/learning-data.js"
cp "$SRC/mistakes.js" "$APP/Contents/Resources/mistakes.js"
cp "$SRC/srs.js" "$APP/Contents/Resources/srs.js"
cp "$SRC/shortcuts.js" "$APP/Contents/Resources/shortcuts.js"
cp "$SRC/dict.js"    "$APP/Contents/Resources/dict.js"
cp "$SRC/emoji.js"   "$APP/Contents/Resources/emoji.js"
cp "$SRC/images.js"  "$APP/Contents/Resources/images.js"
[ -f "$SRC/AppIcon.icns" ] && cp "$SRC/AppIcon.icns" "$APP/Contents/Resources/AppIcon.icns"

swiftc -O "$SRC/main.swift" \
    -o "$APP/Contents/MacOS/IELTSVocab" \
    -framework Cocoa -framework WebKit

# Ad-hoc sign and clear quarantine so it opens without a Gatekeeper prompt.
codesign --force --deep -s - "$APP" >/dev/null 2>&1 || true
xattr -dr com.apple.quarantine "$APP" >/dev/null 2>&1 || true

# Keep the background sync service's runtime copy fresh (LaunchAgent runs from
# ~/Library/Application Support — launchd can't read the Desktop due to TCC).
RUNTIME="$HOME/Library/Application Support/IELTSVocab/runtime"
if [ -d "$RUNTIME" ]; then
  rsync -a --delete "$SRC/" "$RUNTIME/src/"
  cp "$DIR/server.py" "$RUNTIME/server.py"
  echo "  runtime refreshed ($RUNTIME) — pages take effect on next request;"
  echo "  server.py changes need a service restart (re-run 安装开机自启.command)."
fi

echo "Done. Double-click \"$APP\" to launch."
