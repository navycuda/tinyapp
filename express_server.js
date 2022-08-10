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

/* Classes */
class User {
  constructor(username, password) {
    this.uid = generateNewKey(8, userDataBase);
    this.username = username;
    this.password = password;
    this.tinyIds = [];
  }
}



/* Endpoints */
/**
 * GET ***********************************************
 */
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
  console.log('cookies:', request.cookies);
  const templateVars = { username: request.cookies.username, urls: urlDataBase };
  response.render('urls_index', templateVars);
});
// Get - new url
app.get('/urls/new', (request, response) => {
  const templateVars = { username: request.cookies.username };
  response.render('urls_new', templateVars);
});
// GET - url by ID
app.get('/urls/:id', (request, response) => {
  const urlId = request.params.id;
  const templateVars = { username: request.cookies.username, id: urlId, longURL: urlDataBase[urlId] };
  response.render('urls_show', templateVars);
});
// Get - register
app.get('/register', (request, response) => {
  const templateVars = { username: request.cookies.username };
  response.render('user_registration', templateVars);
});
app.get(`*`, (request, response) => {
  response.statusCode = 404;
  response.send('404: Not good bro, not good.');
});
/**
 * POST ***********************************************
 */
// POST - user login
app.post('/login', (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});
// POST - user logout
app.post('/logout', (request, response) => {
  response.clearCookie('username');
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
  console.log(request.body);

  // Look into express.static (for getting our css)



  response.redirect('/urls');
});



/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const navycuda = new User('navycuda', 'noPassword');
const topsecret = new User('topSecret', 'password');
userDataBase[navycuda.uid] = navycuda;
userDataBase[topsecret.uid] = topsecret;

console.log(userDataBase);
/* Exports */