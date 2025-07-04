"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Loader2, LogOut } from "lucide-react";

interface SidebarUserAvatarProps {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

export default function SidebarUserAvatar({ session }: SidebarUserAvatarProps) {
  const [isSignOut, setIsSignOut] = useState(false);
  const router = useRouter();

  return (
    <div className="mx-2 mb-3 flex items-center">
      <div className="flex items-center gap-3 hover:bg-slate-300 rounded-lg px-2 h-10 cursor-pointer ">
        <Avatar>
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">{session.user.name}</p>
      </div>
      <Button
        className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent hover:bg-slate-300 pb-1 "
        variant="default"
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
        {isSignOut ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className="w-4 h-4" />}
      </Button>
    </div>
  );
}
