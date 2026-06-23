// populate-events-remote.mjs — egyszeri remote D1 esemény-feltöltés.
// A lusta waitUntil-szinkron élesben nem futott le, ezért a generált megemlékezések
// (CH+AT) + a CHW (Bécs) valós eseményei közvetlenül kerülnek be. Idempotens:
// a jövőbeli auto:hu-national és chw:wien sorokat törli + újraírja.
//
// Futtatás:  node scripts/populate-events-remote.mjs
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const HU_MONTHS = ["JAN","FEB","MÁR","ÁPR","MÁJ","JÚN","JÚL","AUG","SZEP","OKT","NOV","DEC"];
const HU_WEEKDAYS = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];
function huDateParts(dateISO) {
  const [y,m,d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m-1, d));
  return { day: String(d), month: HU_MONTHS[(m-1)%12] ?? "", weekday: HU_WEEKDAYS[dt.getUTCDay()] ?? "" };
}

const COUNTRY_META = { CH: { adj:"svájci", venue:"Svájc-szerte" }, AT: { adj:"osztrák", venue:"Ausztria-szerte" } };
const HU_NATIONAL = [
  { key:"marc15", month:3, day:15, title:"Március 15. — 1848-as forradalom", color:"#c8392e",
    description:"Nemzeti ünnep. A {adj} magyar egyesületek és missziók helyi megemlékezéseket szerveznek — a pontos helyszínt és időpontot a szervezők hirdetik meg." },
  { key:"trianon", month:6, day:4, title:"Nemzeti Összetartozás Napja", color:"#5b4a8c",
    description:"Megemlékezés a nemzeti összetartozásról (1920, Trianon). A {adj} magyar közösségek helyi programokat tartanak — részletek a szervezőknél." },
  { key:"istvan", month:8, day:20, title:"Augusztus 20. — Szent István, államalapítás", color:"#c89a5c",
    description:"Nemzeti ünnep, az államalapítás és Szent István király emléknapja. A {adj} magyar közösségek ünnepi programokat, szentmisét szerveznek — részletek a szervezőknél." },
  { key:"arad", month:10, day:6, title:"Október 6. — Aradi vértanúk emléknapja", color:"#3a3a3a",
    description:"Nemzeti gyásznap az 1848–49-es szabadságharc vértanúinak emlékére. A helyi megemlékezéseket a magyar közösségek hirdetik." },
  { key:"1956", month:10, day:23, title:"Október 23. — 1956-os forradalom", color:"#c8392e",
    description:"Nemzeti ünnep az 1956-os forradalom és szabadságharc emlékére. A {adj} magyar egyesületek megemlékezéseket szerveznek — a helyszínt és időpontot a szervezők hirdetik meg." },
];
const GENERATED_SOURCE = "auto:hu-national";

function generateRecurring(now, country) {
  const meta = COUNTRY_META[country] ?? COUNTRY_META.CH;
  const todayISO = now.toISOString().slice(0,10);
  const startYear = now.getUTCFullYear();
  const out = [];
  for (let y = startYear; y <= startYear + 1; y++) {
    for (const def of HU_NATIONAL) {
      const dateISO = `${y}-${String(def.month).padStart(2,"0")}-${String(def.day).padStart(2,"0")}`;
      if (dateISO < todayISO) continue;
      const { day, month, weekday } = huDateParts(dateISO);
      out.push({
        id: `auto-hu-${country.toLowerCase()}-${def.key}-${y}`,
        title: def.title, eventDate: dateISO, dateDay: day, dateMonth: month, dateWeekday: weekday,
        venue: meta.venue, tag: "Megemlékezés", color: def.color,
        description: def.description.replace(/\{adj\}/g, meta.adj), startTime: null, country,
      });
    }
  }
  return out;
}

const CHW_INSTITUTE = "1762130a-9cc1-413f-907b-9b372c738523";
const CHW_SOURCE = "chw:wien";
async function fetchChw(now) {
  const from = `${now.toISOString().slice(0,10)} 00:00:00`;
  const end = new Date(now); end.setMonth(end.getMonth()+6);
  const to = `${end.toISOString().slice(0,10)} 23:59:59`;
  const url = `https://culture.hu/publicapi/hu/institute/${CHW_INSTITUTE}/pages/event/with-extra-info?listingInfo&eventDateGt=${encodeURIComponent(from)}&eventDateLt=${encodeURIComponent(to)}`;
  let data = [];
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) { console.error("CHW API:", res.status); return []; }
    const json = await res.json(); data = json.data ?? [];
  } catch (e) { console.error("CHW fetch hiba:", e.message); return []; }
  const out = [];
  for (const ev of data) {
    const st = ev.status; const f = st?.eventDateFrom;
    if (!ev.uuid || !ev.title || !f) continue;
    if (st?.isHidden || st?.isDeleted || st?.isActive === false) continue;
    const eventDate = f.slice(0,10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) continue;
    const hhmm = f.slice(11,16);
    const startTime = /^\d{2}:\d{2}$/.test(hhmm) && hhmm !== "00:00" ? hhmm : null;
    const { day, month, weekday } = huDateParts(eventDate);
    const addr = ev.locDateTime?.[0]?.locationAddress?.trim();
    const subtitle = ev.subtitle?.trim();
    out.push({
      id: `chw-${ev.uuid}`, title: ev.title.trim(),
      description: [subtitle, "Collegium Hungaricum Wien (Magyar Kulturális Intézet, Bécs) programja."].filter(Boolean).join(" — "),
      eventDate, startTime, dateDay: day, dateMonth: month, dateWeekday: weekday,
      venue: addr || "Collegium Hungaricum, Bécs", tag: "Kultúra · CHW",
      color: ev.relation?.primaryTag?.backgroundColor || "#c8a24a", country: "AT", source: CHW_SOURCE,
    });
  }
  return out;
}

const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const val = (s) => (s == null ? "NULL" : `'${esc(s)}'`);

function insertSql(ev, source) {
  return `INSERT OR REPLACE INTO events (id,title,event_date,date_day,date_month,date_weekday,start_time,venue,going,tag,color,description,country_code,source,status,moderation_status,moderation_decided_by,moderation_decision_at,created_at) VALUES (${val(ev.id)},${val(ev.title)},${val(ev.eventDate)},${val(ev.dateDay)},${val(ev.dateMonth)},${val(ev.dateWeekday)},${val(ev.startTime)},${val(ev.venue)},0,${val(ev.tag)},${val(ev.color)},${val(ev.description)},${val(ev.country)},${val(source)},'approved',1,'manual-populate',datetime('now'),datetime('now'));`;
}

const now = new Date();
const generated = ["CH","AT"].flatMap((c) => generateRecurring(now, c));
const chw = await fetchChw(now);

const lines = [];
lines.push(`DELETE FROM events WHERE source = '${GENERATED_SOURCE}' AND event_date >= date('now');`);
lines.push(`DELETE FROM events WHERE source = '${CHW_SOURCE}' AND event_date >= date('now');`);
for (const ev of generated) lines.push(insertSql(ev, GENERATED_SOURCE));
for (const ev of chw) lines.push(insertSql(ev, ev.source));

writeFileSync("db/_populate-events.sql", lines.join("\n") + "\n");
console.log(`Generált: ${generated.length} (CH+AT megemlékezés) · CHW: ${chw.length} (Bécs)`);
for (const e of chw) console.log(`  CHW ${e.eventDate} ${e.startTime ?? ""} · ${e.title}`);

console.log("\nFeltöltés a remote D1-re…");
execSync(`npx wrangler d1 execute kinti-db --remote --file=db/_populate-events.sql`, { stdio: "inherit" });
