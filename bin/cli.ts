#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { cwd } from 'node:process';


const { files, aliases, extensions } = parseArguments();


for (const file of files) {
	const path = isAbsolute(file) ? file : resolve(cwd(), file);

	const input = readFileSync(path, 'utf-8');

	const processor = ResolveRelativeImports({
		dirname: dirname(path),
		aliases, additionalExtensions: extensions,
	});
	const output = processImports(input, processor);
	
	writeFileSync(path, output, 'utf-8');
}


import { parseArgs } from 'node:util';
import { ResolveRelativeImports } from '../src/index.js';
import { processImports } from '../src/process-imports.js';
function parseArguments(): { files: string[], aliases: Record<string, string>; extensions: string[] } {
	const HELP = `
Usage: codemod-rewrite-imports-to-nodenext [--alias="prefix=path"]... [--ext=".ext"]...  [file]...

Rewrites the import statements in the specified files.
Extensions are added to extensionless imports, and the import for the "index.js"
is included when a directory is imported.

  --alias="prefix=path"  Replaces prefixes with the specified paths when
                         resolving imports. Can either be an absolute path, or
                         a path relative to the current working directory.
                         Can be repeated.
  --ext=".ext"           Add additional extensions for extensionless imports.
                        .js and .ts are always included by default.
                         Can be repeated.
  -h, --help             Show this help.

Example:
  rewrite-imports \\
      --alias="src=./src/" --alias="test=./test/" \\
      --ext=".json" --ext=".vue" \\
      "src/index.ts" "src/another.ts"

`.trim();

	try {
		const {
			positionals: files,
			values: { alias, ext, help: showHelp }
		} = parseArgs({
			args: process.argv.slice(2),
			options: {
				alias: { type: 'string', multiple: true, default: [] },
				ext: { type: 'string', multiple: true, default: [] },
				help: { type: 'boolean', short: 'h', default: false },
			},
			allowPositionals: true,
			strict: true,
		});

		if (showHelp) {
			console.log(HELP);
			process.exit(0);
		}

		const aliases = Object.fromEntries((alias ?? []).map(a => {
			let [prefix, path] = a.split('=', 2);

			if (prefix === undefined || path === undefined) {
				throw new Error('Invalid alias format');
			}

			if (!isAbsolute(path)) {
				path = resolve(cwd(), path);
			}

			return [prefix, path];
		}));


		return { files, aliases, extensions: ext ?? [] };
	} catch (ex: any) {
		console.error(ex.message);
		console.error();
		console.error(HELP);
		process.exit(1);
	}
}
