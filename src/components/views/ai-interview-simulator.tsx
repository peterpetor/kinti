"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const PROFESSIONS = [
  "Építőipar (Baubranche)",
  "Vendéglátás (Gastronomie)",
  "Logisztika (Logistik)",
  "Egészségügy (Gesundheitswesen)",
  "Informatika (IT)",
  "Általános (Allgemein)",
];

const LANGUAGES = [
  { id: "Hochdeutsch", label: "Hochdeutsch (Sztenderd német)" },
  { id: "Schweizerdeutsch", label: "Schweizerdeutsch (Svájci német dialect)" },
  { id: "Englisch", label: "Angol" },
];

export function AiInterviewSimulator() {
  // Ország-tudatos: a dialektus-opció és a HR-kontextus a választott országhoz.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  // NL → holland/angol (Hollandiában nem német nyelvű az interjú); CH/AT/DE → német variánsok + angol.
  const languages = country === "NL"
    ? [{ id: "Nederlands", label: "Nederlands (Holland)" }, LANGUAGES[2] /* Englisch */]
    : [
        LANGUAGES[0],
        isAT
          ? { id: "Österreichisches Deutsch", label: "Österreichisches Deutsch (Osztrák német)" }
          : LANGUAGES[1],
        LANGUAGES[2],
      ];

  const [hasStarted, setHasStarted] = useState(false);
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [language, setLanguage] = useState(LANGUAGES[0].id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Ha a választott nyelv nem érvényes a választott országra (pl. NL-re váltva a
  // német „Hochdeutsch"), visszaállítjuk az ország első nyelvére.
  useEffect(() => {
    if (!languages.some((l) => l.id === language)) setLanguage(languages[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startInterview = async () => {
    setHasStarted(true);
    setIsLoading(true);

    const initialMsg: Message = { role: "user", content: "Hallo! Ich bin bereit für das Vorstellungsgespräch." };
    setMessages([initialMsg]);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, language, country, messages: [initialMsg] }),
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (res.ok && data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer! }]);
      } else {
        alert(data.error || "Hiba történt az induláskor.");
      }
    } catch (err) {
      alert("Hálózati hiba.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, language, country, messages: newMessages }),
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (res.ok && data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer! }]);
      } else {
        alert(data.error || "Hiba történt a válaszadáskor.");
      }
    } catch (err) {
      alert("Hálózati hiba.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasStarted) {
    return (
      <section className="rounded-card border border-line bg-surface p-5 shadow-card max-w-md mx-auto mt-6">
        <div className="mb-4 flex items-center justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="user" size={28} strokeWidth={2} />
          </span>
        </div>
        <h2 className="text-center text-[18px] font-extrabold tracking-tight text-ink mb-2">
          AI Munkainterjú Szimulátor
        </h2>
        <p className="text-center text-[13px] leading-relaxed text-ink-muted mb-6">
          Készülj fel {country === "DE" ? "a német" : isAT ? "az osztrák" : country === "NL" ? "a holland" : "a svájci"} HR menedzserek kérdéseire! Az AI szerepjátékot játszik veled,
          hogy magabiztosabb legyél az éles interjún.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5 ml-1">
              Szakma / Iparág
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-line bg-surface-alt px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition"
            >
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5 ml-1">
              Interjú Nyelve
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-line bg-surface-alt px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:bg-surface transition"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={startInterview}
            className="w-full flex items-center justify-center gap-2 rounded-pill bg-primary px-5 py-3.5 text-[15px] font-extrabold text-white shadow-card hover:bg-primary/90 transition active:scale-[0.98] mt-2"
          >
            <Icon name="sparkles" size={18} strokeWidth={2.4} />
            Interjú Indítása
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col rounded-card border border-line bg-surface shadow-card max-w-lg mx-auto h-[600px] overflow-hidden mt-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line bg-surface-alt/60 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon name="user" size={18} strokeWidth={2} />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-surface"></span>
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-ink">Herr Müller (HR)</h3>
            <p className="text-[11px] text-ink-muted">{profession} • {language}</p>
          </div>
        </div>
        <button 
          onClick={() => { setHasStarted(false); setMessages([]); }}
          className="text-[12px] font-bold text-ink-faint hover:text-danger transition"
        >
          Befejezés
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fb]"
      >
        {messages.filter(m => !(m.role === "user" && m.content.startsWith("Hallo! Ich bin bereit"))).map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-[18px] px-4 py-2.5 text-[14px] leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-white border border-line text-ink rounded-bl-sm shadow-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-sm bg-white border border-line px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="border-t border-line bg-surface p-3 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Herr Müller gépel..." : "Írd ide a válaszod németül..."}
            className="w-full rounded-pill border-2 border-line bg-surface-alt py-3 pl-4 pr-12 text-[14px] font-medium text-ink outline-none focus:border-primary disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition disabled:opacity-50 disabled:bg-line"
          >
            <Icon name="arrowRight" size={16} strokeWidth={2.5} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          Tipp: Próbálj kerek, egész mondatokban válaszolni a HR vezetőnek.
        </p>
      </form>
    </section>
  );
}
