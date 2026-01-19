export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    // transform: {
    //   '^.+\\.tsx?$': 'ts-jest',
    // },
    setupFiles: ['<rootDir>/jest.setup.js'],
};
