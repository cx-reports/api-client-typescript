import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // ts-jest configuration goes here
      },
    ],
  },
};

export default jestConfig;
