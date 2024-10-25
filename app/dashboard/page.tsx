import { Footer } from "../components/footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="max-w-[75rem] w-full mx-auto">
        <SidebarTrigger />
        <div className="grid grid-cols-[1fr_20.5rem] gap-10 pb-10">
          <div>
            <header className="flex items-center justify-between w-full h-16 gap-4">
              <div className="flex items-center gap-2">
              
              
              </div>
            </header>
          </div>
        </div>
      </main>
    
    </SidebarProvider>
  );
}

