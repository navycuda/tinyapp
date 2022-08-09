/* Require */
const morgan = require('morgan');
const express = require('express');
const { response } = require('express');
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
/* Endpoints */
// GET - HomePage
app.get('/', (request, response) => {
  response.send('Hello!');
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
  const templateVars = { id: request.params.id, longURL: urlDataBase[this.id] };
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
// GET - set
app.get('/set', (request, response) => {
  const a = 1;
  response.send(`a = ${a}`);
});
// GET - fetch
app.get('/fetch', (request, response) => {
  response.send(`a = ${a}`);
});
app.get(`*`, (request, response) => {
  response.statusCode = 404;
  response.send('Not good bro, not good.');
});

/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
/* Exports */