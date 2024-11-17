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
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);

  // Déplacer fetchConversations en dehors du useEffect pour pouvoir l'appeler ailleurs
  const fetchConversations = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("=== Détails des conversations ===");
        console.log("Toutes les conversations:", data);
        
        if (data.length > 0) {
          const firstConv = data[0];
          console.log("=== Première conversation ===");
          console.log("ID complet:", firstConv.conversation_id);
          console.log("Format de l'ID:", {
            full: firstConv.conversation_id,
            parts: firstConv.conversation_id.split('_'),
            created: firstConv.created_at,
            timestamp: new Date(firstConv.created_at).getTime()
          });
        }

        // Trier les conversations par date de création
        data.sort((a: Conversation, b: Conversation) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        console.log("=== Conversations triées ===");
        console.log("IDs dans l'ordre:", data.map((conv: { conversation_id: any; created_at: any; }) => ({
          id: conv.conversation_id,
          created: conv.created_at
        })));

        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    }
  };

  // useEffect pour le chargement initial
  React.useEffect(() => {
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

      // Debug des informations
      console.log("ID reçu:", conversationToDelete);
      
      // Extraire le numéro d'ID selon le format
      let numericId;
      if (conversationToDelete.includes('_')) {
        // Ancien format: conv_123456_xyz
        numericId = conversationToDelete.split('_')[1];
      } else {
        // Nouveau format: juste le nombre
        numericId = conversationToDelete;
      }

      if (!numericId) {
        console.error("ID numérique non trouvé:", conversationToDelete);
        return;
      }

      console.log("ID numérique à supprimer:", numericId);
      
      // Utiliser l'endpoint delete-conversation avec le nombre
      const url = `https://appai.charlesagostinelli.com/api/delete-conversation/${numericId}/`;
      console.log("URL de suppression:", url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log("Statut de la réponse:", response.status);
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);

      if (response.ok) {
        console.log("Suppression réussie");
        await fetchConversations();

        if (pathname.includes(conversationToDelete)) {
          router.push('/dashboard');
        }
      } else {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || 'Erreur inconnue';
        } catch (e) {
          errorMessage = responseText;
        }
        throw new Error(`Erreur ${response.status}: ${errorMessage}`);
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
              
              const conversationId = conv.conversation_id;
              
              return (
                <div
                  key={conversationId}
                  className="group relative"
                >
                  <Link
                    href={`/chat/${conversationId}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 text-sm pr-10",
                      pathname === `/chat/${conversationId}` && "bg-gray-100 text-gray-900"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{shortTitle}</span>
                  </Link>
                  <button
                    onClick={(e) => handleDeleteClick(e, conversationId)}
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
