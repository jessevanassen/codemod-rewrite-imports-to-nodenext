import { createProgram } from 'typescript';

import { import1 } from './same-directory';
import { import2 } from './barrel';
import { import3 } from './barrel/';
import import4 from '../src/index';

const import5 = await import('./same-directory');
const import6 = await import('./barrel');
const import7 = await import('./barrel/');

export { import8 } from './same-directory';
export { import9 } from './barrel';
export { import10 } from './barrel/';
