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
  Network,
  ChevronDown,
  History,
} from "lucide-react";
import { SketchLogo } from "@phosphor-icons/react";

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

// Ensuite le reste du code avec data et les autres définitions
const data = {
  navMain: [
    {
      title: "Models",
      url: "#",
      icon: Bot,
      color: "blue",
      items: [
        {
          title: "Chat",
          url: "/dashboard",
          icon: MessageSquare,
          description: "Discutez avec l'IA",
        },
        {
          title: "Voice",
          url: "/transcription",
          icon: Mic,
          description: "Transcription vocale",
        },
        {
          title: "Mindmap",
          url: "/mindmap",
          icon: Network,
          description: "Visualisation des idées",
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      color: "purple",
      items: [
        {
          title: "General",
          url: "#",
          icon: Settings,
          description: "Paramètres généraux",
        },
        {
          title: "Upgrade Plan",
          url: "/dashboard/upgrade",
          icon: SketchLogo,
          description: "Passez à la version Pro",
          isPro: true,
        },
        {
          title: "Team",
          url: "#",
          icon: User,
          description: "Gestion d'équipe",
        },
        {
          title: "Billing",
          url: "#",
          icon: Code2,
          description: "Facturation",
        },
        {
          title: "Limits",
          url: "/dashboard/limits",
          icon: PieChart,
          description: "Quotas et limites",
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
  type?: 'chat' | 'transcription';
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['Models', 'Settings', 'Recent']);

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

  const handleConversationClick = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    
    // Vérifier le type de conversation
    if (conv.messages[0]?.content.includes('[Transcription]')) {
      router.push(`/transcription/${conv.conversation_id}`);
    } else if (conv.messages[0]?.content.includes('[Mindmap]')) {
      router.push(`/mindmap/${conv.conversation_id}`);
    } else {
      router.push(`/chat/${conv.conversation_id}`);
    }
  };

  // Fonction pour gérer le pliage/dépliage
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  // Ajouter une fonction pour vérifier si un item est actif
  const isItemActive = (item: any) => {
    return pathname === item.url || 
           (item.url === '/dashboard' && pathname.startsWith('/chat')) ||
           (item.url.includes('settings') && pathname.includes('settings')) ||
           (item.url.includes('limits') && pathname.includes('limits'));
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 backdrop-blur-sm" 
      {...props}
    >
      <SidebarHeader className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse blur-xl opacity-50" />
            <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sphere AI
            </span>
            <span className="text-xs text-gray-500">Intelligence Artificielle</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {data.navMain.map((section) => (
          <div key={section.title} className="mb-3">
            <button
              onClick={() => toggleSection(section.title)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5",
                "hover:bg-gray-50/80 transition-colors duration-200",
                expandedSections.includes(section.title) && "bg-gray-50/50"
              )}
            >
              <div className="flex items-center">
                <section.icon className={`h-4 w-4 mr-2 text-${section.color}-500`} />
                <span className="text-sm font-semibold text-gray-600">{section.title}</span>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform duration-200",
                  expandedSections.includes(section.title) ? "transform rotate-180" : ""
                )} 
              />
            </button>

            <div className={cn(
              "space-y-0.5 overflow-hidden transition-all duration-200 relative",
              expandedSections.includes(section.title) 
                ? "max-h-[500px] opacity-100 mt-1" 
                : "max-h-0 opacity-0"
            )}>
              <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-200"></div>
              {section.items.map((item, index) => (
                <div key={item.title} className="relative">
                  <Link
                    href={item.url}
                    className={cn(
                      "group relative flex flex-col py-2 px-3 rounded-lg ml-4",
                      "hover:bg-gray-50/80 hover:backdrop-blur-sm",
                      "z-10",
                      item.isPro 
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100/50" 
                        : isItemActive(item) ? `bg-${section.color}-50 shadow-sm` : "transparent",
                      "border border-transparent",
                      item.isPro 
                        ? "hover:border-purple-200/50" 
                        : isItemActive(item) ? `border-${section.color}-100` : "hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={cn(
                          "flex items-center justify-center h-6 w-6 rounded-lg mr-2",
                          item.isPro 
                            ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                            : isItemActive(item) ? `bg-${section.color}-100/50` : "bg-gray-100/50",
                          "group-hover:shadow-sm transition-all duration-200"
                        )}>
                          <item.icon className={cn(
                            "h-3 w-3",
                            item.isPro 
                              ? "text-white" 
                              : isItemActive(item) ? `text-${section.color}-500` : "text-gray-500",
                            "group-hover:scale-110 transition-all duration-200"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-medium leading-none mb-0.5",
                            item.isPro 
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" 
                              : isItemActive(item) ? `text-${section.color}-700` : "text-gray-700"
                          )}>
                            {item.title}
                          </span>
                          <span className="text-[11px] text-gray-500 group-hover:text-gray-600">
                            {item.description}
                          </span>
                        </div>
                      </div>
                      {item.isPro && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          PRO
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <button
            onClick={() => toggleSection('Recent')}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5",
              "hover:bg-gray-50/80 transition-colors duration-200",
              expandedSections.includes('Recent') && "bg-gray-50/50"
            )}
          >
            <div className="flex items-center">
              <History className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">Recent Chats</span>
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform duration-200",
                expandedSections.includes('Recent') ? "transform rotate-180" : ""
              )} 
            />
          </button>

          <div className={cn(
            "space-y-0.5 overflow-hidden transition-all duration-200",
            expandedSections.includes('Recent') 
              ? "max-h-[400px] opacity-100 mt-1" 
              : "max-h-0 opacity-0"
          )}>
            <div className="relative">
              <div className="absolute left-2 -top-1 bottom-0 w-px bg-gray-200"></div>
              {conversations.map((conv) => {
                const firstMessage = conv.messages[0]?.content || 'Nouvelle conversation';
                const isTranscription = firstMessage.includes('[Transcription]');
                const isMindmap = firstMessage.includes('[Mindmap]');
                const shortTitle = isTranscription 
                  ? 'Transcription vocale'
                  : isMindmap
                  ? 'Mindmap: ' + firstMessage.replace('[Mindmap]', '').slice(0, 30)
                  : firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
                const isTyping = typingConversation === conv.conversation_id;
                
                return (
                  <div
                    key={conv.conversation_id}
                    className="relative group"
                  >
                    <Link
                      href="#"
                      onClick={(e) => handleConversationClick(e, conv)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-2 text-gray-600 ml-4",
                        "border border-transparent hover:border-gray-200",
                        "hover:shadow-sm hover:text-gray-900",
                        "relative z-10",
                        pathname === `/chat/${conv.conversation_id}` && "bg-blue-50 border-blue-200 text-blue-700",
                        pathname === `/transcription/${conv.conversation_id}` && "bg-purple-50 border-purple-200 text-purple-700",
                        pathname === `/mindmap/${conv.conversation_id}` && "bg-green-50 border-green-200 text-green-700"
                      )}
                    >
                      {isTranscription ? (
                        <Mic className="h-4 w-4 text-purple-500" />
                      ) : isMindmap ? (
                        <Network className="h-4 w-4 text-green-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="truncate font-medium">
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
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity p-1.5 hover:bg-red-50 rounded-lg z-20"
                      )}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full p-4">
          {user && (
            <>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </span>
                <span className="text-xs text-gray-500">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-10 w-10 rounded-xl shadow-md border-2 border-white",
                  },
                }}
              />
            </>
          )}
        </div>
      </SidebarFooter>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>

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
