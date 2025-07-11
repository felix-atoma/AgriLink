export const ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  [ROLES.FARMER]: [
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'order:read'
  ],
  [ROLES.BUYER]: [
    'product:read',
    'order:create',
    'order:read'
  ],
  [ROLES.ADMIN]: [
    'user:manage',
    'product:manage',
    'order:manage'
  ]
};