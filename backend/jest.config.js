// backend/jest.config.js
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  coverageProvider: "v8",
  verbose: true,
  transform: {}, // no Babel ni ts-jest
};
