/* Require */
const { getRandomAlphanumericString } = require('@navycuda/lotide');

/* Tcp:Http */
/* Middleware */
/* Arguments & Properties */
/* Local Functions */
/* Export Functions */
const generateNewKey = (length, comparisonData) => {
  let isDefined = true;
  let result;
  while (isDefined) {
    result = getRandomAlphanumericString(length);
    if (!comparisonData[result]) {
      isDefined = false;
    }
  }
  return result;
};
const getUidByUsername = (username, database) => {
  for (let key in database) {
    if (database[key].username === username) {
      return database[key].uid;
    }
  }
  return null;
};
const getUserByRequest = (request, database) => {
  const uid = request.session.uid;
  const user = uid ? database[uid] : null;
  if (!uid) {
    request.session = null;
  }
  return user;
};
const getUidByEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key].uid;
    }
  }
  return null;
};

/* Exports */
module.exports = {
  generateNewKey,
  getUidByUsername,
  getUserByRequest,
  getUidByEmail
};