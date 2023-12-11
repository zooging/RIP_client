import React, { useState, useEffect } from "react";

const ChatComponent = ({ ws }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  const sendMessage = () => {
    if (messageInput.trim() === "") return;

    ws.send(JSON.stringify({ type: "chat", content: messageInput }));

    setMessageInput("");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <div style={{ height: "300px", overflowY: "scroll", marginBottom: "10px" }}>
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Введите сообщение..."
          style={{ flex: 1, marginRight: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "5px 10px" }}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
