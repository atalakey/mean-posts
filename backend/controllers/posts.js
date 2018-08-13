const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery.then(posts => {
    fetchedPosts = posts;
    return Post.count();
  }).then(postCount => {
    res.status(200).json({
      message: 'Posts fetched sucessfully',
      postCount: postCount,
      posts: fetchedPosts
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Unable to fetch posts!'
    });
  });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json({
          message: 'Post fetched sucessfully',
          post: post
        });
      } else {
        res.status(404).json({
          message: 'Post not found!'
        });
      }
    }).catch(error => {
      res.status(500).json({
        message: 'Unable to fetch post!'
      });
    });
};

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });

  post.save()
    .then(result => {
      console.log(JSON.stringify(result, undefined, 2));
      res.status(201).json({
        message: 'Post added sucessfully',
        postId: result._id,
        imagePath: result.imagePath
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Unable to create post!'
      });
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      console.log(JSON.stringify(result, undefined, 2));
      if (result.n != 0) {
        res.status(200).json({
          message: 'Post updated sucessfully'
        });
      } else {
        res.status(401).json({
          message: 'You are not authorized to update this post!'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Unable to update post!'
      });
    });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(JSON.stringify(result, undefined, 2));
      if (result.n != 0) {
        res.status(200).json({
          message: 'Post deleted sucessfully'
        });
      } else {
        res.status(401).json({
          message: 'You are not authorized to delete this post!'
        });
      }
    }).catch(error => {
      res.status(500).json({
        message: 'Unable to delete post!'
      });
    });;
};
