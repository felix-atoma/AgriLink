import path from 'path';

/**
 * Validates a single route path for common errors
 * @param {string} routePath The route path to validate
 * @throws {Error} If the path is invalid
 */
export function validateRoutePath(routePath) {
  if (typeof routePath !== 'string') {
    throw new TypeError(`Route path must be a string, got ${typeof routePath}`);
  }

  // Check for empty parameters (/: with nothing after)
  const paramSegments = routePath.split('/:');
  if (paramSegments.length > 1) {
    for (let i = 1; i < paramSegments.length; i++) {
      const paramPart = paramSegments[i];
      const paramName = paramPart.split('/')[0].split('?')[0].split(')')[0];
      
      if (!paramName || paramName.trim() === '') {
        throw new Error(`Missing parameter name in path: "${routePath}" at position ${routePath.indexOf('/:')}`);
      }
      
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(paramName)) {
        throw new Error(`Invalid parameter name "${paramName}" in path: "${routePath}"`);
      }
    }
  }

  // Additional path validations
  if (routePath.includes('//')) {
    throw new Error(`Path contains double slashes: "${routePath}"`);
  }

  if (routePath.endsWith('/') && routePath.length > 1) {
    throw new Error(`Path should not end with slash: "${routePath}"`);
  }

  return true;
}

/**
 * Validates all routes in an Express router
 * @param {Object} router Express router instance
 * @param {string} basePath Base path prefix for the router
 * @throws {Error} If any route is invalid
 */
export function validateRouter(router, basePath = '') {
  if (!router || typeof router !== 'object' || !Array.isArray(router.stack)) {
    throw new Error('Invalid router object');
  }

  router.stack.forEach((layer, index) => {
    if (layer.route?.path) {
      const fullPath = path.posix.join(basePath, layer.route.path);
      try {
        validateRoutePath(layer.route.path);
      } catch (err) {
        throw new Error(`Route ${index + 1} validation failed (${fullPath}): ${err.message}`);
      }
    }
  });

  return true;
}