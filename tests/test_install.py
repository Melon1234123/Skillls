import argparse
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('installer', Path(__file__).resolve().parents[1] / 'install.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)

class InstallationSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / 'source'
        self.source.mkdir()
        (self.source / 'SKILL.md').write_text('new')
        self.target = self.root / 'home/skills/example'
        self.args = argparse.Namespace(replace=False, dry_run=False)
        self.actions = []
    def tearDown(self):
        self.temp.cleanup()
    def run_install(self):
        installer.install_tree(self.source, self.target, self.args, self.actions)
    def test_dry_run_does_not_write(self):
        self.args.dry_run = True
        self.run_install()
        self.assertFalse(self.target.parent.exists())
    def test_install_and_repeat(self):
        self.run_install()
        self.assertEqual((self.target / 'SKILL.md').read_text(), 'new')
        self.run_install()
        self.assertEqual(self.actions[-1]['status'], 'unchanged')
    def test_conflict_preserves_user_data(self):
        self.run_install()
        (self.target / 'SKILL.md').write_text('user edit')
        self.run_install()
        self.assertEqual(self.actions[-1]['status'], 'conflict-kept')
        self.assertEqual((self.target / 'SKILL.md').read_text(), 'user edit')
    def test_replace_moves_backup_outside_discovery(self):
        self.run_install()
        (self.target / 'SKILL.md').write_text('user edit')
        self.args.replace = True
        self.run_install()
        backups = list((self.root / 'home/skillls-backups').glob('example.backup-*'))
        self.assertEqual(len(backups), 1)
        self.assertEqual((backups[0] / 'SKILL.md').read_text(), 'user edit')
        self.assertEqual((self.target / 'SKILL.md').read_text(), 'new')
    def test_existing_symlink_kept_without_replace(self):
        self.target.parent.mkdir(parents=True)
        self.target.symlink_to(self.source, target_is_directory=True)
        self.run_install()
        self.assertEqual(self.actions[-1]['status'], 'conflict-kept')
        self.assertTrue(self.target.is_symlink())
    def test_corrupt_bundle_rejected(self):
        repo = self.root / 'repo'
        (repo / 'skills/example').mkdir(parents=True)
        (repo / 'runtime').mkdir()
        (repo / 'manifests').mkdir()
        skill = repo / 'skills/example/SKILL.md'
        skill.write_text('original')
        (repo / 'manifests/checksums.json').write_text(json.dumps({'skills/example/SKILL.md': installer.digest(skill)}))
        with patch.object(installer, 'ROOT', repo):
            self.assertEqual(installer.verify_bundle(), 1)
            skill.write_text('tampered')
            with self.assertRaises(ValueError):
                installer.verify_bundle()

if __name__ == '__main__':
    unittest.main()
