import typescriptParser from 'recast/parsers/typescript.js';
import { ImportProcessor } from './processors/index.js';
import { StringLiteralKind } from 'ast-types/gen/kinds.js';
import { parse, print, visit } from 'recast';


/**
 * Processes all the imports, and returns the new contents with the imports
 * replaced. Determining what the new value of the import should be is
 * delegated to the `importProcessor`.
 *
 * @param content The content of the file to process.
 * @param importProcessor The processor used to process the imports.
 * @returns The new content, with the imports replaced.
 */
export function processImports(content: string, importProcessor: ImportProcessor): string {
	const ast = parse(content, { parser: typescriptParser });

	function rewriteImport(importLocation: StringLiteralKind) {
		const newValue = importProcessor(importLocation.value);
		if (newValue != null) {
			importLocation.value = newValue;
		}
	}

	visit(ast, {
		visitImportDeclaration(node) {
			rewriteImport(node.value.source);

			this.traverse(node);
		},
		visitExportNamedDeclaration(node) {
			if (node.value.source) {
				// An export node can either be a node that re-exports from a
				// different file, or a node that exports variables. Only the
				// former contains a "source" property, and those are the only
				// ones to rewrite.
				rewriteImport(node.value.source);
			}

			this.traverse(node);
		},
		visitExportAllDeclaration(node) {
			rewriteImport(node.value.source);

			this.traverse(node);
		},
		visitCallExpression(node) {
			if (node.value.callee.type === 'Import') {
				rewriteImport(node.value.arguments[0]);
			}

			this.traverse(node);
		},
	});

	return print(ast, { quote: 'single' }).code;
}
