import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/SidebarApp";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex h-screen">
        <SidebarTrigger />
        <aside className="max-h-screen container py-16 md:py-12 w-full">{children}</aside>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
