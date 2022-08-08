/* Require */
const morgan = require('morgan');
const express = require('express');
const app = express();

/* Tcp:Http */
const PORT = 8080;

/* Middleware */
app.use(morgan('dev'));

/* Arguments & Properties */
const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

/* Classes */
/* Export Functions */
/* Local Functions */
/* Endpoints */
app.get('/', (request, response) => {
  response.send('Hello!');
});

/* Execution & Test Data */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
/* Exports */