import hashlib
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class BundleCoverageTests(unittest.TestCase):
    def test_every_manifest_skill_has_actual_content(self):
        manifest = json.loads((ROOT / 'manifests/skills.json').read_text())
        for entry in manifest['skills']:
            path = entry['path'] if entry['installation'] == 'snapshot' else entry['bundled_path']
            self.assertTrue((ROOT / path).is_file(), entry['id'])
    def test_source_archive_bytes_match_inventory(self):
        inventory = json.loads((ROOT / 'manifests/local-files.json').read_text())
        for entry in inventory['files']:
            actual = hashlib.sha256((ROOT / entry['path']).read_bytes()).hexdigest()
            self.assertEqual(actual, entry['sha256'], entry['source'])
    def test_excluded_categories_not_reintroduced(self):
        inventory = json.loads((ROOT / 'manifests/local-files.json').read_text())
        for entry in inventory['files']:
            self.assertNotIn('math-modeling', Path(entry['path']).parts)
            self.assertNotIn('run-starskill', Path(entry['path']).parts)
