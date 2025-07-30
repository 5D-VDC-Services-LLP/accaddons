// utils/sanitizeUsers.js
function sanitizeProjectUsers(users) {
  return users
    .filter((user) => user.autodeskId)
    .map(({ autodeskId, name, email }) => ({
      id: autodeskId,
      name,
      email,
    }));
}

module.exports = { sanitizeProjectUsers };
