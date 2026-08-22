import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error("JWT_SECRET is not configured");
})();

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

function generateEmployeeId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createEmployee(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
  department?: string,
  designation?: string,
  joiningDate?: string,
  employmentStatus?: string
) {
  return await prisma.$transaction(async (tx) => {
    const employeeId = generateEmployeeId();

    const user = await tx.user.create({
      data: {
        employeeId,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "EMPLOYEE",
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        address,
        department,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        employmentStatus: employmentStatus ?? "ACTIVE",
      },
    });

    return { user, employee };
  });
}

export async function listEmployees() {
  const users = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
    },
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role,
    employee: user.employee,
  }));
}

export async function getEmployeeById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });

  if (!user) {
    throw new Error("Employee not found");
  }

  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role,
    employee: user.employee,
  };
}

export async function updateEmployee(id: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  employmentStatus?: string;
}) {
  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    include: { user: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const updatedEmployee = await prisma.employee.update({
    where: { userId: id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      department: data.department,
      designation: data.designation,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      employmentStatus: data.employmentStatus,
    },
  });

  return {
    id: employee.user.id,
    employeeId: employee.user.employeeId,
    email: employee.user.email,
    role: employee.user.role,
    employee: updatedEmployee,
  };
}

export async function deleteEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    include: { user: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  await prisma.user.delete({
    where: { id: employee.userId },
  });

  return { success: true, message: "Employee deleted successfully" };
}

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role,
    employee: user.employee,
  };
}

export async function updateMyProfile(userId: string, data: {
  phone?: string;
  address?: string;
  profilePicture?: string;
}) {
  const employee = await prisma.employee.update({
    where: { userId },
    data: {
      phone: data.phone,
      address: data.address,
      profilePicture: data.profilePicture,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    id: user!.id,
    employeeId: user!.employeeId,
    email: user!.email,
    role: user!.role,
    employee,
  };
}