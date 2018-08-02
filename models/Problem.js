const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: 'Precisa adicionar um título ao defeito!',
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Technician',
    required: 'You must supply an author!',
  },
  hardware: {
    type: /* mongoose.Schema.ObjectId */ String,
    ref: 'Hardware',
  },
  repairs: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Repair',
    },
  ],
  slug: String,
  description: {
    type: String,
    trim: true,
    required: 'Precisa descrever o defeito!',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  photo: [String],
  video: [String],
});

// Define our indexes
/* problemSchema.index({
  name: 'text',
  description: 'text',
}); */

// slug 'middleware alike' setup
problemSchema.pre('save', async function(next) {
  if (!this.isModified('title')) {
    next(); // skip it
    return; // stop this function from running (leave this middleware)
  }
  this.slug = slug(this.title); // if name was modified then run this
  // find stores that have the same store name via regex
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const problemsWithSlugWithSlug = await this.constructor.find({
    slug: slugRegex,
  });
  if (problemsWithSlugWithSlug.length) {
    this.slug = `${this.slug}-${problemsWithSlugWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant slugs
});

// find reviews where the stores _id property === reviews store property
problemSchema.virtual(
  'repairsVirtual',
  {
    ref: 'Repair', // what model to link?
    localField: '_id', // which field on the store?
    foreignField: 'problem',
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* function autopopulate(next) {
  this.populate('reviews');
  next();
}

problemSchema.pre('find', autopopulate);
problemSchema.pre('findOne', autopopulate); */

module.exports = mongoose.model('Problem', problemSchema);
