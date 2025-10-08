"use client";

import React from "react";
import { Button } from "./ui/button";
import { logOut } from "@/app/authenticate/auth.action";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

const SignOutButton = ({ children }: Props) => {
  return (
    <Button
      variant="destructive"
      className="cursor-pointer hover:scale-110"
      onClick={() => {
        logOut();
        toast.success("Logged out successfully");
      }}
    >
      {children}
    </Button>
  );
};

export default SignOutButton;
