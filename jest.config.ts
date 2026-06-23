import type { Config } from 'jest';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.test.ts',
  '!src/lib/prisma.ts',
]
} as Config;
