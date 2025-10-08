"use client";

import React from "react";
import { Button } from "./ui/button";
import { RiGoogleFill } from "@remixicon/react";
import { getGoogleOauthConsentUrl } from "@/app/authenticate/auth.action";
import { toast } from "sonner";

const GoogleOAuthButton = () => {
  const handleButtonClick = async () => {
    const res = await getGoogleOauthConsentUrl();
    if (res.url) window.location.href = res.url;
    else toast.error(res.error);
  };

  return (
    <Button
      className="self-center cursor-pointer"
      onClick={() => {
        handleButtonClick();
      }}
      asChild
    >
      <div className="w-full">
        <RiGoogleFill className="w-5 h-5" />
        Continue with Google
      </div>
    </Button>
  );
};

export default GoogleOAuthButton;
