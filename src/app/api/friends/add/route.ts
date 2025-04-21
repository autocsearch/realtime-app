import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { formSchema } from "@/schema/form-schemas";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = formSchema.parse(body);

    const idToAdd = (await fetchRedis("get", `user:email:${emailToAdd}`)) as string | null;

    if (!idToAdd) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response(JSON.stringify({ message: "You cannot add yourself" }), { status: 400 });
    }

    //check if the user already added

    const isAlreadyAdded = (await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response(JSON.stringify({ message: "Already added" }), { status: 400 });
    }

    //check if the friend already Friends
    const isAlreadyFriend = (await fetchRedis("sismember", `user:${session.user.id}:friend`, idToAdd)) as 0 | 1;

    if (isAlreadyFriend) {
      return new Response(JSON.stringify({ message: "Already friends" }), { status: 400 });
    }

    // valid request, sent friend request
    pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`), "incoming_friend_requests", {
      senderId: session.user.id,
      senderEmail: session.user.email,
      senderImage: session.user.image,
    });

    // friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: "Invalid request data" }), { status: 422 });
    }
    if (error instanceof Error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
