// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  transform: {
    "^.+\\.jsx?$": [
      "esbuild-jest",
      {
        sourcemap: true,
        loaders: {
          ".test.jsx": "jsx",
        },
      },
    ],
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/fileMock.js",
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};

export default config;
