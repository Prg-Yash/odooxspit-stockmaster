"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthTypes } from "@/types/auth.types";
import { useAuthentication } from "@/server/api/authentication.api";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Loader } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm({
    resolver: zodResolver(AuthTypes.SLoginUser),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { loginMutation } = useAuthentication();
  const { mutateAsync: loginUser, isPending } = loginMutation();

  async function handleSubmit(data: AuthTypes.TLoginUser) {
    await loginUser(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>

          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <FormItem>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </Field>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <Field>
                <div className="flex items-center">
                  <FieldLabel>Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <FormItem>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </Field>
            )}
          />

          {/* SUBMIT */}
          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <span>
                  <Loader className="size-4 animate-spin" />
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              Don’t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
}
