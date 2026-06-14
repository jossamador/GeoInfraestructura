import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError";
import { UserModel } from "../models/User";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const signToken = (user: { id: string; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET ?? "dev_secret";
  return jwt.sign(user, secret, { expiresIn: "7d" });
};

export const registerUser = async ({ name, email, password }: RegisterInput) => {
  const exists = await UserModel.findOne({ email });

  if (exists) {
    throw new HttpError(409, "El correo ya existe");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, passwordHash });

  return {
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new HttpError(401, "Credenciales invalidas");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new HttpError(401, "Credenciales invalidas");
  }

  return {
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

export const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("name email role createdAt");

  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  return user;
};
