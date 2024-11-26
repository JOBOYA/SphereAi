import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  timestamp?: string
}

export const ChatMessage = ({ content, role, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      role === 'assistant' ? 'bg-gray-50 dark:bg-gray-900' : ''
    )}>
      <Avatar className={cn(
        "w-8 h-8",
        role === 'assistant' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-800'
      )}>
        {role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </Avatar>
      
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          {content}
        </div>
        {timestamp && (
          <span className="text-xs text-gray-500 mt-2 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
} 