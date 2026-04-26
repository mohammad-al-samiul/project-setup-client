"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

import { FormInput } from "@/components/form/FormInput";

import { LoginData } from "@/schemas/auth/authSchema";
import { FormPassword } from "@/components/form/FormPassword";
import { useLoginForm } from "@/hooks/form";
import { useLogin } from "@/hooks/auth";

export function LoginForm() {
  const form = useLoginForm();
  const { mutate, isPending } = useLogin();

  const onSubmit = (data: LoginData) => {
    console.log("Login:", data);
    mutate(data, {
      onSuccess: (res) => {
        console.log(res);
        // tokenStore.set(res.accessToken);
        // router.push("/home");
      },
      onError: (err) => {
        console.error(err);
        // toast.error("Login failed");
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput
              form={form}
              name="email"
              label="Email"
              placeholder="Enter Your Email"
            />
            {/* <FormInput
              form={form}
              name="email"
              label="Email"
              className="mb-6"
              inputClassName="bg-gray-100 border-blue-500"
              labelClassName="text-xs uppercase text-gray-500"
            /> */}

            <FormPassword
              form={form}
              name="password"
              label="Password"
              placeholder="Enter password"
              className="mb-6"
            />

            {/* <FormPassword
              form={form}
              name="password"
              label="Password"
              placeholder="Enter password"
              className="mb-6"
              labelClassName="text-sm font-semibold text-gray-700"
              inputClassName="bg-gray-100 border-blue-500 focus:ring-blue-500"
              containerClassName="rounded-lg"
              iconClassName="text-gray-500 hover:text-blue-500"
            /> */}
          </FieldGroup>

          <Button
            className="mt-4 w-full py-4"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
