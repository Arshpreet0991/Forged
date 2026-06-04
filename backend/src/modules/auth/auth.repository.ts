import prisma from '../../config/prisma';

const createUser = async ({
  email,
  password,
  username,
  timezone,
}: {
  email: string;
  password: string;
  username: string;
  timezone: string;
}) => {
  const newUser = await prisma.user.create({
    data: { email, password, username, timezone },
    omit: { password: true }, // Exclude password from the returned user object
  });

  return newUser;
};

const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
};

const createVerificationToken = async (
  userId: string,
  code: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
  expiresAt: Date,
) => {
  const token = await prisma.verificationToken.create({
    data: { userId, code, type, expiresAt },
  });
  return token;
};

const getVerificationToken = async (userId: string, code: string) => {
  const token = await prisma.verificationToken.findFirst({
    where: { userId, code },
    orderBy: { createdAt: 'desc' },
  });
  return token;
};

const updateVerificationToken = async (userId: string, code: string) => {
  const token = await prisma.verificationToken.updateMany({
    where: { userId, code },
    data: { isUsed: true },
  });
  return token;
};

const updateUserVerifiedStatus = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
  return user;
};

const saveRefreshToken = async (userId: string, refreshToken: string) => {
  const token = await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });
  return token;
};

const deleteRefreshToken = async (userId: string) => {
  const token = await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  return token;
};

const updateUserPassword = async (userId: string, newPassword: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword }, // newPassword should be hashed before calling this function
  });
  return user;
};

export {
  createUser,
  findUserByEmail,
  createVerificationToken,
  getVerificationToken,
  updateVerificationToken,
  updateUserVerifiedStatus,
  saveRefreshToken,
  deleteRefreshToken,
  updateUserPassword,
};
