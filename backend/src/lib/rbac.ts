import prisma from './prisma';

/** Counter write paths: increment and decrement share the same permission. */
const COUNTER_WRITE_PATHS = ['/api/counter/increment', '/api/counter/decrement'];

/**
 * Returns true if the given endpoint and method cover the request (path + method).
 * Counter write: either mapping for /api/counter or one of the write paths allows both.
 */
function mappingCoversRequest(
  endpoint: string,
  method: string,
  requestMethod: string,
  requestPath: string
): boolean {
  const methodMatch =
    method === '*' || method.toUpperCase() === requestMethod.toUpperCase();
  const isCounterWrite =
    requestMethod.toUpperCase() === 'POST' &&
    COUNTER_WRITE_PATHS.includes(requestPath);
  let pathMatch =
    requestPath === endpoint ||
    requestPath.startsWith(endpoint.endsWith('/') ? endpoint : `${endpoint}/`);
  if (!pathMatch && isCounterWrite && methodMatch) {
    pathMatch =
      endpoint === '/api/counter' || COUNTER_WRITE_PATHS.includes(endpoint);
  }
  return methodMatch && pathMatch;
}

/**
 * Checks whether any of the user's roles grant access to the given endpoint and method.
 * If no role in the system has a mapping for this path+method, allows any authenticated user (opt-in RBAC).
 * Otherwise allows only if the user has a role with a matching endpoint mapping.
 */
export async function hasRoleAccess(
  userId: string,
  requestMethod: string,
  requestPath: string
): Promise<boolean> {
  const covers = (endpoint: string, method: string) =>
    mappingCoversRequest(endpoint, method, requestMethod, requestPath);

  const systemWideMappings = await prisma.roleEndpointMapping.findMany({});
  const anyMappingExists = systemWideMappings.some((m) => covers(m.endpoint, m.method));

  if (!anyMappingExists) {
    return true;
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: { include: { endpointMappings: true } },
    },
  });

  for (const ur of userRoles) {
    for (const mapping of ur.role.endpointMappings) {
      if (covers(mapping.endpoint, mapping.method)) {
        return true;
      }
    }
  }

  return false;
}
