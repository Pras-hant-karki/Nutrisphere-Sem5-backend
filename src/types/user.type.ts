import z, { string } from "zod";

export const UserSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin"]).default("user"),
    profilePicture: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    lastLogin: z.date().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
