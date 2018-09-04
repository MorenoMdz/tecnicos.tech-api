const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const Hardware = mongoose.model('Hardware');
const Problem = mongoose.model('Problem');
const Repair = mongoose.model('Repair');
const Tech = mongoose.model('Technician');

exports.configPanel = async (req, res) => {
  res.render('config');
};

exports.countProblems = async res => {
  const problemsCount = await Problem.count();
  console.log(problemsCount);
  res.render('layout', { problemsCount });
};

exports.homeDisplay = async (req, next) => {
  const countProblems = Problem.count();
  const countHws = Hardware.count();
  const countRepairs = Repair.count();
  const topRepairs = Repair.find()
    .select({
      title: 1,
      stars: 1,
    })
    .sort({ stars: -1 })
    .limit(5);
  const countTechs = Tech.count();
  const topTechs = Technician.find()
    .select({
      name: 1,
      stars: 1,
      techStars: 1,
      siteRank: 1,
    })
    .sort({ stars: -1 })
    .limit(5);

  /* order here matters when reading from the object index in the view */
  const homeDisplay = await Promise.all([
    countHws,
    countProblems,
    countRepairs,
    countTechs,
    topTechs,
    topRepairs,
  ]);
  // puts the info to the req body, which sets the locals with same name
  req.body.homeDisplay = homeDisplay;
  // passes the request to the next method
  next();
};
