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
  params: { chatId: string };
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
  const { chatId } = await props.params;

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
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-ceter space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image fill referrerPolicy="no-referrer" alt={`${chatsPartner.name}`} src={chatsPartner.image} className="rounded-full" />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">{chatsPartner.name}</span>
            </div>
            <span className="text-sm text-gray-600">{chatsPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages initialMessages={initialMessages} sessionId={session.user.id} chatPartner={chatsPartner} sessionImg={session.user.image} chatId={chatId} />
      <ChatInput chatsPartner={chatsPartner} chatId={chatId} />
    </div>
  );
}
