"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, CornerDownLeft, Mic, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { apiClient } from "@/lib/api"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { WebMessage } from "@/lib/types";

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

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialization effect: runs only when the user changes
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return

      // 1. Fetch agents
      let fetchedAgents: any[] = []
      try {
        const response = await fetch(`/api/agents?userId=${user.id}`)
        if (response.ok) {
          fetchedAgents = await response.json()
          setAgents(fetchedAgents)
        } else {
          setAgents([])
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
        setAgents([])
      }

      // 2. Determine and set the initial agent
      const storedSelectedAgent = localStorage.getItem(`selected_agent_${user.id}`)
      if (storedSelectedAgent && fetchedAgents.some(agent => agent.id === storedSelectedAgent)) {
        setSelectedAgent(storedSelectedAgent)
      } else if (fetchedAgents.length > 0) {
        setSelectedAgent(fetchedAgents[0].id)
      }
    }

    initializeChat()
  }, [user?.id])

  // Effect to load messages when the selected agent changes
  useEffect(() => {
    if (user?.id && selectedAgent) {
      const localStorageKey = `chat_history_${user.id}_${selectedAgent}`
      const storedMessages = localStorage.getItem(localStorageKey)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      } else {
        setMessages([]) // Clear messages for the new agent
      }
    } else {
      setMessages([]) // Clear messages if no agent is selected
    }
  }, [selectedAgent, user?.id])

  // Effect to save the selected agent to localStorage
  useEffect(() => {
    if (user?.id && selectedAgent) {
      localStorage.setItem(`selected_agent_${user.id}`, selectedAgent)
    }
  }, [selectedAgent, user?.id])

  // Effect to save messages to localStorage
  useEffect(() => {
    if (user?.id && selectedAgent) {
      const localStorageKey = `chat_history_${user.id}_${selectedAgent}`
      // Avoid saving empty initial state
      if (messages.length > 0) {
        localStorage.setItem(localStorageKey, JSON.stringify(messages))
      }
    }
  }, [messages, selectedAgent, user?.id])

  const handleClearChat = () => {
    if (user?.id && selectedAgent) {
      const localStorageKey = `chat_history_${user.id}_${selectedAgent}`
      setMessages([])
      localStorage.removeItem(localStorageKey)
    }
  }

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
      const agentWebMessage = await apiClient.sendMessage(selectedAgent, {
        message: userMessage.text,
        userId: user.id,
      })

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
      console.error("Error sending message to agent:", error)
      // Optionally, revert UI message if sending fails
      setMessages((prevMessages) => {
        const filtered = prevMessages.filter((msg) => msg.id !== userMessage.id)
        console.log("API error: Removing user message. New messages state:", filtered)
        return filtered
      })
      setIsAgentTyping(false) // Parar de "digitar" em caso de erro
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Chat</h1>
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
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearChat} disabled={messages.length === 0}>
          Limpar Conversa
        </Button>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${message.isUser ? "justify-end" : ""}`}>
            {!message.isUser && (
              <Avatar className="w-8 h-8">
                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`flex flex-col gap-1 ${message.isUser ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl p-3 text-sm ${
                  message.isUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
            {message.isUser && (
              <Avatar className="w-8 h-8">
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isAgentTyping && (
          <div className="flex items-start gap-4">
            <Avatar className="w-8 h-8">
              <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="rounded-2xl p-3 text-sm bg-muted rounded-bl-none animate-pulse">
              Digitando...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="relative">
          <Textarea
            placeholder="Digite sua mensagem..."
            className="min-h-[48px] rounded-2xl resize-none p-3 pr-16"
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
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full"
            disabled={!selectedAgent || !user?.id || input.trim() === ""}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
