"use server";
import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Sign in action
export async function signInWithCredentials(
  prevState: unknown, // from the useActionState hook
  formData: FormData
) {
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
export async function signOutUser() {
  await signOut({ redirectTo: '/', redirect: true });
}