import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.email },
        { employeeId: input.employeeId },
      ],
    },
  });

  if (existingUser) {
    throw new Error("Email or Employee ID already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        employeeId: input.employeeId,
        email: input.email,
        passwordHash,
        role: input.role,
        employee: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: {
        employee: true,
      },
    });

    return createdUser;
  });

  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role,
    employee: user.employee,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    include: {
      employee: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "2h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      employee: user.employee,
    },
  };
}