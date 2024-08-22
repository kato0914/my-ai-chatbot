import React, { useState, ChangeEvent, FormEvent } from 'react';

// レスポンスの型定義
interface ChatResponse {
  reply: string;
}

const ChatComponent: React.FC = () => {
  const [input, setInput] = useState<string>(''); // 明示的に型指定
  const [messages, setMessages] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch('/api/chat', { 
      method: 'POST', 
      body: JSON.stringify({ message: input }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json() as ChatResponse;
    setMessages([...messages, input, data.reply]);
    setInput('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };  

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange}
        />
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default ChatComponent;