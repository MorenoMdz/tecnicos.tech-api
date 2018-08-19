const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const hardwareSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter the hardware name',
    },
    model: {
      type: String,
      trim: true,
      required: 'Please enter the hardware model',
    },
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
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'Technician',
      required: 'You must supply an author!',
    },
    created: {
      type: Date,
      default: Date.now,
    },
    photo: {
      type: String,
      required: 'Please enter the hardware name',
    },
    slug: String, // access link
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Indexes */
hardwareSchema.index({
  name: 'text',
  model: 'text',
});

/* Auto set the slug */
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
});

hardwareSchema.virtual('problems', {
  ref: 'Problem',
  localField: '_id',
  foreignField: 'hardware',
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

hardwareSchema.pre('find', autopopulate);
hardwareSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Hardware', hardwareSchema);
