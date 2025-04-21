import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);

    return new Response(JSON.stringify({ message: "Friend request denied" }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: "Invalid payload " }), { status: 422 });
    }
    console.error(JSON.stringify({ message: "Error in POST request:" }), error);
    return new Response(JSON.stringify({ messsage: "Invalid request" }), { status: 400 });
  }
}
