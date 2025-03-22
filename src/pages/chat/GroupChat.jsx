import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera } from 'lucide-react';
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
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(`${SOCKET_URL}`);

export default function GroupChat() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [chat, setChat] = useState('');
  const [chats, setChats] = useState([]);
  const [group, setGroup] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const scrollAreaRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const authUser = JSON.parse(localStorage.getItem('user'));

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Scroll to bottom on initial load and when chats change
  useEffect(() => {
    scrollToBottom();
  }, [chats]); // Trigger when `chats` changes

  useEffect(() => {
    if (groupId) {
      axios.get(`${API_BASE_URL}/groups/details/${groupId}`)
        .then((res) => {
          setGroup(res.data.data.group);
        })
        .catch((error) => console.error("Error fetching group details:", error));
    }
  }, [groupId]);

  useEffect(() => {
    if (socket && groupId) {
      socket.emit('join group', { groupId });
      socket.emit('load group messages', { groupId });

      socket.on('group chat history', (messages) => {
        console.log('Received group chat history:', messages);
        setChats(messages); // Assuming messages are in chronological order
      });

      socket.on('group message', (message) => {
        console.log('Received new group message:', message);
        setChats((prevChats) => [...prevChats, message]);
      });

      return () => {
        socket.emit('leave group', { groupId });
        socket.off('group chat history');
        socket.off('group message');
      };
    }
  }, [socket, groupId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chat.trim()) {
      socket.emit('group message', {
        sender: authUser._id,
        groupId: groupId,
        content: chat,
        type: 'text',
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
    formData.append('sender', authUser._id);
    formData.append('groupId', groupId);

    try {
      const response = await axios.post(`${API_BASE_URL}/groups/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setChats((prevChats) => [...prevChats, response.data.data]);
    } catch (error) {
      console.error('Error sending image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const sendSticker = async (stickerUrl) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/sticker`, {
        sender: authUser._id,
        groupId: groupId,
        content: stickerUrl,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setShowStickers(false);
      setChats((prevChats) => [...prevChats, response.data.data]);
    } catch (error) {
      console.error("Error sending sticker:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
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
          <div>
            <h2 className="font-semibold text-lg">{group.name}</h2>
            <p className="text-sm text-muted-foreground">{group.members?.length} members</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="flex flex-col p-4 min-h-full">
          {chats.map((message, index) => {
            const isCurrentUser = message.sender._id === authUser._id;
            const isImage = isImageFile(message.content);
            const isSticker = message.type === 'sticker';

            return (
              <div
                key={message._id || index}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? `bg-${isImage || isSticker ? 'transparent' : 'black'} text-gray-100`
                      : 'bg-gray-100'
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {message.sender.name}
                    </p>
                  )}
                  {isImage || isSticker ? (
                    <img
                      src={`${BACKEND_URL}/${message.content}`}
                      alt="Sent image"
                      className={`max-w-full h-auto rounded-lg ${isSticker ? 'w-20 h-20 object-contain bg-transparent' : ''}`}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <p className="text-xs mt-1 text-gray-600">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })} • Sent by {isCurrentUser ? 'You' : message.sender.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
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
            onClick={() => setShowStickers(!showStickers)}
          >
            <StickerIcon width="100" height="100" />
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
    </div>
  );
}
