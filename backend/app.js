const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const JsonDB = require('node-json-db');
const db = new JsonDB("myDataBase", true, false);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));

app.post('/upload', (req, res, next) => {
  let imageFile = req.files.file;

  imageFile.mv(`${__dirname}/public/${req.body.filename}.jpg`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
      db.push('/files', [{
          name : `${req.body.filename}.jpg`,
          vote : 0
      }], false);

    res.json({file: `public/${req.body.filename}.jpg`});
  });
});

app.get('/images', (req, res, next) => {
  const files = db.getData('/files');

  res.json({files: files});
});

getCookie = name => {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin === -1) {
        begin = dc.indexOf(prefix);
        if (begin !== 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end === -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}


app.post('/addVote', (req, res, next) => {
    if (req.body.firstVote !== 'null') {
        res.json({ 'error': 'Vous avez déjà voté ;)'})
    } else {
        const files = db.getData('/files');

        const newFiles = files.filter(file => file.name !== req.body.name);
        let numVote = parseInt(req.body.vote);
        newFiles.push({
            name : req.body.name,
            vote : numVote += 1
        });
        db.push('/files', newFiles, true);
        res.json({ newFile: req.body})
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8000, () => {
  console.log('8000');
});

module.exports = app;
