/** Jest root config – CommonJS output, .env loaded, path aliases kept */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  /* load .env so Supabase keys exist in tests */
  setupFiles: ['dotenv/config'],

  /* test + source roots */
  roots: ['<rootDir>/gui'],

  /* path aliases “@/ …” and “~/ …” */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/gui/src/$1',
    '^~/(.*)$': '<rootDir>/gui/src/$1'
  },

  /* compile TS ➜ CommonJS (removes import.meta etc.) */
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: 'tsconfig.json', compilerOptions: { module: 'CommonJS', target: 'ES2020' } }
    ]
  }
};
