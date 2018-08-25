const mongoose = require('mongoose');
const Repair = mongoose.model('Repair');
const User = mongoose.model('Technician');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');

    if (isPhoto) {
      next(null, true); // null for error means it worked and it is fine to continue to next()
    } else {
      next({ message: "That filetype ins't allowed!" }, false); // with error
    }
  },
};

exports.upload = multer(multerOptions).array('photos', 5);

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize

  if (!req.files) {
    next(); // skip if no file is uploaded
    return;
  }

  const photos = req.files;
  req.body.photos = [];
  let photo;

  for (let i = 0; i < photos.length; i++) {
    const extension = req.files[i].mimetype.split('/')[1]; // gets the extension
    req.body.photos[i] = `${uuid.v4()}.${extension}`;
    // now resize
    photo = await jimp.read(req.files[i].buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photos[i]}`);
  }
  // once we have written the photo to the fs, keep going
  next();
};

exports.addRepairForm = async (req, res) => {
  res.render('addRepairForm');
};

exports.createRepair = async (req, res) => {
  req.body.author = req.user._id;
  const repair = await new Repair(req.body).save();

  req.flash(
    'success',
    `Reparo ao defeito ${req.body.title} adicionado com sucesso!`
  );

  res.redirect('back');
};

async function repairListPerProblem(problemId) {
  const repairs = await Repair.find({
    problem: problemId,
  });
  const totalRepairCount = await Repair.count();
  return repairs;
}

exports.repairsPerProblem = repairListPerProblem;

exports.getAllRepairs = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 9;
  const skip = page * limit - limit;
  // query db for a list of all repairs
  const repairPromise = Repair.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Repair.count();
  // will await until both promises return
  const [repairs, count] = await Promise.all([repairPromise, countPromise]);
  const pages = Math.ceil(count / limit); // rounded
  if (!repairs.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.render('repairs', {
    title: 'repairs',
    repairs: repairs,
    page,
    pages,
    count,
  });
};

exports.getRepairBySlug = async (req, res) => {
  const repair = await Repair.findOne({
    slug: req.params.slug,
  }).populate('author hardware problem');
  if (!repair) return next(); // 404 error handler
  res.render('repair', { repair, title: repair.hardware });
};

exports.starsRepair = async (req, res) => {
  const stars = req.user.stars.map(obj => obj.toString());
  const operator = stars.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { stars: req.params.id },
    },
    { new: true }
  );
  // check if the current repair has a heart if not add +1 to it
  const repair = Repair.findByIdAndUpdate(
    req.params.id,
    {
      [operator]: { stars: req.user._id },
    },
    { new: true }
  );
  const star = await Promise.all([user, repair]);

  res.redirect('back');
};

exports.searchRepairs = async (req, res) => {
  const repairs = await Repair.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: { $meta: 'textScore' },
    }
  )
    .sort({
      score: { $meta: 'textScore' },
    })
    .limit(5);
  res.json(repairs);
};
