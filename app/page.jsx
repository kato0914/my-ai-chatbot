"use client";
import React from "react";

export default function Home() {
  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState("");
  const [conversationId, setConversationId] = React.useState(null);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    startNewConversation();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewConversation = async () => {
    const newConversationId = Date.now().toString();
    setConversationId(newConversationId);
    const botMessage = "こんにちは！なんでも気楽に相談してください。";
    await saveMessage("assistant", botMessage, newConversationId);
    setMessages([{ role: "assistant", content: botMessage }]);
  };

  const saveMessage = async (role, content, convId) => {
    try {
      const response = await fetch("/api/db/ai_chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query:
            "INSERT INTO `messages` (role, content, timestamp, conversation_id) VALUES (?, ?, ?, ?)",
          values: [role, content, Date.now(), convId],
        }),
      });
      if (!response.ok) {
        throw new Error("APIリクエストが失敗しました");
      }
      const data = await response.json();
      // データの処理
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getConversationHistory = async () => {
    try {
      const response = await fetch('/api/db/ai_chatbot');
      if (!response.ok) {
        throw new Error('APIリクエストが失敗しました');
      }
      const data = await response.json();
      return data.messages || []; // 空の配列をデフォルト値として返す
    } catch (error) {
      console.error('エラー:', error);
      return []; // エラー時も空の配列を返す
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    await saveMessage("user", inputText, conversationId);
    setInputText("");

    try {
      const history = await getConversationHistory();
      const systemPrompt =
        "あなたは経験豊富なスクールカウンセラーです。生徒からの相談を受けています。生徒の話を受容共感を持ってくことが大切です。生徒との会話は一方通行ではなく、生徒の話に対して適切な質問を投げかけることで、生徒が自分の問題に気づき、解決策を見出せるように導いてください。会話は概ね5ターン以内で終了するように、まとめて下さい。また、生徒の話が「ありがとう」や「さようなら」で終わった時は、生徒が納得したか確認して、生徒がこの話題を終了するように促してください。生徒のプライバシーと安全性に配慮し、倫理的で適切な助言と支援を提供してください。あなたの回答は100文字以内にしてください。";

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      ];

      const response = await fetch("https://ai-chatbot.katoj62.workers.dev/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.response; // Cloudflare AIの応答形式に合わせて変更

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
      await saveMessage("assistant", botReply, conversationId);
    } catch (error) {
      console.error("エラー:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "申し訳ありません。エラーが発生しました。" }]);
    }
  };

  const handleDelete = async () => {
    await fetch("/api/db/ai_chatbot", {
      method: "POST",
      body: JSON.stringify({
        query: "DELETE FROM `messages` WHERE conversation_id = ?",
        values: [conversationId],
      }),
    });
    startNewConversation();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 pb-[10vh] bg-white flex">
        <input
          type="text"
          name="userInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 border rounded-l-lg p-2"
          placeholder="相談内容入力してください"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2"
        >
          送信
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-r-lg"
        >
          削除
        </button>
      </div>
    </div>
  );
}