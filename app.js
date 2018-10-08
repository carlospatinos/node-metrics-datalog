var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var metrics = require('datadog-metrics');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

metrics.init({ host: 'localhost', prefix: 'myapp.' });
function collectMemoryStats() {
  var memUsage = process.memoryUsage();
  metrics.gauge('memory.rss', memUsage.rss);
  metrics.gauge('memory.heapTotal', memUsage.heapTotal);
  metrics.gauge('memory.heapUsed', memUsage.heapUsed);
  metrics.increment('memory.statsReported');
}

setInterval(collectMemoryStats, 5000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
