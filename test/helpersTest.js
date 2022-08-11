const { assert } = require('chai');
const { getUidByEmail } = require('../helpers.js');
const User = require('../User');

const createUser = (id, username, email, password) => {
  const user = new User(userDatabase, username, email, password);
  user.uid = id;
  return user;
};

const uA = createUser('aaa', 'a', 'a@a.com', 'abc');
const uB = createUser('bbb', 'b', 'b@a.com', 'bcd');
const uC = createUser('ccc', 'c', 'c@a.com', 'cde');
const uD = createUser('ddd', 'd', 'd@a.com', 'def');

const userDatabase = { uA, uB, uC, uD };

describe('getUidByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUidByEmail('a@a.com', userDatabase);
    const expectedUserID = "aaa";
    assert.strictEqual(user === expectedUserID);
  });
});