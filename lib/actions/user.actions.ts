"use server";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { User } from "@prisma/client";
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";

// Sign in action
export async function signInWithCredentials(
  prevState: unknown, // from the useActionState hook
  formData: FormData
): Promise<SignInResponse> {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user); // (provider, data)

    return { success: true, message: "Signed in successfully!" }; // action state
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid credentials provided." };
  }
}

// Sign out action
export async function signOutUser(): Promise<void> {
  const options: SignOutOptions = {
    redirectTo: "/",
    redirect: true,
  };
  await signOut(options);
}

// Sign up action
export async function signUpUser(
  prevState: unknown, // from the useActionState hook
  formData: FormData
): Promise<SignUpResponse> {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    // store plain password to sign user in when signing up
    const plainPassword = user.password;

    // hash the password and save the user in the db
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully!" };
  } catch (error) {
    console.log(error);
    // console.log(error.name);
    // console.log(error.errors);
    // console.log(error.meta?.target);
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Define the SafeUser type, to omit the password field when grabbing a user from prisma
export type SafeUser = Omit<User, "password">;

// Get User by ID
export async function getUserById(userId: string): Promise<SafeUser> {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) throw new Error("User not found");

    // Remove sensitive info
    const { password, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error(`Failed to fetch user:`, error);
    throw new Error("An error occurred while retrieving the user.");
  }
}

// Define the SignInResponse type
export interface SignInResponse {
  success: boolean;
  message: string | any;
}
// Define the SignUpResponse type
export interface SignUpResponse {
  success: boolean;
  message: string | any;
}
// Define the SignOutOptions type
export interface SignOutOptions {
  redirectTo: string;
  redirect: boolean;
}