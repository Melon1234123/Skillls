#!/usr/bin/env python3
"""Install the audited Skillls snapshot; standard library only, Python 3.9+."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import shlex
import sys
from datetime import datetime

ROOT = Path(__file__).resolve().parent

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def verify_bundle():
    expected = json.loads((ROOT / 'manifests/checksums.json').read_text(encoding='utf-8'))
    actual = {str(p.relative_to(ROOT)).replace(os.sep, '/') for folder in ('skills', 'runtime') for p in (ROOT / folder).rglob('*') if p.is_file()}
    if actual != set(expected):
        raise ValueError('Bundle file list differs from manifest')
    for rel, sha in expected.items():
        p = ROOT / rel
        if not p.resolve().is_relative_to(ROOT.resolve()) or p.is_symlink() or digest(p) != sha:
            raise ValueError('Bundle integrity failed: ' + rel)
    return len(expected)

def same_tree(a, b):
    if b.is_symlink() or not b.is_dir():
        return False
    left = {p.relative_to(a): digest(p) for p in a.rglob('*') if p.is_file()}
    right = {p.relative_to(b): digest(p) for p in b.rglob('*') if p.is_file()}
    return left == right

def install_tree(source, target, args, actions):
    exists = target.exists() or target.is_symlink()
    if exists and same_tree(source, target):
        actions.append({'path': str(target), 'status': 'unchanged'})
        return
    if exists and not args.replace:
        actions.append({'path': str(target), 'status': 'conflict-kept'})
        return
    if args.dry_run:
        actions.append({'path': str(target), 'status': 'would-replace' if exists else 'would-install'})
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    if exists:
        backup = target.with_name(target.name + '.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
        # Keep backups outside the skills discovery root.
        backup_root = target.parent.parent / 'skillls-backups'
        backup_root.mkdir(parents=True, exist_ok=True)
        backup = backup_root / backup.name
        target.rename(backup)
        actions.append({'path': str(backup), 'status': 'backup'})
    shutil.copytree(source, target)
    actions.append({'path': str(target), 'status': 'installed'})

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--agent', choices=['codex', 'claude', 'agents', 'custom'], default='codex')
    parser.add_argument('--dest', type=Path, help='Explicit skills discovery directory (required for custom/ZCode)')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--replace', action='store_true', help='Back up differing existing folders before replacing')
    parser.add_argument('--verify-only', action='store_true')
    parser.add_argument('--report', type=Path, help='Write a JSON report outside the skill discovery directory')
    args = parser.parse_args()
    count = verify_bundle()
    manifest = json.loads((ROOT / 'manifests/skills.json').read_text(encoding='utf-8'))
    print(f'Bundle integrity OK: {count} files')
    if args.verify_only:
        return 0
    if args.agent == 'custom' and args.dest is None:
        parser.error('--agent custom requires --dest; discover the agent\'s real skills directory first')
    defaults = {'codex': Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'skills', 'claude': Path.home() / '.claude/skills', 'agents': Path.home() / '.agents/skills'}
    dest = (args.dest or defaults[args.agent]).expanduser().resolve()
    if dest == ROOT or ROOT in dest.parents or dest in ROOT.parents:
        parser.error('Destination must be outside this repository and must not contain it')
    actions = []
    for source in sorted((ROOT / 'skills').iterdir()):
        install_tree(source, dest / source.name, args, actions)
    runtime = dest.parent / 'skillls-runtime/aris'
    install_tree(ROOT / 'runtime/aris', runtime, args, actions)
    conflicts = [a for a in actions if a['status'] == 'conflict-kept']
    report = {'dry_run': args.dry_run, 'destination': str(dest), 'snapshot_skill_count': sum(e['installation'] == 'snapshot' for e in manifest['skills']), 'actions': actions, 'pending_plugins': manifest['plugins'], 'builtin_skills': [e['name'] for e in manifest['skills'] if e['installation'] == 'builtin'], 'runtime_environment': {'ARIS_REPO': str(runtime)}, 'status': 'conflicts' if conflicts else ('planned' if args.dry_run else 'skill-files-installed; plugin-and-runtime-setup-pending')}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for a in actions:
        print(a['status'] + ': ' + a['path'])
    print('ARIS helper environment: ARIS_REPO=' + shlex.quote(str(runtime)))
    print('Pending: restore plugins / built-in capabilities using docs/PLUGINS.md; configure only needed dependencies in docs/DEPENDENCIES.md.')
    print(f"Snapshot definitions: {report['snapshot_skill_count']}. Plugins: {sum(len(p['skills']) for p in manifest['plugins'])} definitions in {len(manifest['plugins'])} packages. Codex built-ins: {len(report['builtin_skills'])}.")
    return 2 if conflicts else 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError) as exc:
        print('ERROR: ' + str(exc), file=sys.stderr)
        sys.exit(1)
