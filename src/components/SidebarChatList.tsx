"use client";

import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

export default function SidebarChatList({ friends, sessionId }: SidebarChatListProps) {
  const [unSeenMessages, setUnseenMessages] = useState<Message[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = () => {
      router.refresh();
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify = pathname !== `/dashboard/chats/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      // should be notified
      toast("📨 New Message", {
        description: (
          <Link
            href={`/dashboard/chats/${chatHrefConstructor(sessionId, message.senderId)}`}
            onClick={() => {
              toast.dismiss();
            }}
            className="flex items-center gap-3"
          >
            <Image src={message.senderImg} alt={message.senderName} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" width={100} height={100} />
            <div className="flex flex-col text-black">
              <span className="font-medium">{message.senderName}</span>
              <span className="text-sm text-muted-foreground">{message.text}</span>
            </div>
          </Link>
        ),
      });

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind(`new_message`, chatHandler);
    pusherClient.bind(`new_friend`, newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
    };
  }, [sessionId, pathname, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="-max-h-[25rem] overflow-y-auto -mx-2 mt-2 space-y-1">
      {friends.sort().map((friend) => {
        const unSeenMessagesCount = unSeenMessages.filter((unSeenMsg) => {
          return unSeenMsg.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a href={`/dashboard/chats/${chatHrefConstructor(sessionId, friend.id)}`} className="text-gray-700 hover:text-indigo-600 item-center hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold">
              <Image src={friend.image || "/default-profile.png"} alt={`${friend.name}'s profile`} width={32} height={32} className="rounded-full" />
              {friend.name}
              {unSeenMessagesCount > 0 ? <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">{unSeenMessagesCount}</div> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
