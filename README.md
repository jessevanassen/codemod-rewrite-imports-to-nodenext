# Rewrite imports to NodeNext

A codemod to rewrite extensionless imports or directory imports to the format required by TypeScripts `"moduleResolution": "NodeNext"`:
- Extensions are added to extensionless imports. The ".js" extension is used for TypeScript files.
- For directory imports, the import is rewritten so the contained "index.js" is imported.

Both top-level imports and dynamic imports are supported.

The script uses an AST parser to grab the import statements, which should reduce the amount of false-positives or false-negatives when matching imports.
