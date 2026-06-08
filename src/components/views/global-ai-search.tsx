"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export function GlobalAiSearch() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Szia! Kinti AI asszisztens vagyok. Milyen szolgáltatót vagy információt keresel Svájcban?" }
  ]);

  async function handleAsk(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const q = input.trim();
    if (q.length < 3) return;

    setMessages(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/global-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      
      const data = (await res.json()) as { answer?: string; error?: string };

      if (!res.ok) {
        setMessages(prev => [...prev, { role: "ai", text: data.error || "Sajnos hiba történt a keresés közben." }]);
        setBusy(false);
        return;
      }

      setMessages(prev => [...prev, { role: "ai", text: data.answer ?? "Sajnos nem érkezett válasz." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Hálózati hiba történt. Kérlek, ellenőrizd az internetkapcsolatot!" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-card border-2 border-primary/20 bg-surface shadow-card-hover overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary/5 px-4 py-3 border-b border-primary/10">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white shadow-sm">
          <Icon name="sparkles" size={16} strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-[14px] font-extrabold text-ink">Okos-kereső AI</h2>
          <p className="text-[11px] font-semibold text-ink-muted">Szaknévsor asszisztens</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed",
                msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-sm" 
                  : "bg-surface-alt border border-line text-ink rounded-tl-sm whitespace-pre-wrap"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex w-full justify-start animate-fade-in">
            <div className="bg-surface-alt border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
               <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" />
               <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]" />
               <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} className="p-3 bg-surface border-t border-line flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          rows={1}
          placeholder="Autószerelőt keresek Aargau-ban..."
          disabled={busy}
          className="flex-1 max-h-[100px] min-h-[44px] rounded-[22px] border border-line bg-surface-alt px-4 py-3 text-[13px] text-ink outline-none focus:border-primary/50 resize-none transition-all"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 3}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-card transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="send" size={16} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
