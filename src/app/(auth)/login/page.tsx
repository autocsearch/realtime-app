"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    try {
      await signIn("google");
    } catch (error) {
      toast.error("An error occurred while signing in. Please try again.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-12 bg-indigo-50">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/Owl.svg" width={40} height={40} alt="Logo" />
          <h1 className="text-3xl font-bold text-indigo-900">NestChat</h1>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Sign in to your account</h2>

        <Button disabled={isLoading} type="button" className="w-full max-w-sm bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleLogin}>
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </>
          )}
        </Button>
      </div>

      {/* Project Description Section */}
      <div className="w-full md:w-1/2 bg-indigo-100 px-8 py-12 flex flex-col items-center justify-center text-center text-gray-800">
        <h2 className="text-3xl font-bold mb-4">Welcome to NestChat</h2>
        <p className="text-base max-w-md mb-6">NestChat is your team’s communication hub. Collaborate, share ideas, and stay productive in one simple platform.</p>
        <Image src="/chat-illustration.svg" alt="Chat illustration" width={280} height={280} className="rounded-lg" />
      </div>
    </div>
  );
}
