import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("server-renders an accessible starter loading preview", async () => {
  assert.ok(
    process.env.SITES_TEST_PROJECT_ROOT,
    "Set SITES_TEST_PROJECT_ROOT to a built, unmodified starter checkout",
  );
  const workerUrl = pathToFileURL(
    `${process.env.SITES_TEST_PROJECT_ROOT}/dist/server/index.js`,
  );
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);

  const status = html.match(/<output\b([^>]*)>([\s\S]*?)<\/output>/i);
  assert.ok(status, "the loading preview exposes a status region");
  assert.match(status[1], /\baria-live="polite"/);
  assert.match(status[1], /\baria-atomic="true"/);
  assert.match(status[2], /<h1\b[^>]*>Your site is taking shape<\/h1>/);
  assert.match(html, /<header\b[^>]*\baria-hidden="true"/);
});
