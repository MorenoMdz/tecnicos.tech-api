const mongoose = require('mongoose');
const Repair = mongoose.model('Repair');
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

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip if no file is uploaded
    return;
  }
  const extension = req.file.mimetype.split('/')[1]; // gets the extension
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to the fs, keep going
  next();
};

exports.addRepairForm = async (req, res) => {
  res.render('addRepairForm');
};

exports.createRepair = async (req, res) => {
  req.body.author = req.user._id;
  const repair = await new Repair(req.body).save();
  console.log(req.body);
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
  }).populate('author hardware');
  if (!repair) return next(); // 404 error handler
  res.render('repair', { repair, title: repair.hardware });
};
