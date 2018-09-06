const mongoose = require('mongoose');
const Problem = mongoose.model('Problem');

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
    count
  });
};

exports.getProblemBySlug = async (req, res) => {
  // finds related hardware
  const hwController = require('./hwController');
  const hardwares = await hwController.hardwares;

  // finds the Problem requested
  const problem = await Problem.findOne({
    slug: req.params.slug
  }).populate('author hardware repairs repairsV');
  if (!problem) return next(); // it kicks in the 404 error handler

  // finds the related repairs
  const repairController = require('./repairController');
  const repairs = await repairController.repairsPerProblem(problem._id);

  res.render('problem', {
    problem: problem,
    hardwares: hardwares,
    repairs: repairs,
    title: problem.title
  });
};

exports.searchProblem = async (req, res, next) => {
  const problems = await Problem.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .sort({
      score: { $meta: 'textScore' }
    })
    .limit(5);

  //res.json(problems);
  res.locals.problems = problems;
  next();
};
