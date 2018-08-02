const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const hardwareSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter the hardware name',
  },
  model: [
    {
      type: String,
      trim: true,
    },
  ],
  brand: {
    type: String,
    trim: true,
    required: 'Please enter the hardware brand',
  },
  mfr_date: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  board_model: {
    type: String,
    trim: true,
  },
  slug: String, // access link
  description: {
    type: String,
    trim: true,
  },
  problem: [String],
  repair: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  photo: String,

  // ToDo Extra Fields
});

// Define our indexes
hardwareSchema.index({
  name: 'text',
  model: 'text',
});

// slug 'middleware alike' setup
hardwareSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running (leave this middleware)
  }
  this.slug = slug(this.name); // if name was modified then run this
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const hardwaresWithSlug = await this.constructor.find({ slug: slugRegex });
  if (hardwaresWithSlug.length) {
    this.slug = `${this.slug}-${hardwaresWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant slugs
});

/* hardwareSchema.statics.getProblemsList = function() {
  return this.aggregate([
    // the '$' means it is a filed inside the document like in '$tags"
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};
 */
// find reviews where the stores _id property === reviews store property
/* hardwareSchema.virtual(
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

// ToDo pre load Problems
/* function autopopulate(next) {
  this.populate('reviews');
  next();
}

hardwareSchema.pre('find', autopopulate);
hardwareSchema.pre('findOne', autopopulate); */

module.exports = mongoose.model('Hardware', hardwareSchema);
