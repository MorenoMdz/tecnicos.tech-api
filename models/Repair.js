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
    diagnostic_flow: {
      type: String,
      trim: true,
    },
    repair_flow: {
      type: String,
      trim: true,
    },
    parts: {
      type: String,
      trim: true,
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

repairSchema.index({
  title: 'text',
  description: 'text',
});

repairSchema.pre('save', async function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  this.slug = slug(this.title);
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const repairsWithSlug = await this.constructor.find({ slug: slugRegex });
  if (repairsWithSlug.length) {
    this.slug = `${this.slug}-${repairsWithSlug.length + 1}`;
  }
  next();
});

repairSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'repair',
});

function autopopulate(next) {
  this.populate('comments');
  next();
}

repairSchema.pre('find', autopopulate);
repairSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Repair', repairSchema);
