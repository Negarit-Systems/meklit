import z from 'zod';

export const userRegisterSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  }),
});

export const userVerifySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 characters'),
  }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  }),
});

export type CreateUserInputSchema = z.infer<
  typeof userRegisterSchema
>['body'];
export type UserVerifyInputSchema = z.infer<
  typeof userVerifySchema
>['body'];
export type UserLoginInputSchema = z.infer<
  typeof userLoginSchema
>['body'];
