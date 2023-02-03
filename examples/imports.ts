import { createProgram } from 'typescript';
import { bar } from './same-directory';
import { baz } from './barrel/index.js';
import foo from '../src/index';

const myThing = await import('./same-directory');
