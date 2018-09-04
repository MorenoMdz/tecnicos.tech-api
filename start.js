const mongoose = require('mongoose');

// Check for node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log(
    "You're on an older version of node.Please go to nodejs.org and download version 7.6 or greater. \n "
  );
  process.exit();
}

/* enviroment variables */
require('dotenv').config({ path: 'variables.env' });

/* DB connect and error handling */
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => {
  console.error(` DB Error: ${err.message}\n`);
});

/* DB Models */
require('./models/Technician');
require('./models/Repair');
require('./models/Hardware.js');
require('./models/Problem.js');
require('./models/Comment.js');
require('./models/Post.js');
require('./models/Feedback.js');

/* App start */
const app = require('./app');
app.set('port', process.env.PORT || 777);
const server = app.listen(app.get('port'), () => {
  console.log(
    `Server Express running on PORT ${server.address().port}, Have fun!`
  );
});
