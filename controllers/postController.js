const mongoose = require('mongoose');
const Post = mongoose.model('Post');

exports.addPost = async (req, res) => {
  req.body.author = req.user._id;
  const newPost = new Post(req.body);
  await newPost.save();

  req.flash('success', 'Postagem Adicionada!');
  res.redirect('back');
};

exports.getAllPosts = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 3;
  const skip = page * limit - limit;

  const postPromise = Post.find()
    .sort({ created: -1 })
    .skip(skip)
    .limit(limit);
  const countPromise = Post.count();

  const [posts, count] = await Promise.all([postPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!posts.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting back to home.`
    );
    res.redirect('/');
    return;
  }

  const paginatedPosts = {
    area: 'posts',
    posts,
    page,
    pages,
    count,
  };

  // putting all the posts info @locals
  const homeDisplay = req.body.homeDisplay;

  res.render('layout', { homeDisplay, paginatedPosts });
};

exports.getPostById = async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
  }).populate('author');
  if (!post) return next(); // it kicks in the 404 error handler
  res.render('post', {
    post,
    area: 'post',
  });
};

exports.updatePost = async (req, res) => {
  const updates = {
    title: req.body.title,
    text: req.body.text,
  };
  const post = await Post.findOneAndUpdate(
    { _id: req.body.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Postagem atualizada.');
  res.redirect(`back`);
};
