import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateOwnProfileSchema,
} from "./employees.schemas.js";
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
} from "./employees.service.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";

const router = Router();

// Admin: List all employees
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const employees = await listEmployees();
      res.json({
        success: true,
        data: employees,
        message: "Employees retrieved successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      });
    }
  }
);

// Authenticated user: View own profile
router.get(
  "/me",
  requireAuth,
  async (req: import("../../middleware/auth.middleware.js").AuthenticatedRequest, res: Response) => {
    try {
      const user = await getMyProfile(req.user!.userId);
      res.json({
        success: true,
        data: user,
        message: "Profile retrieved successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message,
        },
      });
    }
  }
);

// Authenticated user: Update own profile (phone, address, profilePicture only)
router.patch(
  "/me",
  requireAuth,
  async (req: import("../../middleware/auth.middleware.js").AuthenticatedRequest, res: Response) => {
    try {
      const data = updateOwnProfileSchema.parse(req.body);
      const user = await updateMyProfile(req.user!.userId, data);
      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: zodError.issues[0].message,
          },
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      });
    }
  }
);

// Admin: Create a new employee
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const { user, employee } = await createEmployee(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.phone,
        data.address,
        data.department,
        data.designation,
        data.joiningDate,
        data.employmentStatus
      );
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
          },
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            address: employee.address,
            department: employee.department,
            designation: employee.designation,
            joiningDate: employee.joiningDate,
            employmentStatus: employee.employmentStatus,
          },
        },
        message: "Employee created successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: zodError.issues[0].message,
          },
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      });
    }
  }
);

// Admin: View employee details
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const employee = await getEmployeeById(String(req.params.id));
      res.json({
        success: true,
        data: employee,
        message: "Employee retrieved successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      res.status(404).json({
        success: false,
        error: {
          code: "EMPLOYEE_NOT_FOUND",
          message,
        },
      });
    }
  }
);

// Admin: Update employee
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const data = updateEmployeeSchema.parse(req.body);
      const employee = await updateEmployee(req.params.id as string, data);
      res.json({
        success: true,
        data: employee,
        message: "Employee updated successfully",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: zodError.issues[0].message,
          },
        });
        return;
      }
      res.status(404).json({
        success: false,
        error: {
          code: "EMPLOYEE_NOT_FOUND",
          message,
        },
      });
    }
  }
);

// Admin: Delete/Deactivate employee
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const result = await deleteEmployee(String(req.params.id));
      res.json({
        success: true,
        data: result,
        message: result.success
          ? "Employee deleted successfully"
          : "Employee not found",
      });
    } catch (error) {
      const message = (error as Error).message;
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      });
    }
  }
);

export default router;