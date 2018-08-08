const mongoose = require('mongoose');
const Hardware = mongoose.model('Hardware');
const Problem = mongoose.model('Problem');
const Repair = mongoose.model('Repair');
const Tech = mongoose.model('Technician');

exports.countHw = async (req, res, next) => {
  const hwCount = await Hardware.count();
  //res.render('layout', { hwCount });
  problemController.countProblems;
};

exports.countProblems = async (req, res, next) => {
  const problemsCount = await Problem.count();
  console.log(problemsCount);
  res.render('layout', { problemsCount });
  /* next(); */
};

exports.homeDisplay = async (req, res) => {
  const countProblems = Problem.count();
  const countHws = Hardware.count();
  const countRepairs = Repair.count();
  const countTechs = Tech.count();
  const homeDisplay = await Promise.all([
    countHws,
    countProblems,
    countRepairs,
    countTechs,
  ]);
  res.render('layout', { homeDisplay });
};
