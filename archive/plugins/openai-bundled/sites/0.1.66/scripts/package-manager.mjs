import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { runCommand, WorkflowError } from "./workflow-metrics.mjs";

// Setup, installation, and builds use the same package-manager conventions.
export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"];
const LOCKFILES = {
  npm: ["npm-shrinkwrap.json", "package-lock.json"],
  pnpm: ["pnpm-lock.yaml"],
  yarn: ["yarn.lock"],
  bun: ["bun.lock", "bun.lockb"],
};

export function readProjectManifest({ required = true } = {}) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync("package.json", "utf8"));
  } catch (error) {
    if (!required && error.code === "ENOENT") return undefined;
    throw new WorkflowError("A readable, valid package.json is required for this Sites operation.");
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new WorkflowError("package.json must contain an object.");
  }
  return manifest;
}

export function selectPackageManager(manifest) {
  let declared;
  let version;
  if (manifest?.packageManager !== undefined) {
    const match =
      typeof manifest.packageManager === "string" &&
      /^(npm|pnpm|yarn|bun)(?:@([^\s]+))?$/.exec(manifest.packageManager);
    if (!match) {
      throw new WorkflowError("Unsupported packageManager; expected npm, pnpm, yarn, or bun.");
    }
    [, declared, version] = match;
  }
  // Declarations select the manager only when lockfiles agree. Otherwise infer
  // from a single lockfile family, then a pnpm workspace, before defaulting to npm.
  const locked = PACKAGE_MANAGERS.filter((manager) =>
    LOCKFILES[manager].some((file) => existsSync(file)),
  );
  if (locked.length > 1 || (declared && locked.length && locked[0] !== declared)) {
    throw new WorkflowError("Conflicting packageManager and lockfiles; preserve one intended package manager.");
  }
  return {
    name: declared ?? locked[0] ?? (existsSync("pnpm-workspace.yaml") ? "pnpm" : "npm"),
    version,
    hasLockfile: locked.length > 0,
  };
}

export function runPackageManager(command) {
  const invocation = packageManagerInvocation(command);
  return runCommand(invocation.command, {
    windowsVerbatimArguments: invocation.windowsVerbatimArguments,
  });
}

function packageManagerInvocation(command) {
  if (!PACKAGE_MANAGERS.includes(command[0])) {
    throw new WorkflowError("Unsupported package manager.", 64);
  }
  if (process.platform !== "win32") {
    return { command, windowsVerbatimArguments: false };
  }
  // Windows manager shims need cmd.exe. These are fixed, generated tokens;
  // reject shell syntax instead of trying to escape arbitrary paths or commands.
  if (!command.every((token) => typeof token === "string" && /^[\w@./,:+=-]+$/.test(token))) {
    throw new WorkflowError("Unsupported character in a Sites package-manager argument.", 64);
  }
  const quoted = command.map((token) => `"${token}"`).join(" ");
  return {
    command: [process.env.ComSpec || "cmd.exe", "/d", "/s", "/c", `"${quoted}"`],
    windowsVerbatimArguments: true,
  };
}

export function resolveYarnMajor(version) {
  // Classic and modern Yarn need different lockfile flags. Probe only when the
  // packageManager declaration does not already identify the major version.
  let major = Number.parseInt(version ?? "", 10);
  if (Number.isInteger(major) && major > 0) return major;
  const { command: [executable, ...args], windowsVerbatimArguments } =
    packageManagerInvocation(["yarn", "--version"]);
  const result = spawnSync(executable, args, {
    windowsVerbatimArguments,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
    maxBuffer: 4096,
  });
  major = Number.parseInt(result.stdout?.trim() ?? "", 10);
  if (result.status !== 0 || !Number.isInteger(major) || major < 1) {
    throw new WorkflowError("Unable to determine Yarn's version; declare an exact Yarn packageManager version.");
  }
  return major;
}
