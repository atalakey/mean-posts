const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hashedPassword => {
      const user = new User({
        email: req.body.email,
        password: hashedPassword
      });

      user.save()
        .then(user => {
          console.log(JSON.stringify(user, undefined, 2));

          const token = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
          );

          res.status(201).json({
            message: 'User created sucessfully',
            token: token,
            expiresIn: 3600,
            userId: user._id
          });
        })
        .catch(error => {
          res.status(500).json({
            message: 'Email already registered!'
          });
        });
    });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Invalid authentication credentials!'
        });
      }

      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Invalid authentication credentials!'
        });
      }

      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'User authenticated',
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Invalid authentication credentials!'
      });
    });
};
