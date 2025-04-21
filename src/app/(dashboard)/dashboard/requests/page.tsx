import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Request() {
  const session = await getServerSession(authOptions);
  console.log("session in requests pages", session);
  if (!session) notFound();

  if (!session || !session.user.id) {
    return <div>Your session has expired. Please log in again.</div>;
  }
  // Corrected template literals
  const incomingFriendsIds = (await fetchRedis("smembers", `user:${session.user.id}:incoming_friend_requests`)) as string[];

  console.log("incomingFriendsIds in request", incomingFriendsIds);

  const getEmail = await Promise.all(
    incomingFriendsIds.map(async (incomingId) => {
      const sender = (await fetchRedis("get", `user:${incomingId}`)) as string | null;
      if (!sender) {
        await fetchRedis("srem", `user:${session.user.id}:incoming_friend_requests`, incomingId);
        return null; // skip this one
      }
      console.log("sender", sender);

      // Parse the sender string into an object
      const senderParsed = JSON.parse(sender) as User;

      console.log("senderParsed", senderParsed);

      return {
        senderId: incomingId,
        senderEmail: senderParsed.email,
        senderImage: senderParsed.image,
      };
    })
  );

  const filtered = getEmail.filter((item): item is { senderId: string; senderEmail: string; senderImage: string } => item !== null);

  return (
    <main className="ml-4">
      <h1 className="font-bold text-3xl mb-8">Add Friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests incomingFriendRequests={filtered} sessionId={session.user.id} />
      </div>
    </main>
  );
}
