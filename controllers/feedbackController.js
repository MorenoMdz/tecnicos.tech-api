const mongoose = require('mongoose');
const Feedback = mongoose.model('Feedback');
const mail = require('../handlers/mail');

exports.addFeedback = async (req, res) => {
  req.body.author = req.user._id;

  const newFeedback = new Feedback(req.body);
  await newFeedback.save();

  const adminUrl = `http://${req.headers.host}/config`;
  await mail.send({
    subject: 'Novo feedback',
    to: process.env.SITE_ADMIN,
    adminUrl,
    filename: 'new-feedback',
  });

  req.flash('success', 'Feedback enviado!');
  res.redirect('back');
};

exports.getAllFeedbacks = async (req, res, next) => {
  const page = req.params.page || 1;
  const limit = 5;
  const skip = page * limit - limit;

  const feedbackPromise = Feedback.find({})
    .sort({ status: +1, created: -1 })
    .skip(skip);
  //.limit(limit); // to implement later with pagination in a dedicated view
  const countPromise = Feedback.count();

  const [feedbacks, count] = await Promise.all([feedbackPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!feedbacks.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting back to home.`
    );
    res.redirect('back');
    return;
  }

  const paginatedFeedbacks = {
    area: 'feedbacks',
    feedbacks,
    page,
    pages,
    count,
  };
  res.locals.feedbacks = paginatedFeedbacks;

  next();
};

exports.updateFeedbackStatus = async (req, res, user) => {
  const feedback = await Feedback.findOneAndUpdate(
    { _id: req.body.id },
    { $set: { status: 'Lido' } },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Feedback lido');
  res.redirect('back');
};
