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

/* Arguments & Properties */
const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

/* Classes */
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

/* Endpoints */
// GET - HomePage
app.get('/', (request, response) => {
  response.send('Hello!');
});
// GET - /u/:id
app.get('/u/:id', (request, response) => {
  const longURL = (urlDataBase[request.params.id]) ? urlDataBase[request.params.id] : 'notFound';
  response.redirect(longURL);
});
// GET - urls
app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDataBase };
  response.render('urls_index', templateVars);
});
// Get - new url
app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});
// GET - url by ID
app.get('/urls/:id', (request, response) => {
  const urlId = request.params.id;
  const templateVars = { id: urlId, longURL: urlDataBase[urlId] };
  response.render('urls_show', templateVars);
});
// GET - urls.json
app.get('/urls.json', (request, response) => {
  response.json(urlDataBase);
});
// GET - hello in html
app.get('/hello', (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get(`*`, (request, response) => {
  response.statusCode = 404;
  response.send('Not good bro, not good.');
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



/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
/* Exports */