/* Require */
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

/* Tcp:Http */
const PORT = 8080;

/* Middleware */
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

/* Arguments & Properties */
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
  passwordIsValid(password) {
    return this.password === password;
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
/* Export Functions */
/* Local Functions */
const getRandomNumber = (num) => {
  return (Math.floor(Math.random() * num));
};
const generateRandomString = (length) => {
  const chars = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789";
  let result = '';
  for (let l = 0; l < length; l++) {
    result += chars[getRandomNumber(chars.length)];
  }
  return result;
};
const generateNewKey = (length, comparisonData) => {
  let isDefined = true;
  let result;
  while (isDefined) {
    result = generateRandomString(length);
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
  const uid = request.cookies.uid;
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
// GET - HomePage
app.get('/', (request, response) => {
  response.redirect('/urls');
});
// GET - /u/:id
app.get('/u/:id', (request, response) => {
  const longURL = (urlDataBase[request.params.id]) ? urlDataBase[request.params.id].longURL : 'short url not Found';
  response.redirect(longURL);
});
// GET - urls
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
// Get - new url
app.get('/urls/new', (request, response) => {
  const user = getUserByRequest(request);
  if (!user) {
    response.redirect('/login');
    return;
  }
  const templateVars = { user };
  response.render('urls_new', templateVars);
});
// GET - url by ID
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
// GET - login
app.get('/login', (request, response) => {
  const user = getUserByRequest(request);
  if (user) {
    response.redirect('/urls');
    return;
  }
  const templateVars = { user };
  response.render('user_login', templateVars);
});
// GET - register
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

// POST - user login
app.post('/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  let uid = getUidByUsername(username, userDataBase);
  if (!uid) {
    uid = getUidByEmail(username, userDataBase);
  }
  if (uid) {
    const user = userDataBase[uid];
    if (user.passwordIsValid(password)) {
      response.cookie('uid', uid);
      response.redirect('/urls');
      return;
    }
  }
  response.redirect('/error403');
});
// POST - user logout
app.post('/logout', (request, response) => {
  response.clearCookie('uid');
  response.redirect('/urls');
});
// POST - new url
app.post('/urls', (request, response) => {
  const user = getUserByRequest(request);
  if (!user) {
    response.send('must be logged in to add to url list');
    return;
  }
  console.log(`request.body`, request.body);
  const randomUrl = generateNewKey(6, urlDataBase);
  console.log(`randomUrl`, randomUrl);
  urlDataBase[randomUrl] = {
    longURL: request.body.longURL,
    userID: user.uid
  };
  urlDataBase[randomUrl].userID = user.uid;
  //response.send(`${randomUrl} and the long url is??? ${request.body.longURL}`);
  response.redirect(`/urls/${randomUrl}`);
});
// POST - Delete Url
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
// POST - Edit the long URL
app.post('/urls/:id', (request, response) => {
  const id = request.params.id;
  urlDataBase[id].longURL = request.body.longURL;
  response.redirect('/urls');
});
app.post('/register', (request, response) => {
  console.log("app.post('/register')",request.body);
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  const uidUsed = getUidByEmail(email, userDataBase);
  const usernameUsed = getUidByUsername(username, userDataBase);
  if (username && email && password && !uidUsed && !usernameUsed) {
    const user = new User(username, email, password);
    userDataBase[user.uid] = user;
    response.cookie('uid', user.uid);
    console.log("app.post('/register') : userDataBase: ", userDataBase);
    response.redirect('/urls');
  }
  
  response.redirect('/error400');
});

/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const navycuda = new User('navycuda', 'n@n.com', 'noPassword');
navycuda.uid = '1a2f2r';
const topsecret = new User('topSecret', 't@n.com', 'password');
topsecret.uid = '1a3f2t';
userDataBase[navycuda.uid] = navycuda;
userDataBase[topsecret.uid] = topsecret;

console.log(userDataBase);
/* Exports */