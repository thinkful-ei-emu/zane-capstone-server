require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const uuid = require('uuid/v4');
const UsersRouter=require('./users/users-router');

const app = express();

const morganOption = NODE_ENV === 'production';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/users',UsersRouter)

app.get('/', (req, res) => {
  console.log('Hello World');
  res.send('Hello World');
});


app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;