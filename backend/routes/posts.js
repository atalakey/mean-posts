const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    callback(isValid ? null : error, 'backend/images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.get('', (req, res, next) => {
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
  });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json({
          message: 'Post fetched sucessfully',
          post: post
        });
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    });
});

router.post(
  '',
  checkAuth,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename,
      creator: req.userData.userId
    });

    post.save().then(result => {
      console.log(JSON.stringify(result, undefined, 2));
      res.status(201).json({
        message: 'Post added sucessfully',
        postId: result._id,
        imagePath: result.imagePath
      });
    });
  }
);

router.put(
  '/:id',
  checkAuth,
  multer({storage: storage}).single('image'),
  (req, res, next) => {
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
          res.status(200).json({ message: 'Post updated sucessfully' });
        } else {
          res.status(401).json({ message: 'Not authorized!' });
        }
      });
  }
);

router.delete(
  '/:id',
  checkAuth,
  (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
      .then(result => {
        console.log(JSON.stringify(result, undefined, 2));
        if (result.n != 0) {
          res.status(200).json({ message: 'Post deleted sucessfully' });
        } else {
          res.status(401).json({ message: 'Not authorized!' });
        }
      });
  }
);

module.exports = router;
