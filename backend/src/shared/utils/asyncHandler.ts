import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../../config/logger';
import ApiError from '../errors/ApiError';

const asyncHandler = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: error.success,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message:
            error instanceof Error ? error.message : 'Internal Server Error',
        });
      }
      logger.error('Error occurred in async handler', { error });
    }
  };
};

export default asyncHandler;

/*
asyncHandler is a higher-order function that takes an asynchronous function (fn) as an argument and returns a new function. 

this process happens in 2 steps:
1. The asyncHandler returns an asynchronous function that takes req, res, and next as parameters. This returned function is what will be used as the route handler in Express. The original function "fn" is not executed at this point; instead, the returned function is ready to be called when a request comes in. This step is where the wrapper is created around the original function "fn".

2. This is where the inner function is executed. When the request comes in, the returned function is then called with the req,res,next parameters. The original function "fn" is captured in closure (in memory), so these parameters are passed to it and the original function is executed.

*/
