var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

const { decodeToken } = require('./app/auth/middleware');

const authArtistRouter = require('./app/auth/artist/router');
const authUserRouter = require('./app/auth/user/router');

const songRouter = require('./app/song/router');
const albumRouter = require('./app/album/router');
const tagRouter = require('./app/genre/router');
const voucherRouter = require('./app/voucher-topup/router');
const walletRouter = require('./app/wallet/router');
const transactionRouter = require('./app/transaction/router');
const artistRouter = require('./app/artist/router');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())
app.use(decodeToken());

app.use('/auth', authUserRouter)
app.use('/auth', authArtistRouter)

app.use('/api', songRouter)
app.use('/api', albumRouter)
app.use('/api', tagRouter)
app.use('/api', voucherRouter)
app.use('/api', walletRouter)
app.use('/api', transactionRouter)
app.use('/api', artistRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
