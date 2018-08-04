const mongoose = require('mongoose');
const Problem = mongoose.model('Problem');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

/* Image handler */
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

/* Problem Management Methods */
exports.addNewProblem = async (req, res) => {
  req.body.author = req.user.id;
  // req.body.hardware = choose from dropdown list with hw ID
  const problem = await new Problem(req.body).save(); // it wont move to the next line until the save returns something

  req.flash(
    'success',
    `Adicionado defeito ${problem.title} do aparelho {
      problem.hardware
    } com sucesso.`
  );
  res.redirect('/problems');
};

exports.getProblemList = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 9;
  const skip = page * limit - limit;
  // query db for a list of all repairs
  const problemPromise = Problem.find()
    .populate('author hardware repairs repairsV')
    .skip(skip)
    .limit(limit);
  const countPromise = Problem.count();
  // will await until both promises return
  const [problems, count] = await Promise.all([problemPromise, countPromise]);
  const pages = Math.ceil(count / limit); // rounded
  if (!problems.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    /* res.redirect(`/stores/page/${pages}`); */
    return;
  }

  const hwController = require('./hwController');
  const hardwares = await hwController.hardwaresList();

  res.render('problems', {
    title: 'Defeitos',
    problems: problems,
    hardwares: hardwares,
    page,
    pages,
    count,
  });
};

/* Method for the lower rank user */
exports.getproblemList = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 9;
  const skip = page * limit - limit;
  // query db for a list of all repairs
  const problemPromise = Problem.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Problem.count();
  // will await until both promises return
  const [problems, count] = await Promise.all([problemPromise, countPromise]);
  const pages = Math.ceil(count / limit); // rounded
  if (!problems.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.render('problemsList', {
    title: 'Problems List',
    problems: problems,
    page,
    pages,
    count,
  });
};

exports.getHwBySlug = async (req, res) => {
  const hardware = await Hardware.findOne({
    slug: req.params.slug,
  }).populate('author hardware repairs repairsV');
  if (!hardware) return next(); // it kicks in the 404 error handler
  res.render('hardware', { hardware: hardware, title: hardware.name });
};
