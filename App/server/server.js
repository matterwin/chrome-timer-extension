const app = require('./src');
const port = '3000';

app.listen(port, () => {
  console.log(`Port: ${port}`);
});
