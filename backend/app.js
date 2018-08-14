const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const postsRoutes = require('./routes/posts');

const app = express();

mongoose.connect('mongodb://localhost:27017/mean-posts')
  .then(() => {
    console.log('Connected to database successfully');
  })
  .catch(() => {
    console.log('Connection to database failed!');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));
// to host the Angular app from within the Node Express backend server
// app.use('/', express.static(path.join(__dirname, 'angular')));

// comment out when hosting the Angular app from within the Node Express backend server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/user', userRoutes);
app.use('/api/posts', postsRoutes);
// to host the Angular app from within the Node Express backend server
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, 'angular', 'index.html'));
// });

module.exports = app;
