const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();


app.use(logger('dev'));
// app.use(bodyParser.json({'limit': '50mb'}));
// app.use(bodyParser.urlencoded({'limit':'50mb', extended: true}));
app.use(express.json({'limit': '50mb'}));
app.use(express.urlencoded({'limit':'50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


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
  // res.render('error');
  res.json({
    message: err.message,
    error: err
  });
});

// 1.连接数据库
//   1.1 引入 mongoose
const mongoose = require('mongoose');
//   1.2 连接指定数据库（URL只有数据库是变化的）
mongoose.connect('mongodb://localhost:27017/server', {useNewUrlParser: true, useUnifiedTopology: true});
//   1.3 获取连接对象
const conn = mongoose.connection;
//   1.4 绑定连接完成的监听（用来提示连接成功）
conn.once('open', function(){
  console.log('数据库连接成功');
});

module.exports = app;
