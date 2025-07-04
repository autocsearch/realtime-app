"use client";

import { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface chatInputProps {
  chatsPartner: User;
  chatId: string;
}

export default function ChatInput({ chatsPartner, chatId }: chatInputProps) {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay

      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, chatId }),
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error(resData.message || "Something went wrong.");
      }

      setInput("");
      textAreaRef.current?.focus(); // Reset focus to the textarea
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 px-3 py-2">
          <TextareaAutosize
            ref={textAreaRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${chatsPartner.name}`}
            className="w-full resize-none border-0 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Send Button */}
        <Button onClick={sendMessage} type="submit" className="h-10 px-4 bg-slate-700 text-white hover:bg-slate-300 hover:text-black">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
