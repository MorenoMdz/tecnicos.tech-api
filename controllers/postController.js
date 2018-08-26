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

exports.getAllPosts = async (req, res, next) => {
  const page = req.params.page || 1;
  const limit = 3;
  const skip = page * limit - limit;

  const postPromise = Post.find()
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
  //req.body.posts = paginatedPosts;
  const homeDisplay = req.body.homeDisplay;

  //next();
  res.render('layout', { homeDisplay, paginatedPosts });
};
