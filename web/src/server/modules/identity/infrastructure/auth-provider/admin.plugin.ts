import type { AdminOptions } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,

  donation: ["create", "read", "update", "delete", "soft-delete"],
  inventory: ["create", "read", "update", "delete"],

  medicationRequest: ["create", "read", "update", "cancel"],

  delivery: ["coordinate", "finalize", "dispute"],
} as const;

const acAdmin = createAccessControl(statement);

const adminPermissions = acAdmin.newRole({
  donation: ["create", "read", "update", "delete", "soft-delete"],
  inventory: ["create", "read", "update", "delete"],
  medicationRequest: ["create", "read", "update", "cancel"],
  delivery: ["coordinate", "finalize", "dispute"],

  ...adminAc.statements,
});

const userPermissions = acAdmin.newRole({
  donation: ["create", "read", "update", "soft-delete"],
  inventory: ["create", "read", "update", "delete"],

  medicationRequest: ["create", "read", "update", "cancel"],

  delivery: ["coordinate", "finalize"],
});

export const adminOptions = {
  ac: acAdmin,
  roles: {
    admin: adminPermissions,
    user: userPermissions,
  },
  defaultRole: "user",
} satisfies AdminOptions;

export { acAdmin, adminPermissions, userPermissions };
