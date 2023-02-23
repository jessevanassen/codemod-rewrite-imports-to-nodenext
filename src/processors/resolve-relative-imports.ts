import { existsSync, lstatSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { ImportProcessor } from './import-processor.js';

type Options = {
	dirname: string;
	aliases?: { [prefix: string]: string };
	additionalExtensions?: string[];
};

const DEFAULT_EXTENSIONS = Object.freeze(['.js', '.ts']);

export function ResolveRelativeImports({
	dirname,
	aliases = {},
	additionalExtensions = [],
}: Options): ImportProcessor {
	const extensions = [...DEFAULT_EXTENSIONS, ...additionalExtensions];

	const resolvePath = (path: string): string => {
		for (const [prefix, aliasPath] of Object.entries(aliases)) {
			if (path.startsWith(prefix)) {
				return join(aliasPath, path.slice(prefix.length));
			}
		}

		return resolve(dirname, path);
	}

	const resolveExtension = (path: string): string => {
		let extension = extensions
			.find(ext => isFile(path + ext));

		if (extension === '.ts') {
			extension = '.js';
		}

		return extension ?? '';
	};

	return importPath => {
		const resolvedPath = resolvePath(importPath);

		if (isDirectory(resolvedPath)) {
			/* Not using path.join here, as that will use os-specific path
			 * separators, and imports requires the '/' separator. */
			return importPath +
				(!importPath.endsWith('/') ? '/' : '') +
				'index.js';
		}

		if (!hasExtension(resolvedPath)) {
			return importPath + resolveExtension(resolvedPath);
		}

		return null;
	};
}

function hasExtension(path: string): boolean {
	return extname(path) !== '';
}

function isFile(path: string): boolean {
	return existsSync(path) && lstatSync(path).isFile();
}

function isDirectory(path: string): boolean {
	return existsSync(path) && lstatSync(path).isDirectory();
}
