"use client";

import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notification-store";

interface FriendRequestsClientProps {
  incomingFriendRequests: {
    senderId: string;
    senderEmail: string;
    senderImage: string;
  }[];
}

export default function FriendRequestsClient({ incomingFriendRequests }: FriendRequestsClientProps) {
  const reset = useNotificationStore((state) => state.reset);
  const decrement = useNotificationStore((state) => state.decrement);

  useEffect(() => {
    reset();
  }, [reset]);

  const handleAcceptFriend = async (senderId: string) => {
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: senderId }),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(resData.message || "Friend request accepted successfully!");
      } else {
        toast.error(resData.message || "Something went wrong.");
      }

      decrement();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {incomingFriendRequests.length === 0 ? (
        <p className="text-sm text-gray-500">No pending friend requests.</p>
      ) : (
        incomingFriendRequests.map((request) => (
          <div key={request.senderId} className="flex items-center gap-3">
            <Image src={request.senderImage} alt={`${request.senderEmail}'s profile picture`} width={32} height={32} className="rounded-full" />
            <span className="text-sm font-medium">{request.senderEmail}</span>
            <button onClick={() => handleAcceptFriend(request.senderId)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              Accept
            </button>
          </div>
        ))
      )}
    </div>
  );
}
