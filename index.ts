#!/usr/bin/env bun

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { version } from "./package.json";

function genInstallSection(pkgPath: string, level = 2, title?: string): string {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const name: string = pkg.name;

  return `${"#".repeat(level)} ${title || "Install"}

:::code-group

\`\`\`shell [bun]
bun a -g ${name}
\`\`\`

\`\`\`shell [npm]
npm i -g ${name}
\`\`\`

:::
`;
}

function genUsageSection(cmd: Command, { maxDepth = Infinity }: { maxDepth?: number }, depth = 0, level = 2): string {
  const fullName = getFullName(cmd);
  const desc = cmd.description();
  const helpLine = `${fullName} --help`;
  const helpText = cmd.helpInformation();

  const section = [
    `${"#".repeat(level)} ${depth == 0 ? "Usage" : fullName}`,
    desc,
    "```bash\n" + helpLine + "\n```",
    "```\n" + helpText.trim() + "\n```",
  ].join("\n\n");

  if (depth >= maxDepth || cmd.commands.length === 0) return section + "\n";
  const subSections = cmd.commands
    .filter((c) => c.name() !== "help")
    .map((sub) => genUsageSection(sub, { maxDepth }, depth + 1, level + 1));
  return [section, ...subSections].join("\n\n");
}

const cli = new Command()
  .name("commander-docgen")
  .description("Generate docs from a commander.js program")
  .showHelpAfterError(true)
  .requiredOption("--entry <path>", "Path to module exporting `program`")
  .option("--out <path>", "Output file path", "MANUAL.md")
  .option("--max-depth <num>", "Max subcommand depth", parseInt, 3)
  .version(version);

async function main() {
  cli.parse();
  const { entry, out, maxDepth } = cli.opts();
  try {
    const entryPath = path.resolve(process.cwd(), entry);
    const { program } = await import(entryPath);
    if (!program?.helpInformation) throw new Error("Entry must export a Commander `program`");

    const pkgPath = findPackageJson(entryPath);
    const installation = genInstallSection(pkgPath);
    const usage = genUsageSection(program, { maxDepth });
    const doc = `---
title: ${program.name()}
---

# ${program.name()}

${program.description()}

${installation}

${usage}`;
    fs.writeFileSync(path.resolve(process.cwd(), out), doc);
    console.log(`Written to ${out}`);
  } catch (err: any /*eslint-disable-line @typescript-eslint/no-explicit-any*/) {
    console.error(`${err.message}`);
    process.exit(1);
  }
}

function getFullName(cmd: Command): string {
  const names: string[] = [];
  for (let c: Command | null = cmd; c; c = c.parent) {
    if (c.name()) names.unshift(c.name());
  }
  return names.join(" ");
}

function findPackageJson(startPath: string): string {
  let dir = path.dirname(startPath);
  const root = path.parse(dir).root;

  while (dir !== root) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }

  throw new Error(`package.json not found near ${startPath}`);
}

await main();
