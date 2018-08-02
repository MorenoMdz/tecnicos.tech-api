const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const technicianSchema = new Schema({
  name: {
    type: String,
    required: 'Please supply the technicians name',
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please insert a valid email address'],
    required: 'Email cannot be empty',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    number: String,
    complement: String,
    bairro: String,
    city: String,
    state: String,
    zipCode: String,
  },
  siteRank: [0, 1, 2, 3, 4, 5],
  repairsCreated: [],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  reputationScore: [{ type: mongoose.Schema.ObjectId, ref: 'Store' }],
  /*   problemsAdded: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
    required: 'You must supply the problem ID!',
  }, */
});

// gets the user's gravatar based in his email address
technicianSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

technicianSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
technicianSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Technician', technicianSchema);
