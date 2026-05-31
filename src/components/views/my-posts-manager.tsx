"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import {
  loadMyPosts,
  removeMyPost,
  exportBackup,
  importBackup,
  clearMyPosts,
  type MyPostEntry,
  type PostType,
} from "@/lib/my-posts";

const TYPE_META: Record<PostType, { label: string; icon: string; color: string }> = {
  event:    { label: "Esemény",      icon: "📅", color: "#E4405F" },
  review:   { label: "Vélemény",     icon: "⭐", color: "#f1c40f" },
  business: { label: "Vállalkozás",  icon: "🏪", color: "#1d4434" },
  spontan:  { label: "Spontán",      icon: "🎲", color: "#9b59b6" },
};

export function MyPostsManager({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const [items, setItems] = useState<MyPostEntry[]>([]);
  const [filter, setFilter] = useState<PostType | "all">("all");
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Email-export modal
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function onSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(null);
    if (!emailAddr.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr)) {
      setEmailErr("Érvénytelen email-cím.");
      return;
    }
    if (!turnstileToken) {
      setEmailErr("Várd meg a robot-ellenőrzést.");
      return;
    }
    setEmailBusy(true);
    try {
      const res = await fetch("/api/sajatjaim/send-backup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: emailAddr.trim(),
          items: loadMyPosts(),
          turnstileToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setEmailErr(data.error ?? "Hiba a küldés közben.");
        turnstileRef.current?.reset();
        return;
      }
      setEmailOpen(false);
      setEmailAddr("");
      setTurnstileToken("");
      showMsg("Backup elküldve emailben! Nézd meg a postafiókod.");
    } catch (err) {
      setEmailErr(err instanceof Error ? err.message : "Hálózati hiba.");
      turnstileRef.current?.reset();
    } finally {
      setEmailBusy(false);
    }
  }

  useEffect(() => {
    setItems(loadMyPosts());
  }, []);

  function refresh() {
    setItems(loadMyPosts());
  }

  function showMsg(s: string) {
    setMsg(s);
    setTimeout(() => setMsg(null), 3000);
  }

  function onDelete(it: MyPostEntry) {
    if (!confirm(`Eltávolítod a saját posztjaid közül? Ez nem törli az élesben — csak a böngésződből.\n\n"${it.title}"`)) return;
    removeMyPost(it.type, it.id);
    refresh();
  }

  function onExport() {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kinti-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg(`Exportálva: ${backup.items.length} elem.`);
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const res = importBackup(text);
      if (res.ok) {
        showMsg(`Importálva: +${res.added} új elem.`);
        refresh();
      } else {
        showMsg(`Hiba: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function onClearAll() {
    if (!confirm("Biztosan kitörlöd a TELJES helyi listát? Az élesben lévő posztok megmaradnak, csak a böngésződből tűnnek el. Ha nincs backup, a manage-linkek elvesznek!")) return;
    clearMyPosts();
    refresh();
    showMsg("Lista kiürítve.");
  }

  const filtered = filter === "all" ? items : items.filter((it) => it.type === filter);
  const totals: Record<PostType | "all", number> = { all: items.length, event: 0, review: 0, business: 0, spontan: 0 };
  for (const it of items) totals[it.type]++;

  return (
    <div className="space-y-4">
      {/* Akció-gombok: Export / Import / Email */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onExport} className="flex items-center justify-center gap-1.5 rounded-pill bg-primary text-white py-2 text-[12px] font-bold shadow-card-hover active:scale-95">
          <Icon name="arrowUp" size={12} strokeWidth={2.4} className="rotate-180" />
          Letöltés
        </button>
        <button onClick={onImportClick} className="flex items-center justify-center gap-1.5 rounded-pill border border-line bg-surface py-2 text-[12px] font-bold text-ink shadow-card active:scale-95">
          <Icon name="arrowUp" size={12} strokeWidth={2.4} />
          Import
        </button>
        <button
          onClick={() => setEmailOpen(true)}
          disabled={items.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-pill border border-line bg-surface py-2 text-[12px] font-bold text-ink shadow-card active:scale-95 disabled:opacity-50"
        >
          <Icon name="send" size={12} strokeWidth={2.4} />
          Email
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImportFile} />
      </div>

      {/* Email-küldés modal */}
      {emailOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => !emailBusy && setEmailOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-extrabold tracking-tight text-ink">
              Backup emailre küldése
            </h3>
            <p className="mt-1 text-[12px] leading-snug text-ink-muted">
              Elküldjük az összes <strong className="text-ink">{items.length}</strong> kezelő-linkedet az emailedre.{" "}
              <strong className="text-ink">Mi NEM tároljuk</strong> sem az emailedet, sem a küldést — csak továbbítjuk a postafiókodba.
            </p>

            <form onSubmit={onSendEmail} className="mt-4 space-y-3">
              <input
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                placeholder="email@pelda.hu"
                autoComplete="email"
                required
                className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold text-ink placeholder-ink-faint focus:border-primary focus:outline-none shadow-sm"
              />

              {turnstileSiteKey && (
                <TurnstileWidget
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onToken={setTurnstileToken}
                />
              )}

              {emailErr && <p className="text-[12px] font-bold text-accent">{emailErr}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEmailOpen(false)}
                  disabled={emailBusy}
                  className="flex-1 rounded-pill border border-line bg-surface-alt py-2.5 text-[12.5px] font-bold text-ink-muted active:scale-95"
                >
                  Mégsem
                </button>
                <button
                  type="submit"
                  disabled={emailBusy}
                  className="flex-1 rounded-pill bg-primary py-2.5 text-[12.5px] font-bold text-white shadow-card active:scale-95 disabled:opacity-60"
                >
                  {emailBusy ? "Küldés…" : "Küldés"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msg && (
        <div className="rounded-[10px] border border-success/30 bg-success/10 px-3 py-2 text-[12px] font-semibold text-success">
          {msg}
        </div>
      )}

      {/* Típus-szűrő */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label={`Mind (${totals.all})`} />
        {(Object.keys(TYPE_META) as PostType[]).map((t) => (
          totals[t] > 0 && (
            <FilterPill key={t} active={filter === t} onClick={() => setFilter(t)} label={`${TYPE_META[t].icon} ${TYPE_META[t].label} (${totals[t]})`} />
          )
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt p-6 text-center">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-[13px] font-bold text-ink">Egyelőre üres a listád</p>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            Amikor beküldesz valamit (hirdetés, esemény, vélemény, vállalkozás),
            automatikusan idekerül.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => {
            const meta = TYPE_META[it.type];
            return (
              <div key={`${it.type}::${it.id}`} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-base" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-ink-faint">· {fmtRel(it.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-[13.5px] font-bold tracking-[-0.01em] text-ink truncate">
                      {it.title}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link href={it.manageUrl} className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary py-1.5 text-[11.5px] font-bold text-white shadow-card active:scale-95">
                    <Icon name="sliders" size={11} strokeWidth={2.4} /> Szerkesztés
                  </Link>
                  <button type="button" onClick={() => onDelete(it)} className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11.5px] font-bold text-accent active:scale-95">
                    🗑 Listából
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mind töröl — kis text-link */}
      {items.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-semibold text-ink-faint underline hover:text-accent"
          >
            Teljes lista törlése a böngészőből
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition active:scale-95",
        active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}

function fmtRel(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "az imént" : `${mins} perce`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} órája`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} napja`;
  return new Date(t).toLocaleDateString("hu-HU");
}
