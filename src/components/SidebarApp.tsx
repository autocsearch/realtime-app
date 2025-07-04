import { Icon, Icons } from "@/components/Icons";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import FriendsRequest from "@/components/FriendsRequestSidebar";
import { fetchRedis } from "@/helpers/redis";
import getFriendsByUserId from "@/helpers/show-friend-on-sidebar";
import SidebarChatList from "@/components/SidebarChatList";
import { redirect } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import SidebarUserAvatar from "./SidebarUserAvatar";
import Image from "next/image";

interface sidebarOption {
  id: number;
  name: string;
  icon: Icon;
  href: string;
}

const sidebarOptions: sidebarOption[] = [
  {
    id: 1,
    name: "add friend",
    href: "/dashboard/add",
    icon: "UserPlus",
  },
];

export default async function SidebarApp() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const friends = await getFriendsByUserId(session.user.id);

  const unSeenRequestCount = ((await fetchRedis("smembers", `user:${session.user.id}:incoming_friend_requests`)) as User[]).length;

  return (
    <Sidebar>
      <>
        <SidebarHeader>
          <div className="flex space-x-18">
            <Link href="/dashboard" className="flex h-16 shrink-0 items-center border-b-3">
              <Image src="/Owl.svg" width={40} height={40} alt="Logo" />
              <h1 className="text-2xl">NestChat</h1>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex h-full w-full max-w-xs grow flex-col gap-y-5">
          <div className="text-xs font-semibold text-muted-foreground tracking-widest px-2 pt-6 uppercase border-b-2 w-fit justify-center flex translate-x-5">Overview</div>

          <SidebarGroup className="flex flex-1 flex-col space-y-4">
            {friends.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-600">Your Chats</div>
                <SidebarChatList sessionId={session.user.id} friends={friends} />
              </>
            )}

            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              <div>
                <SidebarMenu role="list">
                  {sidebarOptions.map((option) => {
                    const Icon = Icons[option.icon];
                    return (
                      <SidebarMenuItem key={option.id}>
                        <SidebarMenuButton asChild className="hover:bg-slate-300 rounded-lg hover:shadow-lg">
                          <Link href={option.href}>
                            <span className="border-black text-black h-6 w-6 flex shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-sm font-medium">{option.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  <li className="hover:bg-slate-300 rounded-lg hover:shadow-2xl">
                    <FriendsRequest sessionId={session.user.id} initialUnseenRequestCount={unSeenRequestCount} />
                  </li>
                </SidebarMenu>
              </div>
            </ul>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t-2">
          <SidebarUserAvatar session={session} />
        </SidebarFooter>
      </>
    </Sidebar>
  );
}
