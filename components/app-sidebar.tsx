"use client";

import * as React from "react";
import {
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  MessageSquare,
  Settings,
  Code2,
  User,
  Trash2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Sample data
const data = {


  navMain: [
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Chat",
          url: "/dashboard",
        }
      ],
    },

    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "/dashboard/limits",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

interface Conversation {
  conversation_id: string;
  created_at: string;
  messages: {
    content: string;
    is_user_message: boolean;
    timestamp: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const pathname = usePathname();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);

  // Récupérer les conversations au chargement
  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault(); // Empêcher la navigation
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`https://appai.charlesagostinelli.com/api/delete-conversation/${conversationToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        // Mettre à jour la liste des conversations
        setConversations(conversations.filter(
          conv => conv.conversation_id !== conversationToDelete
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        Sphere AI
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <div className="mt-6">
          <h3 className="mb-2 px-4 text-sm font-semibold text-gray-500">Historique</h3>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {conversations.map((conv) => {
              const firstMessage = conv.messages[0]?.content || 'Nouvelle conversation';
              const shortTitle = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
              
              return (
                <div
                  key={conv.conversation_id}
                  className="group relative"
                >
                  <Link
                    href={`/chat/${conv.conversation_id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 text-sm pr-10",
                      pathname === `/chat/${conv.conversation_id}` && "bg-gray-100 text-gray-900"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{shortTitle}</span>
                  </Link>
                  <button
                    onClick={(e) => handleDeleteClick(e, conv.conversation_id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-end w-full p-4 space-x-2">
          {user && (
            <>
              <span className="text-xs text-gray-600">
                {user.primaryEmailAddress?.emailAddress}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8 rounded-lg",
                  },
                }}
              />
            </>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
