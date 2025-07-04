import { fetchRedis } from "@/helpers/redis";
import getFriendsByUserId from "@/helpers/show-friend-on-sidebar";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const friend = await getFriendsByUserId(session.user.id);

  const lastMessage = await Promise.all(
    friend.map(async (friends) => {
      const [lastMessagesRaw] = (await fetchRedis("zrange", `chat:${chatHrefConstructor(session.user.id, friends.id)}:messages`, -1, -1)) as string[];

      const lastMessages = JSON.parse(lastMessagesRaw) as Message;

      return {
        ...friends,
        lastMessages,
      };
    })
  );

  return (
    <main className="container max-w-4xl py-12 px-4">
      <h1 className="text-3xl md:text-5xl font-bold mb-10 text-indigo-900">Recent Chats</h1>

      {lastMessage.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">Nothing to show here yet...</p>
      ) : (
        <div className="space-y-4">
          {lastMessage.map((friends) => (
            <Card key={friends.id} className="transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer">
              <Link href={`/dashboard/chats/${chatHrefConstructor(session.user.id, friends.id)}`} className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image src={friends.image} alt={`${friends.name} profile picture`} fill className="rounded-full object-cover ring-2 ring-indigo-200" referrerPolicy="no-referrer" />
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-semibold text-gray-900">{friends.name}</h4>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                    <span className="text-gray-400">{friends.lastMessages.senderId === session.user.id ? "You: " : ""}</span>
                    {friends.lastMessages.text}
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
