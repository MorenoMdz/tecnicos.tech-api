const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const Hardware = mongoose.model('Hardware');
const Problem = mongoose.model('Problem');
const Repair = mongoose.model('Repair');
const Tech = mongoose.model('Technician');

exports.countHw = async (req, res, next) => {
  const hwCount = await Hardware.count();
  problemController.countProblems;
};

exports.countProblems = async (req, res, next) => {
  const problemsCount = await Problem.count();
  console.log(problemsCount);
  res.render('layout', { problemsCount });
};

exports.homeDisplay = async (req, res, next) => {
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

  const homeDisplay = await Promise.all([
    countHws,
    countProblems,
    countRepairs,
    countTechs,
    topTechs,
    topRepairs /* order here matters when reading from the object index in the view */,
  ]);
  req.body.homeDisplay = homeDisplay;
  //const paginatedPosts = req.body.posts; // comes from locals from postController

  //res.render('layout', { homeDisplay, paginatedPosts });
  next();
};
