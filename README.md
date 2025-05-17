# commander-docgen

A CLI tool to generate Markdown documentation from [Commander.js](https://github.com/tj/commander.js) programs.

## Installation

```bash
bun a -g commander-docgen
```

## Usage

```bash
commander-docgen --entry ./path/to/your/cli.js --out MANUAL.md
```

Or run it directly without installing:

```bash
bunx commander-docgen --entry ./path/to/your/cli.js --out MANUAL.md
```


### Options

- `--entry <path>` - Path to module exporting a Commander `program` (required)
- `--out <path>` - Output file path (default: MANUAL.md)
- `--max-depth <n>` - Maximum subcommand depth to document

## Example

For a Commander.js program like:

```javascript
import { Command } from "commander";

const program = new Command()
  .name("mycli")
  .description("A sample CLI program")
  .version("1.0.0")
  .option("-d, --debug", "enable debugging")
  .option("-p, --port <number>", "port number", "80");

program
  .command("serve")
  .description("Start the server")
  .action(() => console.log("Starting server..."));

export { program };
```

Running:

```bash
commander-docgen --entry ./mycli.js
```

Will generate a Markdown file with complete documentation for your CLI.

## License

MIT
