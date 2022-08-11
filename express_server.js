/* Require */
const morgan = require('morgan');
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const app = express();
const {
  generateNewKey,
  getUidByUsername,
  getUserByRequest,
  getUidByEmail
} = require(`./helpers`);
const User = require('./User');

/* Tcp:Http */
const PORT = 8080;

/* Middleware */
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieSession({
  name: "enigmaSecure",
  keys: [ 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'BDFHJLCPRTXVZNYEIWGAKMUSQO' ]
}));

/* Arguments & Properties */
const errorMsg = "Not good bro, not good.";
const urlDataBase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: '1a3f2t'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: '1a2f2r'
  }
};
const userDataBase = {};

/* Classes */

/* Local Functions */


/* Endpoints */
/**
 * GET
 */
app.get('/', (request, response) => {
  response.redirect('/urls');
});
app.get('/u/:id', (request, response) => {
  const id = request.params.id;
  const url = urlDataBase[id];
  if (url) {
    const longURL = url.longURL;
    response.redirect(longURL);
    return;
  }
  response.statusCode(400).send('shortened url not found');
});
app.get('/urls', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (!user) {
    response.redirect('/login');
    return;
  }
  const urls = user.getUrls(urlDataBase);
  const templateVars = { user, urls };
  response.render('urls_index', templateVars);
});
app.get('/urls/new', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (!user) {
    response.redirect('/login');
    return;
  }
  const templateVars = { user };
  response.render('urls_new', templateVars);
});
app.get('/urls/:id', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (!user) {
    response.statusCode(400).send('not logged in');
    return;
  }
  const urlId = request.params.id;
  const url = urlDataBase[urlId];
  if (url.userID !== user.uid) {
    response.statusCode(400).send('you do not own this url');
    return;
  }
  const templateVars = { user, id: urlId, longURL: urlDataBase[urlId].longURL };
  response.render('urls_show', templateVars);
});
app.get('/login', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (user) {
    response.redirect('/urls');
    return;
  }
  const templateVars = { user };
  response.render('user_login', templateVars);
});
app.get('/register', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (user) {
    response.redirect('/urls');
    return;
  }
  const templateVars = { user };
  response.render('user_registration', templateVars);
});
app.get(`*`, (request, response) => {
  response.statusCode(404).send('404: Not good bro, not good.');
});

/**
 * POST
 */
app.post('/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  let uid = getUidByUsername(username, userDataBase);
  if (!uid) {
    uid = getUidByEmail(username, userDataBase);
  }
  if (uid) {
    const user = userDataBase[uid];
    bcrypt.compare(password, user.password)
      .then((result) => {
        if (result) {
          request.session.uid = uid;
          response.redirect('/urls');
        } else {
          return response.status(401).send('Access Denied : Incorrect Password');
        }
      });
  } else {
    response.status(401).send('Username or email not found');
  }
});
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/urls');
});
app.post('/urls', (request, response) => {
  const user = getUserByRequest(request, userDataBase);
  if (!user) {
    response.send('must be logged in to add to url list');
    return;
  }
  const randomUrl = generateNewKey(6, urlDataBase);
  urlDataBase[randomUrl] = {
    longURL: request.body.longURL,
    userID: user.uid,
    redirects: 0
  };
  urlDataBase[randomUrl].userID = user.uid;
  response.redirect(`/urls/${randomUrl}`);
});
app.post('/urls/:id/delete', (request, response) => {
  const id = request.params.id;
  const url = urlDataBase[id];
  if (!url) {
    response.statusCode(400).send('id does not exist');
    return;
  }
  const user = getUserByRequest(request, userDataBase);
  if (!user) {
    response.statusCode(400).send('not logged in');
    return;
  }
  if (user.uid !== url.userID) {
    response.statusCode(400).send('do not own this resource');
    return;
  }
  delete urlDataBase[request.params.id];
  response.redirect('/urls');
});
app.post('/urls/:id', (request, response) => {
  const id = request.params.id;
  urlDataBase[id].longURL = request.body.longURL;
  response.redirect('/urls');
});
app.post('/register', (request, response) => {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  const uidUsed = getUidByEmail(email, userDataBase);
  const usernameUsed = getUidByUsername(username, userDataBase);
  if (username && email && password && !uidUsed && !usernameUsed) {
    const user = new User(userDataBase, username, email);
    bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        user.password = hash;
        userDataBase[user.uid] = user;
        request.session.uid = user.uid;
        response.redirect('/urls');
      });
    console.log(`/register\n\tuserDatabase\n***\n`, userDataBase);
    return;
  }

  response.statusCode(400).send(`${errorMsg} Username or Email already exists.`);
});

/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

console.log(`userDatabase\n***\n`, userDataBase);