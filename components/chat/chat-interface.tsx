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
  const { data: user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const localStorageKey = `chat_history_${user?.id}_${selectedAgent}`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from localStorage on component mount or agent change
  useEffect(() => {
    if (user?.id && selectedAgent) {
      const storedMessages = localStorage.getItem(localStorageKey)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      } else {
        setMessages([])
      }
    }
  }, [selectedAgent, user?.id])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (user?.id && selectedAgent) {
      localStorage.setItem(localStorageKey, JSON.stringify(messages))
    }
  }, [messages, selectedAgent, user?.id])

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
    if (input.trim() === "" || !selectedAgent || !user?.id) return

    const userMessage: Message = {
      id: Date.now().toString(), // Simple unique ID
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
      isUser: true,
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")

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
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== userMessage.id))
        return
      }

      const agentWebMessage: WebMessage = await response.json()
      const agentMessage: Message = {
        ...agentWebMessage,
        isUser: false,
      }

      setMessages((prevMessages) => [...prevMessages, agentMessage])
    } catch (error) {
      console.error("Error calling agent API:", error)
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== userMessage.id))
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
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Textarea
              placeholder="Digite sua mensagem..."
              className="pr-16"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="w-4 h-4" />
              </Button>
              <Button size="icon" onClick={handleSend} disabled={!selectedAgent || !user?.id}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
