import { RegisterRequest } from './auth.contracts';
import bcryptjs from 'bcryptjs';
import ApiError from '../../shared/errors/ApiError';
import * as authRepository from './auth.repository';
import { sendVerificationEmail } from '../../shared/providers/emailProvider';

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

export { registerUser };
