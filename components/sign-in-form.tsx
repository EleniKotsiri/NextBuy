'use client';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signInDefaultValues } from "@/lib/constants";
import { Button } from "./ui/button";
import Link from "next/link";
import { useActionState } from "react";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const SignInForm = () => {
  const [actionResponse, action, isPending] = useActionState<any, any>(signInWithCredentials,{
    success: false,
    message: ''
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
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
          <Button disabled={isPending} className="w-full" variant="default">
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </div>

        {/* Content on failed sign in attempt */}
        {actionResponse && !actionResponse.success && (
          <div className="text-center text-destructive">
            {actionResponse.message}
          </div>
        )}

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' target="_self" className="link underline">Sign Up</Link>
        </div>
      </div>
    </form>
  )
}

export default SignInForm