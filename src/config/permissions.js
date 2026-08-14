const ROLE_PERMISSIONS = {
  owner: ["users.read", "users.invite", "users.remove", "role.change", "org.delete"],
  admin: ["users.read", "users.invite", "users.remove", "role.change"],
  member: ["users.read"],
  viewer: ["users.read"]
};

module.exports = ROLE_PERMISSIONS;