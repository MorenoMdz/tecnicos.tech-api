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
  contacts_public: {
    type: Boolean,
    default: true,
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
    complemento: String,
    bairro: String,
    city: String,
    state: String,
    zipCode: String,
    store_name: String,
    site_name: String,
    public: {
      type: Boolean,
      default: true,
    },
  },
  siteRank: [0, 1, 2, 3, 4, 5],
  techStars: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Repairs',
    },
  ],
  stars: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Repairs',
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  warning: {
    type: String,
    default: 'You are not suposed to be here, and the cake is a lie!',
  },
});

technicianSchema.index({
  name: 'text',
});

// gets the user's gravatar based in his email address
technicianSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

technicianSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
technicianSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Technician', technicianSchema);
