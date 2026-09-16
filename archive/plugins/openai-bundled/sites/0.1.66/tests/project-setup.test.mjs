import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const initializer = fileURLToPath(
  new URL("../scripts/project-setup.mjs", import.meta.url),
);

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "sites-init-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, "site (é) & space");
  const bin = path.join(root, "bin");
  const callsFile = path.join(root, "calls.jsonl");
  await mkdir(target);
  await mkdir(bin);
  await writeFile(
    path.join(bin, "npm"),
    `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
appendFileSync(process.env.CALLS_FILE, JSON.stringify({
  command: "npm",
  args: process.argv.slice(2),
  cwd: process.cwd(),
}) + "\\n");
`,
    { mode: 0o755 },
  );
  if (process.platform === "win32") {
    await writeFile(
      path.join(bin, "npm.cmd"),
      `@"${process.execPath}" "${path.join(bin, "npm")}" %*\r\n`,
    );
  }
  return {
    root,
    target,
    run() {
      return spawnSync(process.execPath, [initializer], {
        cwd: target,
        env: {
          ...process.env,
          PATH: `${bin}${path.delimiter}${process.env.PATH}`,
          CALLS_FILE: callsFile,
        },
        encoding: "utf8",
      });
    },
    async calls() {
      return (await readFile(callsFile, "utf8"))
        .trim()
        .split("\n")
        .map(JSON.parse);
    },
  };
}

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

for (const gitKind of [
  "absent",
  "empty directory",
  "repository",
  "read-only repository",
  "worktree",
  "nested in parent",
]) {
  test(`initializes a starter with .git ${gitKind}`, async (t) => {
    const f = await fixture(t);
    const gitPath = path.join(f.target, ".git");
    let gitdir;
    let head;
    if (gitKind === "empty directory") await mkdir(gitPath);
    if (gitKind.endsWith("repository")) {
      git(f.target, "init", "-b", "existing");
      head = git(f.target, "symbolic-ref", "HEAD");
      if (gitKind === "read-only repository") await chmod(gitPath, 0o555);
    }
    if (gitKind === "worktree") {
      const parent = path.join(f.root, "parent");
      await mkdir(parent);
      git(parent, "init", "-b", "main");
      git(
        parent,
        "-c", "user.name=Test",
        "-c", "user.email=test@example.com",
        "commit", "--allow-empty", "-m", "fixture",
      );
      git(parent, "worktree", "add", "-b", "site", f.target);
      gitdir = await readFile(gitPath, "utf8");
      head = git(f.target, "rev-parse", "HEAD");
    }
    if (gitKind === "nested in parent") git(f.root, "init", "-b", "parent");
    const result = f.run();
    if (gitKind === "read-only repository") await chmod(gitPath, 0o755);
    assert.equal(result.status, 0, result.stderr);
    const calls = await f.calls();
    assert.deepEqual(
      calls.map(({ command, args }) => ({ command, args })),
      [
        {
          command: "npm",
          args: [
            "--prefix",
            ".",
            "--workspaces=false",
            "run",
            "install:ci",
          ],
        },
      ],
    );
    assert.equal(calls[0].cwd, await realpath(f.target));
    if (gitKind === "absent" || gitKind === "nested in parent")
      await assert.rejects(readFile(gitPath), { code: "ENOENT" });
    if (gitKind === "empty directory")
      assert.deepEqual(await readdir(gitPath), []);
    if (gitKind.endsWith("repository"))
      assert.equal(git(f.target, "symbolic-ref", "HEAD"), head);
    if (gitKind === "worktree") {
      assert.equal(await readFile(gitPath, "utf8"), gitdir);
      assert.equal(git(f.target, "rev-parse", "HEAD"), head);
    }
    if (gitKind === "nested in parent")
      assert.equal(git(f.root, "symbolic-ref", "HEAD"), "refs/heads/parent");
    const hosting = JSON.parse(
      await readFile(path.join(f.target, ".openai", "hosting.json"), "utf8"),
    );
    assert.equal(hosting.project_id, undefined);
    assert.ok(
      (await readFile(path.join(f.target, "package-lock.json"), "utf8"))
        .length > 0,
    );
  });
}

test("copies and installs without writing to a read-only empty .git", async (t) => {
  if (process.platform === "win32")
    return t.skip("Windows directory permissions are not controlled by chmod");
  const f = await fixture(t);
  const gitPath = path.join(f.target, ".git");
  await mkdir(gitPath);
  await chmod(gitPath, 0o555);
  try {
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readdir(gitPath), []);
    assert.ok(await readFile(path.join(f.target, "package.json"), "utf8"));
    assert.equal((await f.calls()).length, 1);
  } finally {
    await chmod(gitPath, 0o755);
  }
});

test("preserves an invalid gitfile while copying and installing", async (t) => {
  const f = await fixture(t);
  const gitPath = path.join(f.target, ".git");
  const invalid = "gitdir: ../missing-repository\n";
  await writeFile(gitPath, invalid);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(gitPath, "utf8"), invalid);
  assert.ok(await readFile(path.join(f.target, "package.json"), "utf8"));
  assert.equal((await f.calls()).length, 1);
});

test("refuses to overwrite an existing project", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.target, "package.json");
  await writeFile(file, '{"name":"existing"}\n');
  const result = f.run();
  assert.equal(result.status, 2, result.stderr);
  assert.equal(await readFile(file, "utf8"), '{"name":"existing"}\n');
  await assert.rejects(f.calls(), { code: "ENOENT" });
});

for (const alreadyTracked of [false, true]) {
  test(`preserves metadata without staging new files (tracked: ${alreadyTracked})`, async (t) => {
    const f = await fixture(t);
    for (const name of [".agents", ".codex"]) {
      await mkdir(path.join(f.target, name));
      await writeFile(path.join(f.target, name, "local.txt"), "local metadata");
    }
    if (alreadyTracked) {
      git(f.target, "init", "-b", "existing");
      git(f.target, "add", ".agents/local.txt", ".codex/local.txt");
    }
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    if (!alreadyTracked) git(f.target, "init", "-b", "site");
    await mkdir(path.join(f.target, "app", ".codex"));
    await writeFile(path.join(f.target, "app", ".codex", "content.txt"), "app content");
    git(f.target, "add", ".");
    const staged = git(f.target, "ls-files").split("\n");
    for (const name of [".agents", ".codex"]) {
      assert.equal(await readFile(path.join(f.target, name, "local.txt"), "utf8"), "local metadata");
      assert.equal(staged.includes(`${name}/local.txt`), alreadyTracked);
    }
    assert.ok(staged.includes(".openai/hosting.json"));
    assert.ok(staged.includes("app/.codex/content.txt"));
  });
}
