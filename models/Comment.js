const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const commentSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician',
    required: 'You must supply an author!',
  },
  repair: {
    type: mongoose.Schema.ObjectId,
    ref: 'Repair',
    required: 'You must supply an author!',
  },
  text: {
    type: String,
    required: 'Please add your comment text',
  },
  rating: {
    type: Number,
    min: 0,
    max: 1,
  },
  replies: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  },
});

function autopopulate(next) {
  this.populate('author');
  next();
}

commentSchema.pre('find', autopopulate); // hooks
commentSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Comment', commentSchema);
