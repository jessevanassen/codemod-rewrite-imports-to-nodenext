import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { dirname, resolve } from 'node:path';
import { processImports, ResolveRelativeImports } from '../src/index.js';

const __dirname = dirname(new URL(import.meta.url).pathname);

describe('Relative imports', () => {
	it('Extensions are added when pointing to a JavaScript file', () => {
		test(
			"import './fixture/same-directory-js';",
			"import './fixture/same-directory-js.js';",
		);
	});

	it('Extensions are added when pointing to a TypeScript file', () => {
		test(
			"import './fixture/same-directory-ts';",
			"import './fixture/same-directory-ts.js';",
		);
	});
	
	it('Extensions are added when pointing to a directory containing an index.js', () => {
		test(
			"import './fixture/barrel-js';",
			"import './fixture/barrel-js/index.js';",
		);
	});
	
	it('Extensions are added when pointing to a directory containing an index.ts', () => {
		test(
			"import './fixture/barrel-ts';",
			"import './fixture/barrel-ts/index.js';",
		);
	});
});

it('Additional extensions can be added', () => {
	test(
		"import './fixture/vue-file';",
		"import './fixture/vue-file';",
		{ additionalExtensions: [] },
	);
	test(
		"import './fixture/vue-file';",
		"import './fixture/vue-file.vue';",
		{ additionalExtensions: ['.vue'] },
	);
});

it('Aliases can be specified', () => {
	test(
		"import 'root/test/fixture/same-directory-js';",
		"import 'root/test/fixture/same-directory-js';",
	);
	test(
		"import 'root/test/fixture/same-directory-js';",
		"import 'root/test/fixture/same-directory-js.js';",
		{ aliases: {
			'root': resolve(__dirname, '..'),
		}}
	);
});

type Options = Pick<
	Parameters<typeof ResolveRelativeImports>[0],
	'additionalExtensions'|'aliases'>;
function test(input: string, expected: string, options: Options = {}) {
	const processor = ResolveRelativeImports({ dirname: __dirname, ...options });
	const actual = processImports(input, processor);
	strictEqual(actual, expected);
}
