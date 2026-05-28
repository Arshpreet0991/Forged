import { RegisterRequest } from './auth.contracts';
import bcryptjs from 'bcryptjs';
import { createUser, findUserByEmail } from './auth.repository';
import ApiError from '../../shared/errors/ApiError';

const registerUser = async (data: RegisterRequest) => {
  const { email, password, username, timezone } = data;
  const existingUser = await findUserByEmail(email); // Check if user already exists
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }
  const hashedPassword = await bcryptjs.hash(password, 10);

  const newUser = await createUser({
    email,
    password: hashedPassword,
    username,
    timezone,
  }); // Create the user in the database
  return newUser;
};

export { registerUser };
