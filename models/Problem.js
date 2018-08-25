const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const problemSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.ObjectId,
      ref: 'Hardware',
    },
    board_model: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: 'Precisa descrever o defeito!',
    },
    created: {
      type: Date,
      default: Date.now,
    },
    photos: [],
    video: [String],
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

problemSchema.index({
  title: 'text',
  description: 'text',
});

problemSchema.pre('save', async function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  this.slug = slug(this.title);
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const problemsWithSlugWithSlug = await this.constructor.find({
    slug: slugRegex,
  });
  if (problemsWithSlugWithSlug.length) {
    this.slug = `${this.slug}-${problemsWithSlugWithSlug.length + 1}`;
  }
  next();
});

problemSchema.virtual('repairsV', {
  ref: 'Repair',
  localField: '_id',
  foreignField: 'problem',
});

function autopopulate(next) {
  this.populate('repairsV');
  next();
}

problemSchema.pre('find', autopopulate);
problemSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Problem', problemSchema);
