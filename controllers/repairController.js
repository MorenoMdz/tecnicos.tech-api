const mongoose = require('mongoose');
/* const Store = mongoose.model('Store'); // loads the exported store into the variable Store*/
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
  // res.send('add repair');
  res.render('addRepairForm');
};

exports.createRepair = async (req, res) => {
  // req.body.author = req.user._id;
  const repair = await new Repair(req.body).save(); // it wont move to the next line until the save returns something
  req.flash(
    'success',
    `Successfully Created ${repair.name}. Care to leave a review?`
  );
  // res.redirect(`/store/${store.slug}`);
  res.redirect('/');
};
