"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/schema/message";
import { toPusherKey } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface messagesprops {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}

export default function Messages(props: messagesprops) {
  const [messages, setMessages] = useState<Message[]>(props.initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${props.chatId}`));

    //
    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${props.chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [props.chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  // this function used to show the timestamp in the message
  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm a"); // Format the timestamp to 'HH:mm a' (e.g., 02:30 PM)
  };

  return (
    <div id="messages" className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 px-4 py-3 scrollbar-thin scrollbar-thumb-indigo-300">
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === props.sessionId;
        const hasNext = messages[index - 1]?.senderId === message.senderId;

        return (
          <div key={message.id} className="chat-message">
            <div className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end ${isCurrentUser ? "flex-row-reverse" : "flex-row"} gap-2`}>
                {!hasNext && (
                  <div className="relative w-6 h-6">
                    <Image fill referrerPolicy="no-referrer" src={isCurrentUser ? props.sessionImg || "/default-avatar.png" : props.chatPartner.image || "/default-avatar.png"} alt="Profile" className="rounded-full object-cover" />
                  </div>
                )}

                <div className={`flex flex-col space-y-1 text-sm max-w-xs ${isCurrentUser ? "items-end" : "items-start"}`}>
                  <span className={`px-4 py-2 rounded-xl ${isCurrentUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"} ${!hasNext && (isCurrentUser ? "rounded-br-none" : "rounded-bl-none")}`}>
                    {message.text}
                    <span className="ml-2 text-xs text-gray-400 block text-end">{formatTimestamp(message.timestamp)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
