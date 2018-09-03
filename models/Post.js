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
});

postSchema.index({
  text: 'text',
});

postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

function autopopulate(next) {
  this.populate('author comments');
  next();
}

postSchema.pre('find', autopopulate);
postSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Post', postSchema);
