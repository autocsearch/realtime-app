import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { nanoid } from "nanoid";
// import { db } from "@/lib/db";
import { Message, MessageSchema } from "@/schema/message";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    } else if (!text || !chatId) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), { status: 422 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = (await fetchRedis("smembers", `user:${session.user.id}:friends`)) as string[];
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response(JSON.stringify({ message: "you are not friends" }), { status: 403 });
    }

    const rawSender = (await fetchRedis("get", `user:${session.user.id}`)) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = MessageSchema.parse(messageData);

    //notify all connected chat room clients
    pusherServer.trigger(toPusherKey(`chat:${chatId}`), "incoming-message", message);

    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderImg: sender.image,
      senderName: sender.name,
    });

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response(JSON.stringify({ message: "Message sent successfully!" }), { status: 200 });
  } catch (error) {
    console.error(JSON.stringify({ message: "Error in POST request:" }), error);
    return new Response(JSON.stringify({ messsage: "Invalid request" }), { status: 400 });
  }
}
