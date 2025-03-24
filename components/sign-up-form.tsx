"use client";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signInDefaultValues } from "@/lib/constants";
import { Button } from "./ui/button";
import Link from "next/link";
import { useActionState } from "react";
import { SignUpResponse, signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  const [actionResponse, action, isPending] = useActionState<
    SignUpResponse,
    FormData
  >(signUpUser, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={signInDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="confirmPassword"
            defaultValue={signInDefaultValues.confirmPassword}
          />
        </div>
        <div>
          <Button disabled={isPending} className="w-full" variant="default">
            {isPending ? "Pending..." : "Sign Up"}
          </Button>
        </div>

        {/* Content on failed sign in attempt */}
        {actionResponse && !actionResponse.success && (
          <div className="text-center text-destructive">
            {actionResponse.message}
          </div>
        )}

        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" target="_self" className="link underline">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
