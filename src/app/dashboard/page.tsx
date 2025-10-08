import React from "react";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

const DashboardPage = async () => {
  const user = await getUser();
  if (!user) redirect("/authenticate");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border border-gray-100 transition-transform hover:scale-[1.02] duration-300">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={user?.picture || "/avatar.png"}
            alt={user.name}
            width={100}
            height={100}
            className="rounded-full border border-gray-200 shadow-sm"
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <div className="border-t my-6" />

        <div className="flex flex-col gap-3">
          <button
            // onClick={() => router.push("/profile")}
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
          <SignOutButton>Log Out</SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
