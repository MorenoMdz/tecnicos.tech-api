const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const feedbackSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician',
    required: 'You must supply an author!',
  },
  area: {
    type: String,
    required: 'Please add the feedback title',
  },
  text: {
    type: String,
    required: 'Please add the post text',
  },
  status: {
    type: String,
    default: 'New',
  },
  comments: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  },
});

feedbackSchema.index({
  text: 'text',
});

function autopopulate(next) {
  this.populate('author');
  next();
}

feedbackSchema.pre('find', autopopulate);
feedbackSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Feedback', feedbackSchema);
