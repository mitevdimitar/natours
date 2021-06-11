const AppError = require("../utils/appError");

const handleCastError = err => {
  const message = `Ivalid ${err.path}: ${err.value}!`;
  return new AppError(message, 400);
}

const handleDuplicateFields = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field: ${value}`;
  return new AppError(message, 500);
}

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Validation error! ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJwtError = () => AppError('Invalid token. Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if(req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  
  //Rendered page
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message
  })
  
}

const sendErrorProd = (err, req, res) => {
  if(req.originalUrl.startsWith('/api')) {

    //operational errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
  
    //programming errors coming from other libraries
    } else {
      console.error('Error: ', err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      })
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message
      })
  
    //programming errors coming from other libraries
    } else {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: 'Please try again later!'
      })
    }
  }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === "development") {
      sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
      let error = {...err};
      error.message = err.message;
      if (error.name === "CastError") error = handleCastError(error);
      if (error.code === 11000) error = handleDuplicateFields(error);
      if (error._message === "Tour validation failed") error = handleValidationError(error);
      if (error.name === "JsonWebTokenError") error = handleJwtError();
      sendErrorProd(error, req, res);
    }
  }