const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(user => {
          console.log(JSON.stringify(user, undefined, 2));
          const token = jwt.sign(
            { email: user.email, userId: user._id },
            'secret_this_should_be_longer',
            { expiresIn: '1h' }
          );
          res.status(201).json({
            message: 'User created sucessfully',
            token: token,
            expiresIn: 3600,
            userId: user._id
          });
        })
        .catch(err => {
          res.status(500).json({
            message: err
          });
        });
    });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed!'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Authentication failed!'
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'secret_this_should_be_longer',
        { expiresIn: '1h' }
      );
      return res.status(200).json({
        message: 'User authenticated',
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: 'Authentication failed!'
      });
    })
});

module.exports = router;
