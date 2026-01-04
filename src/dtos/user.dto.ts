import z from "zod";

export const CreateUserDTO = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
