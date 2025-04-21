"use client";

import { signOut } from "next-auth/react";
import { ButtonHTMLAttributes, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignOutButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isSignOut, setIsSignOut] = useState(false);

  const router = useRouter();

  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        setIsSignOut(true);
        try {
          await signOut({ callbackUrl: "/login" });
          setTimeout(() => {
            router.push("/login");
          }, 1000);
          toast.success("Signed out successfully");
        } catch (error) {
          console.error(error);
          toast.error("Failed to sign out");
        } finally {
          setIsSignOut(false);
        }
      }}
    >
      {isSignOut ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className="h-4 w-4" />}
    </Button>
  );
}
