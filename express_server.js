/* Require */
const morgan = require('morgan');
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { getRandomAlphanumericString } = require('@navycuda/lotide');
const app = express();

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
class User {
  constructor(username, email, password) {
    this.uid = generateNewKey(6, userDataBase);
    this.username = username;
    this.email = email;
    this.password = password;
  }
  getUrls(database) {
    const urls = {};
    for (let key in database) {
      if (database[key].userID === this.uid) {
        urls[key] = database[key];
      }
    }
    return urls;
  }
}
/* Local Functions */
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
const getUserByRequest = (request) => {
  const uid = request.session.uid;
  const user = uid ? userDataBase[uid] : null;
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

/* Endpoints */
/**
 * GET
 */
app.get('/', (request, response) => {
  response.redirect('/urls');
});
app.get('/u/:id', (request, response) => {
  const longURL = (urlDataBase[request.params.id]) ? urlDataBase[request.params.id].longURL : 'short url not Found';
  response.redirect(longURL);
});
app.get('/urls', (request, response) => {
  const user = getUserByRequest(request);
  if (!user) {
    response.redirect('/login');
    return;
  }
  const urls = user.getUrls(urlDataBase);
  const templateVars = { user, urls };
  response.render('urls_index', templateVars);
});
app.get('/urls/new', (request, response) => {
  const user = getUserByRequest(request);
  if (!user) {
    response.redirect('/login');
    return;
  }
  const templateVars = { user };
  response.render('urls_new', templateVars);
});
app.get('/urls/:id', (request, response) => {
  const user = getUserByRequest(request);
  if (!user) {
    response.send('not logged in');
    return;
  }
  const urlId = request.params.id;
  const url = urlDataBase[urlId];
  if (url.userID !== user.uid) {
    response.send('you do not own this url');
    return;
  }
  const templateVars = { user, id: urlId, longURL: urlDataBase[urlId].longURL };
  response.render('urls_show', templateVars);
});
app.get('/login', (request, response) => {
  const user = getUserByRequest(request);
  if (user) {
    response.redirect('/urls');
    return;
  }
  const templateVars = { user };
  response.render('user_login', templateVars);
});
app.get('/register', (request, response) => {
  const user = getUserByRequest(request);
  if (user) {
    response.redirect('/urls');
    return;
  }
  const templateVars = { user };
  response.render('user_registration', templateVars);
});
app.get(`/error400`, (request, response) => {
  response.statusCode = 400;
  response.send('400: Not good bro, not good.');
});
app.get(`/error403`, (request, response) => {
  response.statusCode = 403;
  response.send('403: Not good bro, not good.');
});
app.get(`*`, (request, response) => {
  response.statusCode = 404;
  response.send('404: Not good bro, not good.');
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
  const user = getUserByRequest(request);
  if (!user) {
    response.send('must be logged in to add to url list');
    return;
  }
  const randomUrl = generateNewKey(6, urlDataBase);
  urlDataBase[randomUrl] = {
    longURL: request.body.longURL,
    userID: user.uid
  };
  urlDataBase[randomUrl].userID = user.uid;
  response.redirect(`/urls/${randomUrl}`);
});
app.post('/urls/:id/delete', (request, response) => {
  const id = request.params.id;
  const url = urlDataBase[id];
  if (!url) {
    response.send('id does not exist');
    return;
  }
  const user = getUserByRequest(request);
  if (!user) {
    response.send('not logged in');
    return;
  }
  if (user.uid !== url.userID) {
    response.send('do not own this resource');
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
    const user = new User(username, email);

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