import eslint   from '@eslint/js';
import globals  from 'globals';
import tseslint from 'typescript-eslint';

export default [
   eslint.configs.recommended,
   ...tseslint.configs.strict,
   { ignores: ['org.pozil.restream.sdPlugin/**'] },
   {
      files: ['*.mjs'],
      languageOptions: { globals: { ...globals.node } }
   }
];