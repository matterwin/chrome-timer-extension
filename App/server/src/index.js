const express = require('express');
const indexRouter = require('./routes/index.js');
const { connectLocalDB } = require('./config/db/localDB.js');

const app = express();

connectLocalDB();

app.use(express.json());

app.use('/', indexRouter);

module.exports = app;

