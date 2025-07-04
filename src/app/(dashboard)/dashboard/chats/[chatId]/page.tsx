import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageArraySchema } from "@/schema/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";

interface chatsProps {
  params: Promise<{ chatId: string }>;
}

async function GetChatMessages(chatId: string) {
  try {
    const result: string[] = await fetchRedis("zrange", `chat:${chatId}:messages`, 0, -1);
    const dbMessages = result.map((message) => JSON.parse(message) as Message);

    const reverseDbMessages = dbMessages.reverse();

    const messages = MessageArraySchema.parse(reverseDbMessages);
    return messages; // This will be an array of messages
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    notFound();
  }
}

export default async function Chats(props: chatsProps) {
  const params = await props.params;
  const { chatId } = params;

  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatsPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatsPartner = (await db.get(`user:${chatsPartnerId}`)) as User;
  const initialMessages = await GetChatMessages(chatId);

  return (
    <div className="flex flex-1 justify-between flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between py-3 px-4  rounded-2xl shadow-sm bg-indigo-50">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image fill referrerPolicy="no-referrer" alt={chatsPartner.name} src={chatsPartner.image} className="rounded-full object-cover ring-2 ring-indigo-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">{chatsPartner.name}</span>
            <span className="text-sm text-gray-500">{chatsPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages initialMessages={initialMessages} sessionId={session.user.id} sessionImg={session.user.image} chatPartner={chatsPartner} chatId={chatId} />
      <ChatInput chatsPartner={chatsPartner} chatId={chatId} />
    </div>
  );
}
