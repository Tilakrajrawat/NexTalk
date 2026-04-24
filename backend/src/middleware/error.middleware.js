const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
  
    const response = {
      success: false,
      message: err.message || "Internal Server Error"
    };
  
    if (err.errors) {
      response.errors = err.errors;
    }
  
    if (process.env.NODE_ENV !== "production" && err.stack) {
      response.stack = err.stack;
    }
  
    return res.status(statusCode).json(response);
  };
  
  module.exports = errorMiddleware;