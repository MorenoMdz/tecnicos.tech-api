const mongoose = require('mongoose');
const Repair = mongoose.model('Repair');
const User = mongoose.model('Technician');

exports.addRepairForm = async (req, res) => {
  res.render('addRepairForm');
};

exports.createRepair = async (req, res) => {
  req.body.author = req.user._id;
  req.body.photos = req.files;

  const repair = await new Repair(req.body)
    .save()
    .catch(err => console.log(err));

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
  res.render('repair', { repair, title: repair.hardware, area: 'repair' });
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
