import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const template = fileURLToPath(
  new URL("../skills/sites-building/templates/vinext-starter/", import.meta.url),
);

test("Vinext rejects duplicate previews and restarts after a stopped server", { timeout: 90000 }, async (t) => {
  const installed = process.env.SITES_TEST_PROJECT_ROOT;
  assert.ok(installed, "Set SITES_TEST_PROJECT_ROOT to an installed starter checkout");

  // Separate projects share only the installed dependencies, not dev-server state.
  const root = await mkdtemp(path.join(installed, ".preview-test-"));
  const servers = [];
  t.after(async () => {
    for (const server of servers) {
      if (server.child.exitCode === null && server.child.signalCode === null) {
        server.child.kill("SIGKILL");
      }
    }
    await Promise.all(servers.map((server) => server.exited));
    await rm(root, { recursive: true, force: true });
  });
  await cp(template, root, { recursive: true });

  function start() {
    const child = spawn(process.execPath, [
      path.join(installed, "node_modules", "vinext", "dist", "cli.js"),
      "dev", "--port", "0",
    ], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const server = {
      child,
      output: "",
      exited: new Promise((resolve, reject) => {
        child.once("exit", (code) => resolve(code));
        child.once("error", reject);
      }),
    };
    child.stdout.on("data", (data) => { server.output += data; });
    child.stderr.on("data", (data) => { server.output += data; });
    servers.push(server);
    return server;
  }

  const lockPath = path.join(root, ".vinext", "dev", "lock.json");
  async function preview(server) {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      assert.equal(server.child.exitCode, null, server.output);
      assert.equal(server.child.signalCode, null, server.output);
      try {
        const lock = JSON.parse(await readFile(lockPath, "utf8"));
        if (lock.pid === server.child.pid && lock.port > 0) {
          const response = await fetch(lock.appUrl, { signal: AbortSignal.timeout(2000) });
          await response.text();
          if (response.ok) return lock.appUrl;
        }
      } catch {
        // The server can publish its PID before it finishes listening/compiling.
      }
      await delay(100);
    }
    assert.fail(`Preview did not become ready:\n${server.output}`);
  }

  const first = start();
  const url = await preview(first);
  const duplicate = start();
  assert.equal(await duplicate.exited, 1, duplicate.output);
  assert.match(duplicate.output, /Another vinext dev server is already running/);
  assert.equal((await fetch(url)).status, 200, "original preview stays available");

  // An unclean stop leaves a real stale lock for the next launch to recover.
  first.child.kill("SIGKILL");
  await first.exited;
  assert.equal(JSON.parse(await readFile(lockPath, "utf8")).pid, first.child.pid);
  const restarted = start();
  assert.ok(await preview(restarted));
});
