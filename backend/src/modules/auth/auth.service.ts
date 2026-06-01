import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from './auth.contracts';
import bcryptjs from 'bcryptjs';
import ApiError from '../../shared/errors/ApiError';
import * as authRepository from './auth.repository';
import { sendVerificationEmail } from '../../shared/providers/emailProvider';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../shared/utils/generateJWT';

const registerUser = async (data: RegisterRequest) => {
  const { email, password, username, timezone } = data; // Destructure the registration data

  // verify timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone }); // undefined means use the system default locale.
  } catch {
    throw new ApiError(400, 'Invalid timezone');
  }

  // Generate a verification code for email verification
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString(); // Generate a 6-digit verification code

  const existingUser = await authRepository.findUserByEmail(email); // Check if user already exists

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError(
        400,
        'Email is already registered. Please log in instead.',
      );
    } else {
      // Hash the password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Update the password for the existing unverified user
      existingUser.password = hashedPassword;

      // Update the user in the database with the new hashed password
      await authRepository.updateUserPassword(existingUser.id, hashedPassword);

      // Create a new verification token for the existing user
      await authRepository.createVerificationToken(
        existingUser.id,
        verificationCode,
        'EMAIL_VERIFICATION',
        new Date(Date.now() + 3600000),
      );

      // Send the verification email with the new code
      await sendVerificationEmail(email, verificationCode);

      throw new ApiError(
        400,
        'Account already exists but is not verified. A new verification code has been sent to your email.',
      );
    }
  } else {
    //  Hash the password and create a new user
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the user in the database
    const newUser = await authRepository.createUser({
      email,
      password: hashedPassword,
      username,
      timezone,
    }); // Create the user in the database

    // Create a new verification token for the existing user
    await authRepository.createVerificationToken(
      newUser.id,
      verificationCode,
      'EMAIL_VERIFICATION',
      new Date(Date.now() + 3600000),
    );

    // Send the verification email with the new code
    await sendVerificationEmail(email, verificationCode);

    return newUser;
  }
};

const loginUser = async (data: LoginRequest) => {
  const { email, password } = data;

  const user = await authRepository.findUserByEmail(email);

  if (!user) throw new ApiError(404, 'User not registered');

  if (!user.isVerified)
    throw new ApiError(
      401,
      'Account not verified, check your email for verification code',
    );

  if (!user.password) throw new ApiError(401, 'Please login with Google'); // because if password doesnt exist, then user must have logged in via google

  const isPasswordCorrect = await bcryptjs.compare(password, user.password);

  if (!isPasswordCorrect) throw new ApiError(401, 'Incorrect Password');

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await authRepository.saveRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};

const verifyUser = async (data: VerifyEmailRequest) => {
  // receive data from controller
  const { email, verificationCode } = data;

  // find user by email
  const user = await authRepository.findUserByEmail(email);

  if (!user) throw new ApiError(401, 'user not found / registered');

  // search token table with a user id
  const userToken = await authRepository.getVerificationToken(
    user.id,
    verificationCode,
  );

  // checks for token validity
  if (!userToken) throw new ApiError(401, 'Verification code not found');

  if (userToken.expiresAt < new Date())
    throw new ApiError(401, 'Verification code has expired');

  if (userToken.isUsed)
    throw new ApiError(401, 'Verification code has already been used');

  // update token status to isUsed
  await authRepository.updateVerificationToken(user.id, verificationCode);

  // update the user's verified status to true
  await authRepository.updateUserVerifiedStatus(user.id);

  // generate access token and refresh token
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};
export { registerUser, loginUser, verifyUser };
