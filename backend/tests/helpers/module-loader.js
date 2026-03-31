const path = require('path');

const backendRoot = path.resolve(__dirname, '..', '..');

const unique = (items) => [...new Set(items)];

const buildBackendPathVariants = (absolutePath) => {
  const normalizedPath = path.normalize(absolutePath);
  const variants = [normalizedPath];
  const backendPrefix = `${backendRoot}${path.sep}`;
  const backendSrcPrefix = `${path.join(backendRoot, 'src')}${path.sep}`;

  if (normalizedPath.startsWith(backendSrcPrefix)) {
    variants.push(path.join(backendRoot, normalizedPath.slice(backendSrcPrefix.length)));
  } else if (normalizedPath.startsWith(backendPrefix)) {
    variants.push(path.join(backendRoot, 'src', normalizedPath.slice(backendPrefix.length)));
  }

  return unique(variants);
};

const resolvePathWithFallback = (moduleSpecifier, baseDirectory = __dirname) => {
  const attemptedSpecifiers = [];

  const tryResolve = (candidate) => {
    attemptedSpecifiers.push(candidate);
    try {
      return require.resolve(candidate);
    } catch {
      return null;
    }
  };

  const directResolution = tryResolve(moduleSpecifier);
  if (directResolution) {
    return directResolution;
  }

  if (!moduleSpecifier.startsWith('.') && !path.isAbsolute(moduleSpecifier)) {
    throw new Error(`Cannot resolve module "${moduleSpecifier}". Tried: ${attemptedSpecifiers.join(', ')}`);
  }

  const absoluteBasePath = path.isAbsolute(moduleSpecifier)
    ? moduleSpecifier
    : path.resolve(baseDirectory, moduleSpecifier);

  for (const variantPath of buildBackendPathVariants(absoluteBasePath)) {
    const resolved = tryResolve(variantPath);
    if (resolved) {
      return resolved;
    }
  }

  throw new Error(`Cannot resolve module "${moduleSpecifier}". Tried: ${attemptedSpecifiers.join(', ')}`);
};

const loadWithMocks = (targetModulePath, mocks) => {
  const modulePath = resolvePathWithFallback(targetModulePath, __dirname);
  const cacheBeforeLoad = new Set(Object.keys(require.cache));

  delete require.cache[modulePath];

  const mockedPaths = [];

  for (const [dependencyPath, mockExports] of Object.entries(mocks)) {
    const resolvedDependencyPath = resolvePathWithFallback(dependencyPath, path.dirname(modulePath));
    mockedPaths.push(resolvedDependencyPath);
    require.cache[resolvedDependencyPath] = {
      id: resolvedDependencyPath,
      filename: resolvedDependencyPath,
      loaded: true,
      exports: mockExports
    };
  }

  const loadedModule = require(modulePath);
  const loadedDuringRequire = Object.keys(require.cache).filter((cachedPath) => !cacheBeforeLoad.has(cachedPath));

  delete require.cache[modulePath];
  for (const mockedPath of mockedPaths) {
    delete require.cache[mockedPath];
  }
  for (const loadedPath of loadedDuringRequire) {
    delete require.cache[loadedPath];
  }

  return loadedModule;
};

module.exports = { loadWithMocks };
