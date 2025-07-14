"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, CornerDownLeft, Mic, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WebMessage {
  id: string;
  text: string;
  sender: string; // 'user' or 'agent'
  timestamp: string;
}

interface Message extends WebMessage {
  isUser: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const { data: user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const localStorageKey = `chat_history_${user?.id}_${selectedAgent}`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(localStorageKey)
    console.log("Chat cleared and localStorage removed.")
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from localStorage on component mount or agent change
  useEffect(() => {
    console.log("useEffect [selectedAgent, user?.id] triggered for loading messages.")
    if (user?.id && selectedAgent) {
      const storedMessages = localStorage.getItem(localStorageKey)
      console.log(`Loading messages for key: ${localStorageKey}`)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
        console.log("Messages loaded from localStorage:", JSON.parse(storedMessages))
      } else {
        setMessages([])
        console.log("No messages found in localStorage, setting to empty array.")
      }
    } else {
      console.log("User ID or selected agent not available for loading messages.", { userId: user?.id, selectedAgent })
    }
  }, [selectedAgent, user?.id, localStorageKey])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    console.log("useEffect [messages, selectedAgent, user?.id] triggered for saving messages.")
    if (user?.id && selectedAgent) {
      console.log(`Saving messages to key: ${localStorageKey}`)
      localStorage.setItem(localStorageKey, JSON.stringify(messages))
      console.log("Messages saved to localStorage:", messages)
    } else {
      console.log("User ID or selected agent not available for saving messages.", { userId: user?.id, selectedAgent })
    }
  }, [messages, selectedAgent, user?.id, localStorageKey])

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.id) return; // Only fetch if user ID is available

      try {
        // Assuming the API endpoint can filter agents by user ID
        const response = await fetch(`/api/agents?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setAgents(data);
        } else {
          console.error("Failed to fetch agents:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, [user?.id]); // Re-run when user ID changes

  const handleSend = async () => {
    console.log("handleSend called.")
    if (input.trim() === "" || !selectedAgent || !user?.id) {
      console.log("handleSend: Pre-conditions not met.", { input: input.trim(), selectedAgent, userId: user?.id })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(), // Simple unique ID
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
      isUser: true,
    }

    console.log("Adding user message:", userMessage)
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsAgentTyping(true) // Agente começa a "digitar"

    try {
      const response = await fetch(`/api/agent/conversations/${selectedAgent}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        console.error("Error sending message to agent:", response.statusText)
        // Optionally, revert UI message if sending fails
        setMessages((prevMessages) => {
          const filtered = prevMessages.filter((msg) => msg.id !== userMessage.id)
          console.log("API error: Removing user message. New messages state:", filtered)
          return filtered
        })
        setIsAgentTyping(false) // Parar de "digitar" em caso de erro
        return
      }

      const agentWebMessage: WebMessage = await response.json()
      const agentMessage: Message = {
        ...agentWebMessage,
        isUser: false,
      }

      // Simular streaming da mensagem do agente
      let streamedText = ""
      const words = agentMessage.text.split(" ")
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)) // Pequeno atraso
        streamedText += (i > 0 ? " " : "") + words[i]
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1]
          if (lastMessage && !lastMessage.isUser) {
            // Atualiza a última mensagem do agente
            return prevMessages.map((msg, index) =>
              index === prevMessages.length - 1 ? { ...msg, text: streamedText } : msg
            )
          } else {
            // Adiciona uma nova mensagem se a última não for do agente
            return [...prevMessages, { ...agentMessage, text: streamedText }]
          }
        })
      }

      setIsAgentTyping(false) // Agente para de "digitar"
      console.log("Agent message streamed and added:", agentMessage)
    } catch (error) {
      console.error("Error calling agent API:", error)
      setMessages((prevMessages) => {
        const filtered = prevMessages.filter((msg) => msg.id !== userMessage.id)
        console.log("Catch block error: Removing user message. New messages state:", filtered)
        return filtered
      })
      setIsAgentTyping(false) // Parar de "digitar" em caso de erro
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat</CardTitle>
          <Select onValueChange={setSelectedAgent} value={selectedAgent || ""}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um agente" />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearChat} disabled={messages.length === 0}>
            Limpar Conversa
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.isUser ? "justify-end" : ""}`}>
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.text}
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {isAgentTyping && (
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-lg px-4 py-2 max-w-xs lg:max-w-md bg-muted animate-pulse">
                Digitando...
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-background">
          <div className="relative flex items-center">
            <Textarea
              placeholder="Envie uma mensagem..."
              className="min-h-[48px] max-h-[200px] pr-12 resize-none overflow-hidden bg-background shadow-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleSend}
              disabled={!selectedAgent || !user?.id || input.trim() === ""}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar mensagem</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
