"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface friendRequestProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

export default function FriendRequest({ sessionId, initialUnseenRequestCount }: friendRequestProps) {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(initialUnseenRequestCount);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

    //
    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  return (
    <Link href="/dashboard/requests" className="flex items-center gap-x-3 h-8 justify-start mx-2 ">
      <span className="border-black text-black h-6 w-6 flex shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
        <User className="h-5 w-5" />
      </span>

      <span className="text-sm font-medium">Friend Request</span>

      {unseenRequestCount > 0 && <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">{unseenRequestCount}</span>}
    </Link>
  );
}
