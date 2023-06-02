// https://jestjs.io/docs/configuration
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */


const esModules = ["axios"].join('|')

module.exports = {
    verbose: true,
    bail: true,
    collectCoverageFrom: [
        "src/**/*.ts*"
    ],
    coverageDirectory: "./test_report.txt",
    coveragePathIgnorePatterns: [
        "node_modules",
        "src/index.tsx",
        "tests",
        "base/utils/Axios"
    ],
    coverageReporters: ["text"],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: -100,
        },
        './src/app/pages/': {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: -100,
        },
    },
    errorOnDeprecated: true,
    preset: 'ts-jest',
    setupFiles: ["./src/tests/testSetup.tsx"],
    setupFilesAfterEnv: ["./jest.setup.ts"],
    transform: {
        "\\.(ts|tsx)$": [
            "ts-jest", {
                tsconfig: "./tsconfig.jest.json",
                isolatedModules: true
            }
        ],
        "\\.(js|jsx)$": "./jest.babel.js",
        [`^(${esModules}).+\\.js$`]: 'babel-jest',
        ".+\\.(css|scss|png|jpg|svg)$": "jest-transform-stub",
    },
    testEnvironment: 'jest-environment-jsdom',
    transformIgnorePatterns: [`node_modules/(?!(${esModules}))`]
}
