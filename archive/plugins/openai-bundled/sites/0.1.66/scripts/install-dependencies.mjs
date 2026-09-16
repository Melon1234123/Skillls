import {
  readProjectManifest,
  resolveYarnMajor,
  runPackageManager,
  selectPackageManager,
} from "./package-manager.mjs";
import {
  runMeasuredOperation,
  WorkflowError,
} from "./workflow-metrics.mjs";

// Preserve project install scripts and let the package manager handle its dependencies.
await runMeasuredOperation(() => {
  if (process.argv.length > 2) {
    throw new WorkflowError("install-dependencies.mjs takes no arguments; it uses this project's package scripts.", 64);
  }
  const manifest = readProjectManifest({ required: false });
  const manager = selectPackageManager(manifest);
  if (!manifest) {
    if (manager.hasLockfile) throw new WorkflowError("A lockfile exists without package.json.");
    return skipInstall();
  }
  // Work starter scripts own the seeded cache, runtime setup, and timeouts.
  const installCi = manifest.scripts?.["install:ci"];
  if (installCi !== undefined) {
    if (typeof installCi !== "string" || !installCi.trim()) {
      throw new WorkflowError("The install:ci script must be a nonempty string.");
    }
    return runPackageManager([manager.name, "run", "install:ci"]);
  }
  // Even dependency-free roots can need workspace linking or implicit install hooks.
  return runPackageManager(installCommand(manager));
});

function installCommand({ name, version, hasLockfile }) {
  if (name === "npm") return ["npm", hasLockfile ? "ci" : "install"];
  if (name === "pnpm" || name === "bun") {
    return hasLockfile
      ? [name, "install", "--frozen-lockfile"]
      : [name, "install"];
  }
  if (resolveYarnMajor(version) === 1) {
    return hasLockfile
      ? ["yarn", "install", "--frozen-lockfile", "--non-interactive"]
      : ["yarn", "install", "--non-interactive"];
  }
  return ["yarn", "install", hasLockfile ? "--immutable" : "--no-immutable"];
}

function skipInstall() {
  // No installer ran: succeed with an empty measurement list, not a latency sample.
  process.stdout.write("No dependency installation is needed.\n");
  return { code: 0, skipped: true };
}
