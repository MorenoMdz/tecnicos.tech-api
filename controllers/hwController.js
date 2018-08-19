const mongoose = require('mongoose');
const Hardware = mongoose.model('Hardware');
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

/* Hardware Management Methods */
exports.addNewHw = async (req, res) => {
  req.body.author = req.user._id;
  const hardware = await new Hardware(req.body).save();

  req.flash('success', `Adicionado ${hardware.name} com sucesso.`);
  res.redirect('/config');
};

async function hwList(req, res, next) {
  const hardwares = await Hardware.find();
  // const totalHwCount = await Hardware.count();

  return hardwares;
}

exports.hardwares = hwList();

exports.getAllHw = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 9;
  const skip = page * limit - limit;

  const hwPromise = Hardware.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Hardware.count();

  const [hardwares, count] = await Promise.all([hwPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!hardwares.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.render('config', {
    title: 'Hardware Config',
    hardwares: hardwares,
    page,
    pages,
    count,
  });
};

/* Method for the lower rank user */
exports.getHwList = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 9;
  const skip = page * limit - limit;
  // query db for a list of all repairs
  const hwPromise = Hardware.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Hardware.count();
  // will await until both promises return
  const [hardwares, count] = await Promise.all([hwPromise, countPromise]);
  const pages = Math.ceil(count / limit); // rounded
  if (!hardwares.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.render('hardwareList', {
    title: 'Hardware Config',
    hardwares: hardwares,
    page,
    pages,
    count,
  });
};

exports.getHwBySlug = async (req, res) => {
  const hardwares = await hwList();
  const hardware = await Hardware.findOne({
    slug: req.params.slug,
  }).populate('author problems');
  if (!hardware) return next(); // it kicks in the 404 error handler
  res.render('hardware', {
    hardware: hardware,
    hardwares: hardwares,
    title: hardware.name,
  });
};

exports.getHwById = async id => {
  const hardware = await Hardware.findOne({
    _id: id,
  });

  return hardware;
};
