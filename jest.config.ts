import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  // needed to fix weird imports requiring .js extension
  moduleNameMapper: {
    "(.+)\\.js": "$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        // ts-jest configuration goes here
      },
    ],
  },
  modulePathIgnorePatterns: ["dist"],
};

export default jestConfig;
