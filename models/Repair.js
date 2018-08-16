const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const repairSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'Technician',
    },
    hardware: {
      type: mongoose.Schema.ObjectId,
      ref: 'Hardware',
    },
    problem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Problem',
    },
    title: {
      type: String,
      trim: true,
      required: 'You must describe the repair title!',
    },
    description: {
      type: String,
      trim: true,
      required: 'You must describe the repair!',
    },
    created: {
      type: Date,
      default: Date.now,
    },
    stars: [
      {
        type: String,
      },
    ],
    photo: [String],
    video: [String],
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Define our indexes
repairSchema.index({
  title: 'text',
  description: 'text',
});

// slug 'middleware alike' setup
repairSchema.pre('save', async function(next) {
  if (!this.isModified('title')) {
    next(); // skip it
    return; // stop this function from running (leave this middleware)
  }
  this.slug = slug(this.title); // if name was modified then run this
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const repairsWithSlug = await this.constructor.find({ slug: slugRegex });
  if (repairsWithSlug.length) {
    this.slug = `${this.slug}-${repairsWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant slugs
});

repairSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'repair',
});

function autopopulate(next) {
  /* this.populate('author'); */
  this.populate('comments');
  next();
}

repairSchema.pre('find', autopopulate);
repairSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Repair', repairSchema);
