'use client';

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera, Send, Smile } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import StickerIcon from '@/icons/StickerIcon';
import SendIcon from '@/icons/SendIcon';
import { io } from 'socket.io-client';
import axios from 'axios';
import { isImageFile } from '@/lib/utils';
import { StickerPicker } from '@/components/ui/sticker-picker';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
const socket = io(`${SOCKET_URL}`);

export default function ChatConversation() {
  const stickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { recipientId } = useParams();
  const [chat, setChat] = useState('');
  const [chats, setChats] = useState([]);
  const [recipient, setRecipient] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const scrollAreaRef = useRef(null);
  const bottomRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const authUser = JSON.parse(localStorage.getItem('user'));

  const chatUser = {
    id: authUser._id,
    name: authUser.name,
    role: 'User',
    isOnline: true,
  };

  useEffect(() => {
    if (recipientId) {
      const fetchRecipient = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/user/${recipientId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          setRecipient(response.data);
        } catch (error) {
          console.error('Error fetching recipient:', error);
        }
      };

      fetchRecipient();
    }
  }, [recipientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  useEffect(() => {
    if (socket && chatUser && recipient._id) {
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
  }, [socket, chatUser, recipient._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chat.trim()) {
      socket.emit('chat message', {
        sender: chatUser.id,
        recipient: recipient._id,
        content: chat,
        type: 'text'
      });
      setChat('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await sendImage(file);
    }
  };

  const sendImage = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('sender', chatUser.id);
    formData.append('recipient', recipient._id);

    try {
      const response = await axios.post(`${API_BASE_URL}/messages/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setChats((prevChats) => [...prevChats, response.data]);
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const sendSticker = async (stickerUrl) => {

    try {
      const response = await axios.post(`${API_BASE_URL}/messages/sticker`, {
        sender: chatUser.id,
        recipient: recipient._id,
        content:stickerUrl,
      }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
      });

      setShowStickers(false); 
      setChats((prevChats) => [...prevChats, response.data]);
    } catch (error) {
      console.error("Error sending sticker:", error);
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
              <AvatarFallback>{recipient.name}</AvatarFallback>
            </Avatar>
            {recipient.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{recipient.name}</h2>
            <p className="text-sm text-muted-foreground">{recipient.role}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="flex flex-col p-4 min-h-full">
          {chats.map((message, index) => {
            // Check if the content ends with an image file extension
            const isImage = isImageFile(message.content)
            const isSticker = (message) => message.type === 'sticker';

            return (
              <div
                key={message._id || index}
                className={`flex ${message.sender === authUser._id ? 'justify-end' : 'justify-start'
                  } mb-4`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.sender === authUser._id
                      ? `bg-${isImage ? 'transparent' : 'black'} text-white`
                      : 'bg-gray-100'
                    }`}
                >
                  {isImage ? (
                    <img
                      src={`${BACKEND_URL}/${message.content}`}
                      alt="Sent image"
                      className={`max-w-full h-auto rounded-lg ${message.type === 'sticker' ? 'w-20 h-20 object-contain bg-transparent' : ''}`}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <>
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              <Camera className="h-6 w-6" />
            </Button>
            <Input
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Message..."
              className="rounded-full"
            />
            <Button 
              type="button" 
              variant="none" 
              size="icon" 
              className="rounded-full bg-none" 
              onClick={() => setShowStickers(!showStickers)} >
              <StickerIcon
                width="100"
                height="100"
              />
            </Button>

            {showStickers && (
              <StickerPicker
                onSelectSticker={sendSticker}
                onClose={() => setShowStickers(false)}
              />
            )}

            <Button type="submit" size="icon" variant="none" className="rounded-full hover:bg-none">
              <SendIcon />
            </Button>
          </div>
        </form>
      </>
    </div>
  );
}
