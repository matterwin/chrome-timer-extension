const express = require('express');
const indexRouter = require('./routes/index.js');
const { connectLocalDB } = require('./config/db/localDB.js');

const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'chrome-extension://nenhlcpcdcbhblpkfgiggnchpppodcmh',
  methods: ['GET', 'POST'],
  credentials: true
}));

connectLocalDB();

app.use(express.json());

app.use('/', indexRouter);

module.exports = app;

