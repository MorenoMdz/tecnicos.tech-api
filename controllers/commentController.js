const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');

exports.addComment = async (req, res) => {
  req.body.author = req.user._id;
  console.log(req.body.area);
  switch (req.body.area) {
    case 'repair':
      req.body.repair = req.params.id || null;
      break;
    case 'post':
      req.body.post = req.params.id || null;
      break;
    default:
      break;
  }

  const newComment = new Comment(req.body);
  await newComment.save();

  req.flash('success', 'Comentário adicionado!');
  res.redirect('back');
};
