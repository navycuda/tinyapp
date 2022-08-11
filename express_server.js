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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};
const userDataBase = {};

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

/* Classes */
class User {
  constructor(username, email, password) {
    this.uid = generateNewKey(6, userDataBase);
    this.username = username;
    this.email = email;
    this.password = password;
    this.tinyIds = [];
  }
  passwordIsValid(password) {
    return this.password === password;
  }
}



/* Endpoints */
// GET - HomePage
app.get('/', (request, response) => {
  response.redirect('/urls');
});
// GET - /u/:id
app.get('/u/:id', (request, response) => {
  const longURL = (urlDataBase[request.params.id]) ? urlDataBase[request.params.id] : 'notFound';
  response.redirect(longURL);
});
// GET - urls
app.get('/urls', (request, response) => {
  const user = getUserByRequest(request);
  const templateVars = { user, urls: urlDataBase };
  response.render('urls_index', templateVars);
});
// Get - new url
app.get('/urls/new', (request, response) => {
  const user = getUserByRequest(request);
  const templateVars = { user };
  response.render('urls_new', templateVars);
});
// GET - url by ID
app.get('/urls/:id', (request, response) => {
  const urlId = request.params.id;
  const user = getUserByRequest(request);
  const templateVars = { user, id: urlId, longURL: urlDataBase[urlId] };
  response.render('urls_show', templateVars);
});
// GET - login
app.get('/login', (request, response) => {
  const templateVars = { user: null };
  response.render('user_login', templateVars);
});
// GET - register
app.get('/register', (request, response) => {
  const user = null;
  const templateVars = { user };
  response.render('user_registration', templateVars);
});
app.get(`/error400`, (request, response) => {
  response.statusCode = 400;
  response.redirect('400: Not good bro, not good.');
});
app.get(`*`, (request, response) => {
  response.statusCode = 404;
  response.send('404: Not good bro, not good.');
});

// POST - user login
app.post('/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  const uid = getUidByUsername(username, userDataBase);
  if (uid) {
    const user = userDataBase[uid];
    if (user.passwordIsValid(password)) {
      response.cookie('uid', uid);
      response.redirect('/urls');
      return;
    }
  }
  response.redirect('/login');
});
// POST - user logout
app.post('/logout', (request, response) => {
  response.clearCookie('uid');
  response.redirect('/urls');
});
// POST - new url
app.post('/urls', (request, response) => {
  const randomUrl = generateNewKey(6, urlDataBase);
  urlDataBase[randomUrl] = request.body.longURL;
  //response.send(`${randomUrl} and the long url is??? ${request.body.longURL}`);
  response.redirect(`/urls/${randomUrl}`);
});
// POST - Delete Url
app.post('/urls/:id/delete', (request, response) => {
  delete urlDataBase[request.params.id];
  response.redirect('/urls');
});
// POST - Edit the long URL
app.post('/urls/:id', (request, response) => {
  const id = request.params.id;
  urlDataBase[id] = request.body.longURL;
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
const topsecret = new User('topSecret', 't@n.com', 'password');
userDataBase[navycuda.uid] = navycuda;
userDataBase[topsecret.uid] = topsecret;

console.log(userDataBase);
/* Exports */