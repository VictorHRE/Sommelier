"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { config } from "@/config";

const Chat = () => {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  useEffect(() => {
    scroll();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    // Agregamos un mensaje placeholder para la IA antes de la respuesta real
    const placeholderId = (Date.now() + 1).toString();
    const aiPlaceholder = { id: placeholderId, role: "assistant", content: "" };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...updatedMessages] }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let gotFirstChunk = false;
      let aiMessage = { ...aiPlaceholder };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });

        aiMessage.content += chunkText;
        setMessages((prev) => {
          return prev.map((msg) => (msg.id === placeholderId ? aiMessage : msg));
        });

        if (!gotFirstChunk) {
          // Una vez recibimos el primer chunk, apagamos el indicador de "pensando"
          setLoading(false);
          gotFirstChunk = true;
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      // Si hay un error, removemos el mensaje placeholder o mostramos un mensaje de error
      setMessages((prev) => prev.filter((msg) => msg.role !== "assistant" || msg.content !== ""));
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = () => {
    return (
      <div className="response" ref={chatContainer}>
        {messages.map((m, index) => {
          const isUser = m.role === "user";
          const isAssistant = m.role === "assistant";
          const isPlaceholder = isAssistant && m.content === "" && loading;

          return (
            <div
              key={index}
              className={`chat-line ${isUser ? "user-chat" : "ai-chat"}`}
            >
              {isUser ? (
                <>
                  <div className="message-container">
                    <p className="message">{m.content}</p>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    className="avatar"
                    alt={config.sommelier.name}
                    width={50}
                    height={50}
                    src={config.images.sommelierAvatar}
                  />
                  <div className="message-container">
                    {isPlaceholder ? (
                      // Mostramos el mensaje mientras piensa
                      <p className="message" style={{ color: 'white' }}>{config.sommelier.name} {config.prompts.thinking}</p>
                    ) : (
                      <ReactMarkdown className="message">{m.content}</ReactMarkdown>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chat" style={{'--primary-color': config.ui.primary, '--secondary-color': config.ui.secondary} as React.CSSProperties}>
      {renderResponse()}
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-container">
          <input
            name="input-field"
            type="text"
            placeholder={config.prompts.placeholder}
            onChange={(e) => setInput(e.target.value)}
            value={input}
            disabled={loading}
          />
          <button type="submit" className="send-button" disabled={loading}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icono">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
          </button>
        </div>
      </form>
      {config.dev.analyticsEnabled && <Analytics />}
      {config.dev.speedInsightsEnabled && <SpeedInsights/>}
    </div>
  );
};

export default Chat;
