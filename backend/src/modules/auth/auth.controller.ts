import asyncHandler from '../../shared/utils/asyncHandler';
import { registerSchema } from './auth.schema';
import * as authService from './auth.service';
import sendResponse from '../../shared/utils/apiResponse.utils';

const registerUser = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body); // Validate the request body against the Zod schema

  const user = await authService.registerUser(body); // Call the service function to register the user

  sendResponse(res, 201, 'user created successfully', {
    id: user.id,
    email: user.email,
  });
});

export { registerUser };
