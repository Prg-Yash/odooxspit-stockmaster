import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function VerifyPage() {
  // TODO: @shoto make a check your email for verification code page
  return (
    <div className="space-y-2 flex flex-col items-center">
      <CheckCircle2 size={30} />
      <h1 className="font-semibold text-2xl text-center">
        You have been registered successfully!
      </h1>
      <p className="text-muted-foreground text-sm font-medium text-center">
        Please check you email to verify your account.
      </p>
    </div>
  );
}
