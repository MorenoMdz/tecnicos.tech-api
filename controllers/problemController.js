const mongoose = require('mongoose');
const Problem = mongoose.model('Problem');

/* const multerOptions = {
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
}; */

/* Problem Management Methods */
/* exports.addProblem = async (req, res) => {
  const hwController = require('./hwController');
  const hardwares = await hwController.hardwares;

  res.render('addProblem', {
    title: 'Adicionar Defeito',
    step: '',
    hardwares: hardwares,
  });
}; */

exports.addNewProblem = async (req, res) => {
  req.body.author = req.user.id;
  req.body.photos = req.files;
  const problem = await new Problem(req.body)
    .save()
    .catch(err => console.log(err)); // it wont move to the next line until the save returns something */

  req.flash('success', `Adicionado defeito ${problem.title} com sucesso.`);
  res.redirect('back');
};

exports.getProblemList = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 3;
  const skip = page * limit - limit;

  const problemPromise = Problem.find()
    .populate('author hardware repairs repairsV')
    .skip(skip)
    .limit(limit);
  const countPromise = Problem.count();

  const [problems, count] = await Promise.all([problemPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!problems.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }

  const hwController = require('./hwController');
  const hardwares = await hwController.hardwares;

  res.render('problems', {
    title: 'Defeitos',
    problems: problems,
    hardwares: hardwares,
    area: 'problems',
    page,
    pages,
    count,
  });
};

exports.getProblemBySlug = async (req, res) => {
  // finds related hardware
  const hwController = require('./hwController');
  const hardwares = await hwController.hardwares;

  // finds the Problem requested
  const problem = await Problem.findOne({
    slug: req.params.slug,
  }).populate('author hardware repairs repairsV');
  if (!problem) return next(); // it kicks in the 404 error handler

  // finds the related repairs
  const repairController = require('./repairController');
  const repairs = await repairController.repairsPerProblem(problem._id);

  res.render('problem', {
    problem: problem,
    hardwares: hardwares,
    repairs: repairs,
    title: problem.title,
  });
};

exports.searchProblem = async (req, res) => {
  const problems = await Problem.find(
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
  res.json(problems);
};
