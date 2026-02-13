import z from "zod";

/**
 * DTO for creating fitness content (Admin only)
 */
export const CreateFitnessContentDTO = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must not exceed 100 characters"),
    
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must not exceed 500 characters"),
    
    content: z.string()
        .min(10, "Content must be at least 10 characters")
        .optional(),
    
    image: z.string()
        .min(1, "Image path is required")
        .optional(),
    
    video: z.string().url("Invalid video URL").optional(),
    
    tags: z.array(z.enum(['cardio', 'strength', 'yoga', 'flexibility', 'hiit', 'pilates', 'meditation', 'nutrition', 'other']))
        .optional(),
    
    // difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    
    duration: z.number()
        .min(1, "Duration must be at least 1 minute")
        .optional(),
    
    isPublished: z.boolean().optional()
}).strict();

export type CreateFitnessContentDTO = z.infer<typeof CreateFitnessContentDTO>;

/**
 * DTO for updating fitness content (Admin only)
 */
export const UpdateFitnessContentDTO = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must not exceed 100 characters")
        .optional(),
    
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must not exceed 500 characters")
        .optional(),
    
    content: z.string()
        .min(10, "Content must be at least 10 characters")
        .optional(),
    
    image: z.string()
        .min(1, "Image path is required")
        .optional(),
    
    video: z.string().url("Invalid video URL").optional(),
    
    tags: z.array(z.enum(['cardio', 'strength', 'yoga', 'flexibility', 'hiit', 'pilates', 'meditation', 'nutrition', 'other']))
        .optional(),
    
    // difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    
    duration: z.number()
        .min(1, "Duration must be at least 1 minute")
        .optional(),
    
    isPublished: z.boolean().optional()
}).strict();

export type UpdateFitnessContentDTO = z.infer<typeof UpdateFitnessContentDTO>;
