import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const response = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(response);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // Check if the user is already add

    const isAlreadyFriend = await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd);

    if (isAlreadyFriend) {
      return new Response(JSON.stringify({ message: "Already friends" }), { status: 400 });
    }

    // accept the friends request

    const hasFriendRequest = await fetchRedis("sismember", `user:${session.user.id}:incoming_friend_requests`, idToAdd);

    if (!hasFriendRequest) {
      return new Response(JSON.stringify({ message: "No friend request" }), { status: 400 });
    }

    await db.sadd(`user:${session.user.id}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return new Response(JSON.stringify({ message: "Friend request accepted" }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: "Invalid payload " }), { status: 422 });
    }
    console.error(JSON.stringify({ message: "Error in POST request:" }), error);
    return new Response(JSON.stringify({ messsage: "Invalid request" }), { status: 400 });
  }
}
