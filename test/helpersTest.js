const { assert } = require('chai');
const { getUidByEmail } = require('../helpers.js');
const User = require('../User');

const userDatabase = {};

const createUser = (id, username, email, password) => {
  const user = new User(userDatabase, username, email, password);
  user.uid = id;
  return user;
};

const uA = createUser('aaa', 'a', 'a@a.com', 'abc');
userDatabase[uA.uid] = uA;
const uB = createUser('bbb', 'b', 'b@a.com', 'bcd');
userDatabase[uB.uid] = uB;
const uC = createUser('ccc', 'c', 'c@a.com', 'cde');
userDatabase[uC.uid] = uC;
const uD = createUser('ddd', 'd', 'd@a.com', 'def');
userDatabase[uD.uid] = uD;

// console.log(`userDatabase after initialization\n`, userDatabase);

describe('getUidByEmail', function() {
  it('should return a uid with valid email', () => {
    const uid = getUidByEmail('a@a.com', userDatabase);
    const correctUid = "aaa";
    assert.strictEqual(uid, correctUid);
  });
  it('should return null with invalid email', () => {
    const uid = getUidByEmail('a@n.com', userDatabase);
    const correctUid = null;
    assert.strictEqual(uid, correctUid);
  });
});