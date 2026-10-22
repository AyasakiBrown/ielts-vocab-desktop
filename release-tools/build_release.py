#!/usr/bin/env python3
"""Allowlist-only release assembly. Never reads the user's learning database."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
VERSION = '1.1.5'
OUT = ROOT / 'GitHub-Release' / ('v' + VERSION)
ELECTRON = '44.3.0'
ASSETS = ['index.html', 'p1.html', 'vj.html', 'scene.html', 'notebook.html',
          'wrong.html', 'review.html', 'edef.html', 'edef.js', 'mistakes.js', 'srs.js', 'learning-data.js', 'shortcuts.js', 'dict.js', 'defs.js', 'emoji.js', 'images.js', 'icon-512.png', 'icon-180.png', 'AppIcon.icns']

def run(*args):
    subprocess.run(args, check=True)

def source_commit():
    """The git commit the release is built from, so each tag points at real source."""
    git = ['git', '-C', str(ROOT)]
    try:
        head = subprocess.run(git + ['rev-parse', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()
        dirty = subprocess.run(git + ['status', '--porcelain', '--', 'src', 'release-tools', 'build.sh'],
                               capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return None  # building from an extracted Source zip: no repository
    if dirty and not os.environ.get('IELTS_ALLOW_DIRTY'):
        raise SystemExit('src/、release-tools/ 或 build.sh 有未提交的改动。请先提交，再从该提交构建发布包；'
                         '仅试构建时可设 IELTS_ALLOW_DIRTY=1（结果会标记 -dirty，不能用于发布）。\n' + dirty)
    return head + ('-dirty' if dirty else '')

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')

def archive(folder, dest):
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p in sorted(folder.rglob('*')):
            if p.is_file():
                zi = zipfile.ZipInfo(str(p.relative_to(folder.parent)), (2026, 9, 29, 0, 0, 0))
                zi.external_attr = (0o100755 if os.access(p, os.X_OK) else 0o100644) << 16
                zi.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(zi, p.read_bytes())

def audit(folder):
    patterns = [b'/' + b'Users' + rb'/[a-zA-Z0-9_.-]+/', re.escape(os.fsencode(Path.home().name)), rb'BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',
                rb'gh[pousr]_[A-Za-z0-9]{30,}', rb'github_pat_[A-Za-z0-9_]{30,}',
                rb'192\.168\.\d+\.\d+', rb'10\.0\.\d+\.\d+']
    forbidden = {'data.json', 'cert.pem', 'key.pem', '.DS_Store', '.Rhistory'}
    for p in folder.rglob('*'):
        if not p.is_file(): continue
        assert p.name not in forbidden, f'Private filename: {p.name}'
        b = p.read_bytes()
        # Official Windows runtime is checksum-verified, and may contain generic
        # example IPs or cryptography strings. Still scan for this user's identity.
        active = patterns
        if folder.name.endswith('Windows-x64') and 'app' not in p.relative_to(folder).parts:
            active = [re.escape(os.fsencode(Path.home().name)), re.escape(os.fsencode(Path.home()))]
        for pattern in active:
            assert not re.search(pattern, b, re.I), f'Privacy scan failed: {p.relative_to(folder)}'

def main():
    commit = source_commit()
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='ielts-release-') as tmp:
        stage = Path(tmp)
        source = stage / 'IELTSVocab-Source'
        for name in ASSETS + ['main.swift', 'Info.plist']:
            target = source / 'src' / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / 'src' / name, target)
        # Include only the public build files, never personal sync scripts/certificates.
        for name in ['main.cjs', 'desktop.js', 'preload.cjs', 'data-store.cjs', 'test-learning-data.cjs', 'test-desktop-shell.cjs', 'test-edef.cjs', 'test-srs.cjs', 'test_native_data.py', 'test_native_smoke.py', 'test-session-resume.cjs', 'test-quiz-retry.cjs', 'test-mistakes.cjs', 'test-production.cjs', 'build_release.py', 'README.md', 'VERSIONS.md']:
            write(source / 'release-tools' / name, (ROOT / 'release-tools' / name).read_text())
        write(source / 'README.md', (ROOT / 'release-tools' / 'README.md').read_text())
        if commit: write(source / 'SOURCE_COMMIT.txt', f'v{VERSION} 构建自提交 {commit}\n')
        write(source / '.gitignore', '*.pem\n*.crt\ndata.json\nbackups/\n.DS_Store\n.claude/\n.codex/\n.env*\nnode_modules/\nGitHub-Release/\n*.log\n')

        mac = stage / 'IELTSVocab-macOS-universal'
        app = mac / '雅思词汇听写合集.app'
        res = app / 'Contents' / 'Resources'
        res.mkdir(parents=True)
        (app / 'Contents' / 'MacOS').mkdir()
        shutil.copyfile(source / 'src' / 'Info.plist', app / 'Contents' / 'Info.plist')
        for name in ASSETS: shutil.copyfile(source / 'src' / name, res / name)
        nb = (res / 'notebook.html').read_text()
        nb = nb.replace('<script src="dict.js"></script>', '<script>\n' + (res / 'dict.js').read_text() + '\n</script>')
        nb = nb.replace('<script src="defs.js"></script>', '<script>\n' + (res / 'defs.js').read_text() + '\n</script>')
        for name in ['emoji', 'images']:
            nb = nb.replace(f'<script src="{name}.js"></script>', '')
        write(res / 'notebook.html', nb)
        page = (res / 'review.html').read_text()
        write(res / 'review.html', page.replace('<script src="dict.js"></script>', '<script>\n' + (res / 'dict.js').read_text() + '\n</script>'))
        page = (res / 'edef.html').read_text()
        write(res / 'edef.html', page.replace('<script src="edef.js"></script>', '<script>\n' + (res / 'edef.js').read_text() + '\n</script>'))
        bins = []
        for arch in ['arm64', 'x86_64']:
            binary = stage / ('IELTSVocab-' + arch)
            run('swiftc', '-O', '-target', arch + '-apple-macos13.0',
                '-debug-prefix-map', str(stage) + '=/build', str(source / 'src' / 'main.swift'),
                '-o', str(binary), '-framework', 'Cocoa', '-framework', 'WebKit')
            bins.append(str(binary))
        run('lipo', '-create', *bins, '-output', str(app / 'Contents' / 'MacOS' / 'IELTSVocab'))
        run('codesign', '--force', '--deep', '-s', '-', str(app))
        run('codesign', '--verify', '--deep', '--strict', str(app))
        write(mac / 'README.md', (source / 'README.md').read_text())

        win = stage / 'IELTSVocab-Windows-x64'
        name = f'electron-v{ELECTRON}-win32-x64.zip'
        base = f'https://github.com/electron/electron/releases/download/v{ELECTRON}/'
        download = stage / name
        sums = stage / 'SHASUMS256.txt'
        run('curl', '-fL', '--retry', '3', '--max-time', '300', '-o', str(download), base + name)
        run('curl', '-fL', '--retry', '3', '--max-time', '60', '-o', str(sums), base + 'SHASUMS256.txt')
        expected = next(line.split()[0] for line in sums.read_text().splitlines() if line.split()[-1].lstrip('*') == name)
        assert hashlib.sha256(download.read_bytes()).hexdigest() == expected, 'Electron checksum mismatch'
        with zipfile.ZipFile(download) as z: z.extractall(win)
        (win / 'electron.exe').rename(win / 'IELTSVocab.exe')
        (win / 'resources' / 'default_app.asar').unlink(missing_ok=True)
        packaged = win / 'resources' / 'app'
        for name in ASSETS:
            target = packaged / 'src' / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source / 'src' / name, target)
            if name.endswith('.html'):
                text = target.read_text().replace('<head>', '<head>\n<script src="learning-data.js"></script>\n<script src="desktop.js"></script>\n<script src="shortcuts.js"></script>\n<script src="emoji.js"></script>\n<script src="images.js"></script>', 1)
                write(target, text)
        shutil.copyfile(source / 'release-tools' / 'desktop.js', packaged / 'src' / 'desktop.js')
        shutil.copyfile(source / 'release-tools' / 'main.cjs', packaged / 'main.cjs')
        for name in ['preload.cjs', 'data-store.cjs']:
            shutil.copyfile(source / 'release-tools' / name, packaged / name)
        write(packaged / 'package.json', json.dumps({'name': 'ielts-vocab', 'productName': '雅思词汇听写合集', 'version': VERSION, 'main': 'main.cjs', 'private': True}, ensure_ascii=False, indent=2))
        write(win / 'README.md', (source / 'README.md').read_text())
        for folder in [source, mac, win]:
            audit(folder)
            archive(folder, OUT / (folder.name + '-' + VERSION + '.zip'))
        write(OUT / 'README.md', (source / 'README.md').read_text())
        if commit: write(OUT / 'SOURCE_COMMIT.txt', (source / 'SOURCE_COMMIT.txt').read_text())
        write(OUT / 'SHA256SUMS.txt', ''.join(hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name + '\n' for p in sorted(OUT.glob('*.zip'))))
        print('Release archives built; allowlist and privacy scans passed.', flush=True)
        if commit:
            print(f'Source commit: {commit}\n发布后打标签：git tag -a v{VERSION} {commit.removesuffix("-dirty")} -m "v{VERSION}"', flush=True)

if __name__ == '__main__':
    main()
