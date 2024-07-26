// connect to local sql db

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'timerextensiondb_dev',
  password: 'password',
  port: '5432'
});

const connectLocalDB = () => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to the database');
    release();
  });
};

module.exports = { pool, connectLocalDB };
