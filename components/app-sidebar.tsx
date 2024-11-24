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
  Mic,
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
import { chatService } from '@/app/services/chat-service';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

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
          icon: MessageSquare,
        },
        {
          title: "Voice",
          url: "/transcription",
          icon: Mic,
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
          icon: Settings,
        },
        {
          title: "Team",
          url: "#",
          icon: User,
        },
        {
          title: "Billing",
          url: "#",
          icon: Code2,
        },
        {
          title: "Limits",
          url: "/dashboard/limits",
          icon: PieChart,
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
  const { accessToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState<string | null>(null);
  const [typingConversation, setTypingConversation] = useState<string | null>(null);

  // Utiliser le service chat pour récupérer les conversations
  const fetchConversations = async () => {
    try {
      if (!accessToken) {
        console.log('❌ Pas de token disponible');
        return;
      }

      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`;

      const data = await chatService.fetchConversations(formattedToken);
      console.log("=== Détails des conversations ===");
      console.log("Toutes les conversations:", data);
      
      if (data.length > 0) {
        const firstConv = data[0];
        console.log("=== Première conversation ===");
        console.log("ID complet:", firstConv.conversation_id);
      }

      // Trier les conversations par date de création
      data.sort((a: Conversation, b: Conversation) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setConversations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    }
  };

  // Charger les conversations quand le token change
  React.useEffect(() => {
    if (accessToken) {
      fetchConversations();
    }
  }, [accessToken]);

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault(); // Empêcher la navigation
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete || !accessToken) return;

    try {
      console.log("🗑️ Suppression conversation:", conversationToDelete);
      
      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`;

      const response = await fetch(
        `https://appai.charlesagostinelli.com/api/delete-conversation/${conversationToDelete}/`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': formattedToken
          }
        }
      );

      console.log("📥 Statut suppression:", response.status);

      if (response.ok) {
        console.log("✅ Suppression réussie");
        // Recharger les conversations
        await fetchConversations();

        // Rediriger si on est sur la conversation supprimée
        if (pathname.includes(conversationToDelete)) {
          router.push('/dashboard');
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur suppression:", errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('🚨 Erreur lors de la suppression:', error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Fonction pour mettre à jour les conversations
  const updateConversations = async (conversationId: string) => {
    setTypingConversation(conversationId);
    try {
      await fetchConversations();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Effet de typing
    } finally {
      setTypingConversation(null);
    }
  };

  // Exposer la fonction via un ref pour qu'elle soit accessible depuis AIChat
  useEffect(() => {
    if (window) {
      (window as any).sidebarRef = {
        updateConversations
      };
    }
  }, []);

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
              const isTyping = typingConversation === conv.conversation_id;
              
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
                    <span className="truncate">
                      {isTyping ? (
                        <span className="inline-flex">
                          {shortTitle.split('').map((char, index) => (
                            <span
                              key={index}
                              className="animate-fade-in"
                              style={{
                                animationDelay: `${index * 50}ms`,
                                opacity: 0
                              }}
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                      ) : (
                        shortTitle
                      )}
                    </span>
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

// Ajouter cette animation dans votre fichier CSS global
const styles = `
  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(2px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
`;

// Ajouter les styles au document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
