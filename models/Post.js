const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const postSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician',
    required: 'You must supply an author!',
  },
  title: {
    type: String,
    required: 'Please add the post title',
  },
  text: {
    type: String,
    required: 'Please add the post text',
  },
  rating: {
    type: Number,
    min: 0,
    max: 1,
  },
  comments: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  },
});

postSchema.index({
  text: 'text',
});

function autopopulate(next) {
  this.populate('author');
  next();
}

postSchema.pre('find', autopopulate);
postSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Post', postSchema);
