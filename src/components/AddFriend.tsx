"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/schema/form-schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function AddFriend() {
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Friend added successfully!");
        form.reset();
      } else if (resData.message) {
        toast.error(resData.message);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-[400px] md:h-[630px] flex items-center justify-center px-4 bg-indigo-50 rounded-2xl">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-md sm:my-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Add a Friend</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your friend's email" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 w-full bg-slate-500 text-white hover:text-black hover:bg-slate-400">
              Add Friend
            </Button>
          </form>
        </Form>
        {success && <p className="text-green-500 text-center mt-2 transition-opacity duration-300 ease-in-out">🎉 Friend requested successfully!</p>}
      </div>
    </main>
  );
}
