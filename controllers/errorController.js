const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  // console.log(`value is:  ${err.keyValue.name}`)
  const value = err.keyValue.name;
  const message = `Duplicate field value:  ( ${value} ). Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpireError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDevelopment = (err, req, res) => {
  // A) For API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statsCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) For RENDER WEBSITE
  console.log(err)
  return res.status(err.statsCode).render('error', {
    title: 'There is something wrong!',
    msg: err.message,
  });
};

const sendErrorProduction = (err, req, res) => {
  // A) For API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statsCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) For RENDER WEBSITE
    //1) Log error
    console.error('Error  😠', err);
    return res.json({
      status: 'error',
      message: 'Some thing went wrong!',
    });
  }
  if (err.isOperational) {
    return res.status(err.statsCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  //  Programming or other unknown error: don't leak error details
  // B) For RENDER WEBSITE
  //1) Log error
  console.log('ERROR', '🎆', err);

  //2) Send generic message
  return res.status(err.statsCode).render('error', {
    title: 'There is something wrong!',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statsCode = err.statsCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err.name);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if ((err.name = 'TokenExpiredError')) error = handleJWTExpireError();
    sendErrorProduction(err, req, res);
  }
};
