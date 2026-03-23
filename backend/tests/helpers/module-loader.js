const path = require('path');

const loadWithMocks = (targetModulePath, mocks) => {
  const modulePath = require.resolve(targetModulePath);

  delete require.cache[modulePath];

  const mockedPaths = [];

  for (const [dependencyPath, mockExports] of Object.entries(mocks)) {
    const resolvedDependencyPath = require.resolve(path.resolve(path.dirname(modulePath), dependencyPath));
    mockedPaths.push(resolvedDependencyPath);
    require.cache[resolvedDependencyPath] = {
      id: resolvedDependencyPath,
      filename: resolvedDependencyPath,
      loaded: true,
      exports: mockExports
    };
  }

  const loadedModule = require(modulePath);

  delete require.cache[modulePath];
  for (const mockedPath of mockedPaths) {
    delete require.cache[mockedPath];
  }

  return loadedModule;
};

module.exports = { loadWithMocks };
