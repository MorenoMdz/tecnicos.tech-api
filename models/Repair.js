const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const repairSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician',
  },
  hardware: {
    type: /* mongoose.Schema.ObjectId */ String,
    ref: 'Hardware',
  },
  problem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
    required: 'You must describe the repair!',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  photo: [String],
  video: [String],
});

// Define our indexes
/* repairSchema.index({
  name: 'text',
  description: 'text',
}); */

// slug 'middleware alike' setup
repairSchema.pre('save', async function(next) {
  if (!this.isModified('hardware')) {
    next(); // skip it
    return; // stop this function from running (leave this middleware)
  }
  this.slug = slug(this.hardware); // if name was modified then run this
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const repairsWithSlug = await this.constructor.find({ slug: slugRegex });
  if (repairsWithSlug.length) {
    this.slug = `${this.slug}-${repairsWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant slugs
});

// find reviews where the stores _id property === reviews store property
/* repairSchema.virtual(
  'reviews',
  {
    ref: 'Review', // what model to link?
    localField: '_id', // which field on the sotre?
    foreignField: 'store',
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
); */

/* function autopopulate(next) {
  this.populate('reviews');
  next();
}

repairSchema.pre('find', autopopulate);
repairSchema.pre('findOne', autopopulate); */

module.exports = mongoose.model('Repair', repairSchema);
