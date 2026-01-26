import z from "zod";

/**
 * DTO for user registration
 * Required fields: fullName, email, password, confirmPassword
 */
export const RegisterUserDTO = z.object({

    fullName: z.string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must not exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),

    email: z.string()
        .email("Please enter a valid email address")
        .toLowerCase(),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .min(1, "Password is required"),

    confirmPassword: z.string()
        .min(6, "Password must be at least 6 characters")
        .min(1, "Confirm Password is required"),

    role: z.enum(["user","admin"]).optional(),

}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
    
);

export type RegisterUserDTO = z.infer<typeof RegisterUserDTO>;

/**
 * DTO for user login
 * Required fields: email, password
 */
export const LoginUserDTO = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .toLowerCase(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .min(1, "Password is required"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
