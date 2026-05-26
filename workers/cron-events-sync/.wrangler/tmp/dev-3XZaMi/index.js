var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-OG6cX3/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/rrule.ts
var WEEKDAY_NUM = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
};
function parseRRule(s) {
  const kv = {};
  for (const piece of s.split(";")) {
    const eq = piece.indexOf("=");
    if (eq <= 0)
      continue;
    kv[piece.slice(0, eq).toUpperCase()] = piece.slice(eq + 1);
  }
  const freq = kv.FREQ;
  if (!freq || !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq))
    return null;
  const rule = {
    freq,
    interval: kv.INTERVAL ? Math.max(1, parseInt(kv.INTERVAL, 10)) : 1
  };
  if (kv.COUNT)
    rule.count = Math.max(1, parseInt(kv.COUNT, 10));
  if (kv.UNTIL) {
    const d = parseIcalUtc(kv.UNTIL);
    if (d)
      rule.until = d;
  }
  if (kv.BYDAY) {
    rule.byDay = kv.BYDAY.split(",").map(parseByDayItem).filter((x) => x !== null);
  }
  if (kv.BYMONTHDAY) {
    rule.byMonthDay = kv.BYMONTHDAY.split(",").map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 31);
  }
  if (kv.BYMONTH) {
    rule.byMonth = kv.BYMONTH.split(",").map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
  }
  return rule;
}
__name(parseRRule, "parseRRule");
function parseByDayItem(s) {
  const m = /^(-?\d+)?([A-Z]{2})$/.exec(s.trim().toUpperCase());
  if (!m)
    return null;
  const day = m[2];
  if (!(day in WEEKDAY_NUM))
    return null;
  const ord = m[1] ? parseInt(m[1], 10) : null;
  return { ord, day };
}
__name(parseByDayItem, "parseByDayItem");
function parseIcalUtc(value) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim()
  );
  if (!m)
    return null;
  const [, y, mo, d, h, mi, s] = m;
  if (!h)
    return new Date(Date.UTC(+y, +mo - 1, +d));
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}
__name(parseIcalUtc, "parseIcalUtc");
function expandRRule(start, rule, exdates, windowEnd) {
  const out = [];
  const maxCount = rule.count ?? Infinity;
  const limit = Math.min(
    windowEnd.getTime(),
    rule.until?.getTime() ?? Infinity
  );
  const HARD_CAP = 1e3;
  if (start.getTime() <= limit && !exdates.has(start.getTime())) {
    out.push(start);
  }
  if (out.length >= maxCount)
    return out;
  switch (rule.freq) {
    case "DAILY":
      stepDaily(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "WEEKLY":
      stepWeekly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "MONTHLY":
      stepMonthly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "YEARLY":
      stepYearly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
  }
  return out;
}
__name(expandRRule, "expandRRule");
function stepDaily(start, rule, exdates, limit, maxCount, cap, out) {
  const stepMs = rule.interval * 864e5;
  let t = start.getTime() + stepMs;
  let iter = 0;
  while (t <= limit && out.length < maxCount && iter < cap) {
    if (!exdates.has(t))
      out.push(new Date(t));
    t += stepMs;
    iter++;
  }
}
__name(stepDaily, "stepDaily");
function stepWeekly(start, rule, exdates, limit, maxCount, cap, out) {
  const targetDows = rule.byDay?.length ? new Set(rule.byDay.map((d) => WEEKDAY_NUM[d.day])) : /* @__PURE__ */ new Set([start.getUTCDay()]);
  const oneDay = 864e5;
  let t = start.getTime() + oneDay;
  const startWeekday = start.getUTCDay();
  let iter = 0;
  while (t <= limit && out.length < maxCount && iter < cap * 7) {
    const d = new Date(t);
    const weekdiff = Math.floor(
      (d.getTime() - start.getTime()) / (7 * oneDay)
    );
    if (weekdiff % rule.interval === 0 || sameWeek(start, d, startWeekday)) {
      if (targetDows.has(d.getUTCDay()) && !exdates.has(t)) {
        out.push(d);
      }
    }
    t += oneDay;
    iter++;
  }
}
__name(stepWeekly, "stepWeekly");
function sameWeek(a, b, weekStartDow) {
  return Math.abs(b.getTime() - a.getTime()) < 7 * 864e5;
}
__name(sameWeek, "sameWeek");
function stepMonthly(start, rule, exdates, limit, maxCount, cap, out) {
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();
  let monthsAdded = 0;
  let iter = 0;
  while (out.length < maxCount && iter < cap) {
    monthsAdded += rule.interval;
    const cur = new Date(start);
    cur.setUTCFullYear(year, month + monthsAdded, 1);
    const monthIdx = cur.getUTCMonth();
    const yr = cur.getUTCFullYear();
    const candidates = monthlyCandidates(yr, monthIdx, start, rule);
    for (const c of candidates) {
      const t = c.getTime();
      if (t > limit)
        return;
      if (!exdates.has(t))
        out.push(c);
      if (out.length >= maxCount)
        return;
    }
    if (cur.getTime() > limit && candidates.length === 0)
      return;
    iter++;
  }
}
__name(stepMonthly, "stepMonthly");
function monthlyCandidates(year, monthIdx, start, rule) {
  const hh = start.getUTCHours();
  const mi = start.getUTCMinutes();
  const ss = start.getUTCSeconds();
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
  const results = [];
  if (rule.byMonthDay?.length) {
    for (const d of rule.byMonthDay) {
      if (d >= 1 && d <= daysInMonth) {
        results.push(new Date(Date.UTC(year, monthIdx, d, hh, mi, ss)));
      }
    }
  } else if (rule.byDay?.length) {
    for (const bd of rule.byDay) {
      const dow = WEEKDAY_NUM[bd.day];
      if (bd.ord === null) {
        for (let d = 1; d <= daysInMonth; d++) {
          const cand = new Date(Date.UTC(year, monthIdx, d, hh, mi, ss));
          if (cand.getUTCDay() === dow)
            results.push(cand);
        }
      } else {
        const matches = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const cand = new Date(Date.UTC(year, monthIdx, d, hh, mi, ss));
          if (cand.getUTCDay() === dow)
            matches.push(d);
        }
        const pick = bd.ord > 0 ? matches[bd.ord - 1] : matches[matches.length + bd.ord];
        if (pick) {
          results.push(new Date(Date.UTC(year, monthIdx, pick, hh, mi, ss)));
        }
      }
    }
  } else {
    const d = Math.min(start.getUTCDate(), daysInMonth);
    results.push(new Date(Date.UTC(year, monthIdx, d, hh, mi, ss)));
  }
  if (rule.byMonth?.length) {
    return results.filter((r) => rule.byMonth.includes(r.getUTCMonth() + 1));
  }
  return results.sort((a, b) => a.getTime() - b.getTime());
}
__name(monthlyCandidates, "monthlyCandidates");
function stepYearly(start, rule, exdates, limit, maxCount, cap, out) {
  let year = start.getUTCFullYear() + rule.interval;
  let iter = 0;
  while (out.length < maxCount && iter < cap) {
    const months = rule.byMonth?.length ? rule.byMonth.map((m) => m - 1) : [start.getUTCMonth()];
    for (const monthIdx of months) {
      const candidates = monthlyCandidates(year, monthIdx, start, rule);
      for (const c of candidates) {
        const t = c.getTime();
        if (t > limit)
          return;
        if (!exdates.has(t))
          out.push(c);
        if (out.length >= maxCount)
          return;
      }
    }
    year += rule.interval;
    if (new Date(Date.UTC(year, 0, 1)).getTime() > limit)
      return;
    iter++;
  }
}
__name(stepYearly, "stepYearly");

// src/timezone.ts
function tzOffsetMinutes(date, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value])
  );
  const localAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((localAsUtc - date.getTime()) / 6e4);
}
__name(tzOffsetMinutes, "tzOffsetMinutes");
function zonedLocalToUtc(year, month, day, hour, minute, second, tz) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = tzOffsetMinutes(guess, tz);
  return new Date(guess.getTime() - offset * 6e4);
}
__name(zonedLocalToUtc, "zonedLocalToUtc");

// src/ical.ts
var DEFAULT_FLOATING_TZ = "Europe/Zurich";
function parseLine(line) {
  const colon = line.indexOf(":");
  if (colon < 0)
    return null;
  const head = line.slice(0, colon);
  const value = unescapeICalText(line.slice(colon + 1));
  const [nameAndParams, ...rest] = head.split(";");
  const segments = head.split(";");
  const name = segments[0].toUpperCase();
  const params = {};
  for (let i = 1; i < segments.length; i++) {
    const eq = segments[i].indexOf("=");
    if (eq > 0) {
      params[segments[i].slice(0, eq).toUpperCase()] = segments[i].slice(eq + 1);
    }
  }
  return { name, params, value };
}
__name(parseLine, "parseLine");
function unescapeICalText(s) {
  return s.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
__name(unescapeICalText, "unescapeICalText");
function parseDateValue(value, params) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim()
  );
  if (!m)
    return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h) {
    return {
      date: new Date(Date.UTC(+y, +mo - 1, +d)),
      allDay: true
    };
  }
  if (z) {
    return {
      date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)),
      allDay: false
    };
  }
  const tz = params.TZID ?? DEFAULT_FLOATING_TZ;
  return {
    date: zonedLocalToUtc(+y, +mo, +d, +h, +mi, +s, tz),
    allDay: false
  };
}
__name(parseDateValue, "parseDateValue");
function parseVEvents(icsText) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let cur = {};
  let inEvent = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      line += lines[i + 1].slice(1);
      i++;
    }
    if (line === "BEGIN:VEVENT") {
      cur = { categories: [], exdates: [], rrule: null };
      inEvent = true;
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur.uid && cur.title && cur.startDate) {
        events.push({
          uid: cur.uid,
          title: cur.title,
          startDate: cur.startDate,
          allDay: cur.allDay ?? false,
          venue: cur.venue ?? null,
          description: cur.description ?? null,
          categories: cur.categories ?? [],
          rrule: cur.rrule ?? null,
          exdates: cur.exdates ?? []
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent)
      continue;
    const prop = parseLine(line);
    if (!prop)
      continue;
    switch (prop.name) {
      case "UID":
        cur.uid = prop.value;
        break;
      case "SUMMARY":
        cur.title = prop.value;
        break;
      case "LOCATION":
        cur.venue = prop.value;
        break;
      case "DESCRIPTION":
        cur.description = prop.value;
        break;
      case "CATEGORIES":
        cur.categories = prop.value.split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "DTSTART": {
        const parsed = parseDateValue(prop.value, prop.params);
        if (parsed) {
          cur.startDate = parsed.date;
          cur.allDay = parsed.allDay;
        }
        break;
      }
      case "RRULE":
        cur.rrule = parseRRule(prop.value);
        break;
      case "EXDATE": {
        const parts = prop.value.split(",");
        cur.exdates ??= [];
        for (const part of parts) {
          const parsed = parseDateValue(part, prop.params);
          if (parsed)
            cur.exdates.push(parsed.date);
          else {
            const d = parseIcalUtc(part);
            if (d)
              cur.exdates.push(d);
          }
        }
        break;
      }
    }
  }
  return events;
}
__name(parseVEvents, "parseVEvents");
function parseIcs(icsText, windowStart, windowEnd) {
  const vevents = parseVEvents(icsText);
  const out = [];
  for (const ve of vevents) {
    const exSet = new Set(ve.exdates.map((d) => d.getTime()));
    const occurrences = ve.rrule ? expandRRule(ve.startDate, ve.rrule, exSet, windowEnd) : [ve.startDate];
    let idx = 0;
    for (const occ of occurrences) {
      if (occ.getTime() < windowStart.getTime()) {
        idx++;
        continue;
      }
      if (occ.getTime() > windowEnd.getTime())
        break;
      out.push({
        uid: ve.uid,
        title: ve.title,
        startDate: occ,
        allDay: ve.allDay,
        venue: ve.venue,
        categories: ve.categories,
        occurrenceIndex: idx
      });
      idx++;
    }
  }
  return out;
}
__name(parseIcs, "parseIcs");

// src/index.ts
var HU_MONTHS_ABBR = [
  "JAN",
  "FEB",
  "M\xC1R",
  "\xC1PR",
  "M\xC1J",
  "J\xDAN",
  "J\xDAL",
  "AUG",
  "SZEP",
  "OKT",
  "NOV",
  "DEC"
];
function formatForDb(date, allDay) {
  const tz = "Europe/Zurich";
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const partsFmt = new Intl.DateTimeFormat("hu-HU", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const eventDate = dateFmt.format(date);
  const parts = partsFmt.formatToParts(date);
  const get = /* @__PURE__ */ __name((t) => parts.find((p) => p.type === t)?.value ?? "", "get");
  const dateDay = String(parseInt(get("day"), 10));
  const monthIdx = parseInt(get("month"), 10) - 1;
  const dateMonth = HU_MONTHS_ABBR[monthIdx] ?? "";
  const dateWeekday = get("weekday").toLowerCase();
  const startTime = allDay ? "" : `${get("hour")}:${get("minute")}`;
  return { eventDate, dateDay, dateMonth, dateWeekday, startTime };
}
__name(formatForDb, "formatForDb");
async function syncFeed(feed, env) {
  const result = {
    feedId: feed.id,
    url: feed.url,
    source: feed.source_id,
    inserted: 0
  };
  try {
    const res = await fetch(feed.url, {
      headers: { "user-agent": "kinti-cron-events-sync/1.0" }
    });
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const windowEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3);
    const occurrences = parseIcs(text, windowStart, windowEnd);
    await env.DB.prepare("DELETE FROM events WHERE source = ?").bind(feed.source_id).run();
    for (const e of occurrences) {
      const f = formatForDb(e.startDate, e.allDay);
      const id = e.occurrenceIndex === 0 ? `${feed.source_id}:${e.uid}` : `${feed.source_id}:${e.uid}:${e.startDate.toISOString()}`;
      const tag = e.categories[0] ?? null;
      await env.DB.prepare(
        `INSERT INTO events
           (id, title, event_date, date_day, date_month, date_weekday,
            start_time, venue, going, tag, color, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?)`
      ).bind(
        id,
        e.title.slice(0, 200),
        f.eventDate,
        f.dateDay,
        f.dateMonth,
        f.dateWeekday,
        f.startTime || null,
        e.venue?.slice(0, 200) ?? null,
        tag?.slice(0, 50) ?? null,
        feed.source_id
      ).run();
      result.inserted++;
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }
  await env.DB.prepare(
    `UPDATE event_feeds
       SET last_synced_at = datetime('now'),
           last_error = ?,
           events_count = ?
     WHERE id = ?`
  ).bind(result.error ?? null, result.inserted, feed.id).run();
  return result;
}
__name(syncFeed, "syncFeed");
async function runSync(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, url, source_id FROM event_feeds WHERE enabled = 1`
  ).all();
  const feeds = await Promise.all(results.map((f) => syncFeed(f, env)));
  const totalInserted = feeds.reduce((s, f) => s + f.inserted, 0);
  return { feeds, totalInserted, ranAt: (/* @__PURE__ */ new Date()).toISOString() };
}
__name(runSync, "runSync");
var src_default = {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      runSync(env).then((result) => {
        console.log("[cron-events-sync]", JSON.stringify(result));
      })
    );
  },
  async fetch(req, env) {
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runSync(env);
    return Response.json(result);
  }
};

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-OG6cX3/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-OG6cX3/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
