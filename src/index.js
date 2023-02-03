#!/usr/bin/env node

import { parse, print } from 'recast';
import typescriptParser from 'recast/parsers/typescript.js';
import { visit } from 'ast-types';

import { argv, cwd } from 'node:process';
import path from 'node:path';
import { readFileSync, existsSync, lstatSync, writeFileSync } from 'node:fs';


for (const filename of argv.slice(2)) {
	const filePath = path.resolve(cwd(), filename);
	processFile(filePath);
}

/**
 * @param {string} absolutePath
 */
function processFile(absolutePath) {
	try {
		const content = readFileSync(absolutePath, 'utf-8');
		const base = path.dirname(absolutePath);
		const processed = process(base, content);

		if (processed !== content) {
			writeFileSync(absolutePath, processed, 'utf-8');
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param {string} base
 * @param {string} src
 * @returns {string}
 */
function process(base, src) {
	const ast = parse(src, { parser: typescriptParser });

	visit(ast, {
		visitImportDeclaration(node) {
			rewriteImport(base, node.value.source);

			this.traverse(node);
		},
		visitCallExpression(node) {
			if (node.value.callee.type === 'Import') {
				rewriteImport(base, node.value.arguments[0]);
			}

			this.traverse(node);
		},
	});

	return print(ast).code;
}


/**
 * @param {string} base
 * @param {import('ast-types/gen/kinds.js').StringLiteralKind} ref
 */
function rewriteImport(base, ref) {
	const rewritten = toExtensionImport(base, ref.value);
	if (rewritten !== null) {
		ref.value = rewritten;
	}
}

/**
 * @param {string} base
 * @param {string} relativePath
 * @returns {string|null}
 */
function toExtensionImport(base, relativePath) {
	if (!isRelativePath(relativePath)) {
		return null;
	}

	const importPath = path.resolve(base, relativePath);

	if (isDirectory(importPath)) {
		let newPath = path.join(relativePath, 'index.js');

		// path.join removes the leading './'
		if (!isRelativePath(newPath)) { 
			newPath = './' + newPath;
		}

		return newPath;
	} else if (isExtensionlessSourceFile(importPath)) {
		return relativePath + '.js';
	}

	return null;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isExtensionlessSourceFile(path) {
	return ['.js', '.ts']
		.map(ext => path + ext)
		.some(f => isFile(f))
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isRelativePath(path) {
	return path.startsWith('.');
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isFile(path) {
	return existsSync(path) && lstatSync(path).isFile();
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isDirectory(path) {
	return existsSync(path) && lstatSync(path).isDirectory();
}
