import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ChatModalProps {
  title?: string;
  onClose: () => void;
  initialMessages?: Array<{
    id: string;
    sender: string;
    content: string;
    avatar: string;
    timestamp: string;
    isBuyer?: boolean;
  }>;
  systemMessage?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  title = 'Chat', 
  onClose, 
  initialMessages = [],
  systemMessage
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: message.trim(),
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      timestamp: 'just now',
      isBuyer: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="chat-body">
        {systemMessage && (
          <div className="system-message">
            <p>{systemMessage}</p>
          </div>
        )}
        
        <div className="message-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isBuyer ? 'buyer' : 'seller'}`}>
              <img src={msg.avatar} alt={msg.sender} />
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chat-input">
          <textarea 
            placeholder="Type your message here..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button className="send-btn" onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
