# Managed Linux preview

## Development and first preview

This profile's internal supervised preview is not a user-facing browser handoff. Do not start a development server or agent preview for ordinary creation or editing; use the supervised preview only for explicitly requested browser QA.

An **agent preview** is the live checkout served internally by `sites-preview` for explicitly requested browser QA. It is not deployed and is never a user-facing deliverable. If started for QA, keep it through build and hosting, then use `sites-preview stop` during final teardown; do not kill unrelated processes.

## Preview handoff

There is no local handoff in this environment. Never navigate the cloud browser to a live Sites URL; those URLs are not reachable from that runtime.

## Browser testing

Only start an agent preview or use the cloud browser when the user explicitly requests browser, visual, or end-to-end testing. Before the first cloud-browser action, load and read `$control-browser` and follow it for browser setup, tab selection, navigation, interaction, screenshots, and cleanup. If it is unavailable, do not improvise another browser-control path.

For a project with a compatible development server, run from its checkout:

```bash
sites-preview start "$PWD"
```

Open only `http://terminal.local:4173/` in the cloud browser. Use plain HTTP, never HTTPS, loopback, another host or port, or a deployed Site URL. The address is internal: never expose it to the user. For an explicit post-navigation wait, use `load`, not the unsupported `networkidle` state.

Do not start the development server directly. The bundled Vinext starter is already configured for the supervised preview runtime. For startup failures or older Vite/Vinext projects, use the `sites-preview-troubleshooting` skill, retaining only the smallest proven compatibility repair. If it is not available in the current bundle, report that limitation and apply the publication boundary below. Plain static assets and the buildless Worker starter have no compatible development server.

Fix source defects found by requested QA before publishing. Unavailable preview infrastructure does not block deployment of a validated site unless the user explicitly made passing browser QA a condition of publication; report the testing limitation when it affects confidence.
