const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleID: {
    type: String,
  },
  firstName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  image: {
    type: String,
  },
  email: {
    type: String,
  },
});

mongoose.model('users', UserSchema);
