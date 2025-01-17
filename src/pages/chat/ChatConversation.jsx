'use client'

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Camera, Send, Smile } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import StickerIcon from '@/icons/StickerIcon'
import SendIcon from '@/icons/SendIcon'
import { io } from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:3000')
const mockMessages = [
  {
    id: '1',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'user1',
    timestamp: new Date('2024-01-09T20:15:00'),
  },
  {
    id: '2',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'current-user',
    timestamp: new Date('2024-01-09T20:16:00'),
  },
  {
    id: '3',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'current-user',
    timestamp: new Date('2024-01-09T20:17:00'),
  },
  {
    id: '4',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'user1',
    timestamp: new Date('2024-01-09T20:18:00'),
  },
  {
    id: '5',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'user1',
    timestamp: new Date('2024-01-09T20:19:00'),
  },
  {
    id: '6',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'current-user',
    timestamp: new Date('2024-01-09T20:20:00'),
  },
  {
    id: '11',
    content: 'Potter ipsum wand elf parchment wingardium. Emporium spells not side or.',
    senderId: 'user1',
    timestamp: new Date('2024-01-09T20:15:00'),
  }]

export default function ChatConversation() {
  const stickerRef = useRef(null);
  const navigate = useNavigate()
  const { recipientId } = useParams()
  const [chat, setChat] = useState('')
  const [chats, setChats] = useState([])
  const [recipient , setRecipient] = useState({})
  const scrollAreaRef = useRef(null)
  const bottomRef = useRef(null)

  // In a real app, fetch this from your backend
  const authUser = JSON.parse(localStorage.getItem('user'));

  const chatUser = {
    id: authUser._id,
    name: authUser.name,
    role: 'User',
    isOnline: true,
  }

  const response =  axios.get(`http://localhost:3000/api/v1/user/${recipientId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Set the Authorization header
    },
  })
  .then((res) => setRecipient(res.data))
  .catch((error) => console.log(error));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats])

  useEffect(() => {
    if (socket && chatUser) {
      socket.emit('load messages', {
        sender_id: chatUser.id,
        recipient_id: recipient._id,
      });

        socket.on('chat history', (messages) => {
            setChats(messages);
        });

      return () => {
        socket.off('chat history');
      };
    }
  }, [socket , chatUser]);

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (chat.trim()) {
      socket.emit('chat message', {
        sender: chatUser.id,
        recipient: recipient._id,
        content: chat,
      });
      setChat('');
    }
  };

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto bg-white`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback></AvatarFallback>
            </Avatar>
            {chatUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{chatUser.name}</h2>
            <p className="text-sm text-muted-foreground">{chatUser.role}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="flex flex-col p-4 min-h-full">
          {chats.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender === authUser._id ? 'justify-end' : 'justify-start'
                } mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.sender === authUser._id
                    ? 'bg-black text-white'
                    : 'bg-gray-100'
                  }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <>
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Camera className="h-6 w-6" />
            </Button>
            <Input
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Message..."
              className="rounded-full"
            />
            <Button type="button" variant="none" size="icon" className="rounded-full bg-none">
              <StickerIcon
                width="100"
                height="100"
                onClick={() => {
                  stickerRef.current?.click();
                }}
              />
            </Button>
            <Button type="submit" size="icon" variant="none" className="rounded-full hover:bg-none">
              <SendIcon />
            </Button>
          </div>
        </form>
      </>
    </div>
  )
}

