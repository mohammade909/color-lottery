'use client'
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { Message } from '../types';
import { format } from 'date-fns';

export default function Chat() {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, { ...message, timestamp: new Date(message.timestamp) }]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      ...(targetUserId && { targetUserId }),
    };

    socket.emit('send_message', messageData, (response: any) => {
      if (response.success) {
        setNewMessage('');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-96">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${
                msg.senderId === user?.id
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium">
                {msg.senderId === user?.id ? 'You' : `User ${msg.senderId.slice(0, 5)}...`}
                {msg.private && ' (private)'}
              </div>
              <div className="mt-1">{msg.message}</div>
              <div className="text-xs text-gray-500 mt-1">
                {format(new Date(msg.timestamp), 'HH:mm:ss')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Target user ID (optional)"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="flex-none w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}