const mongoose = require('mongoose');

// Check for node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log(
    "You're on an older version of node.Please go to nodejs.org and download version 7.6 or greater. \n "
  );
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => {
  console.error(`🚫🚫🚫 → ${err.message}\n`);
});

// Import all of our models
require('./models/Repair');
require('./models/Technician');
/*require('./models/Review'); */

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 777);
const server = app.listen(app.get('port'), () => {
  console.log(`Server Express running on PORT ${server.address().port}`);
});

// TEMP send email test
// require('./handlers/mail');
