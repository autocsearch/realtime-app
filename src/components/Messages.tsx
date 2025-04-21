"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/schema/message";
import { cn, toPusherKey } from "@/lib/utils";
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
    <div id="messages" className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === props.sessionId;

        const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div className="chat-message" key={`${message.id}-${message.timestamp}`}>
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn("flex flex-col space-y-2 text-base max-w-xs mx-2", {
                  "order-1 items-end": isCurrentUser,
                  "order-2 items-start": !isCurrentUser,
                })}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none": !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none": !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text} <span className="ml-2 text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image fill src={isCurrentUser ? (props.sessionImg as string) : props.chatPartner.image} alt="Profile picture" referrerPolicy="no-referrer" className="rounded-full" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
