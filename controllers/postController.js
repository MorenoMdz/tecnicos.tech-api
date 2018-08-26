const mongoose = require('mongoose');
const Post = mongoose.model('Post');

exports.addPost = async (req, res) => {
  req.body.author = req.user._id;
  console.log(req.body);

  const newPost = new Post(req.body);
  await newPost.save();

  req.flash('success', 'Postagem Adicionada!');
  res.redirect('back');
};
