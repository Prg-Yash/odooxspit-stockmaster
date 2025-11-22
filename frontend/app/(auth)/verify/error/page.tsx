import { XCircle } from "lucide-react";
import React from "react";

export default function VerifyErrorPage() {
  // TODO: @shoto make a failed verification page
  return (
    <div className="space-y-2 flex flex-col items-center">
      <XCircle size={30} />
      <h1 className="font-semibold text-2xl text-center">
        Failed to verify your account!
      </h1>
    </div>
  );
}
