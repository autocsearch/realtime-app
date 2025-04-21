"use client";

import { Check, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface friendRequestProps {
  incomingFriendRequests: incomingFriendRequest[];
  sessionId: string;
}

export default function FriendRequests({ incomingFriendRequests, sessionId }: friendRequestProps) {
  const [friendRequest, setFriendRequest] = useState<incomingFriendRequest[]>(incomingFriendRequests);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

    //
    const friendRequestHandler = ({ senderId, senderEmail, senderImage }: incomingFriendRequest) => {
      setFriendRequest((prev) => [...prev, { senderId, senderEmail, senderImage }]);
    };

    pusherClient.bind("incoming_friend_requests", (data: incomingFriendRequest) => {
      setFriendRequest((prev) => {
        const alreadyExists = prev.some((req) => req.senderId === data.senderId);
        if (alreadyExists) return prev;
        return [...prev, data];
      });
    });

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  const router = useRouter();

  const acceptFriendRequest = async (senderId: string) => {
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: senderId }),
      });

      const resData = await response.json();

      if (response.ok) {
        setFriendRequest((prev) => prev.filter((request) => request.senderId !== senderId));
        toast.success(resData.message || "Friend request accepted successfully!");
      } else {
        toast.error("failed to accept friend request");
      }

      router.refresh();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("an error occured");
    }
  };

  const denyFriendRequest = async (senderId: string) => {
    try {
      const response = await fetch("/api/friends/deny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: senderId }),
      });

      const resData = await response.json();

      if (response.ok) {
        setFriendRequest((prev) => prev.filter((request) => request.senderId !== senderId));
        toast.success(resData.message || "Friend request denied!");
      } else {
        toast.error(resData.message || "Something went wrong.");
      }

      router.refresh();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request.");
    }
  };

  return (
    <>
      {friendRequest.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-gray-800">No Friend Requests</h1>
          <p className="text-gray-600">You have no incoming friend requests.</p>
        </div>
      ) : (
        friendRequest.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            {request.senderImage ? <Image src={request.senderImage} alt="user-profile" width={32} height={32} className="rounded-full" /> : <UserPlus className="text-black w-8 h-8" />}

            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button onClick={() => acceptFriendRequest(request.senderId)} aria-label="accept-friend" className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md">
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button onClick={() => denyFriendRequest(request.senderId)} aria-label="deny friend" className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md">
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
}
