"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MiwillyTestChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Test Stebo Ai with questions to verify knowledge base responses." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/miwilly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "No answer available." },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-96 flex-col rounded-xl border border-slate-200">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Stebo Ai is typing...</p>}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t p-3"
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a test question..." />
        <Button type="submit" loading={loading}>
          Send
        </Button>
      </form>
    </div>
  );
}
