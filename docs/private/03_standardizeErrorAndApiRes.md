# Standardize Error and Api Response

### Error Response

- To create a standard error response, we need to create a custom class which extends the built in JS Error class.
- we create a class and not a function because the Error class gives us the ability to trace the stack, to find the exact line which caused the error.
- The idea is, when we want to send an error, we will create a new instance of this class. `throw new ApiError (500, "internal server error")`.
- A plain function cannot be thrown or checked with instanceof — that is why a class is used for errors specifically
- To do this, We create a constructor method inside the class. This method runs automatically when we create a new instance of a class using the `new` keyword. So whatever parameters we pass here will be passed to the instance of this class during creation. So, we define `statusCode, message, errors=[]`
- Inside the constructor body, we must call `super(message)`, to intialize the parent Error class.

```js
  class ApiError extends Error {

    // constructor method- runs automatically when creating an instance
      constructor(
      statusCode: number,
      message = 'Something went wrong',
      errors = [],
      )
      {
      super(message); // Call the parent constructor with the message
      this.statusCode = statusCode;
      this.message = message; //  Set the message property explicitly
      this.success = false;
      this.errors = errors;

      // Capture the stack trace (optional, but helps with debugging)
      if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
          }
      }
  }

  export default ApiError;

```

### Api Response

- api response is just to shape our responses, so we dont need any class here, a function will suffice.
- we just create a function which will take res, satusCode, message and data as parameter and return us the response that we send back to the client.

  ```js
    import { Response } from 'express';

    const sendResponse = (
        res: Response,
        statusCode: number,
        message: string,
        data?: any,
        ) => {
                res.status(statusCode).json({
                    success: statusCode >= 200 && statusCode < 300,
                    message,
                    data,
                });
    };

    export default sendResponse;

  ```

### Async Handler

- To handle the try catch block of async function, we reduce the boiler plate code by creating a wrapper (higher order function), which takes in a request function as parameter.
- Then that request parameter is then, wrapped in a try-catch block, and executed in the try block, and handles the error in the catch block.
- The catch block, will import our standard error response, and shape the response according to our custom ApiError class.

```typescript
import { Request, Response, NextFunction, RequestHandler } from "express";
import logger from "../../config/logger";
import ApiError from "../errors/ApiError";

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
            error instanceof Error ? error.message : "Internal Server Error",
        });
      }
      logger.error("Error occurred in async handler", { error });
    }
  };
};

export default asyncHandler;
```
