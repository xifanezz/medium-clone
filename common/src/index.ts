import {z} from 'zod';




export const signUpSchema = z.object({
    username : z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export const signInSchema = z.object({
    email : z.string().email(),
    password: z.string().min(6),
});

export const postInputSchema = z.object({
    title : z.string(),
    description : z.string(),
    
});

export const updatePostInputSchema = z.object({
    title : z.string(),
    description : z.string(),
    id: z.number()
});



export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PostInput = z.infer<typeof postInputSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;