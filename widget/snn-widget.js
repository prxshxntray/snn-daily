// First Spike — Scriptable widget
// https://scriptable.app
//
// 1. Set BASE_URL to the deployed site (no trailing path).
// 2. Leave START_DATE_OVERRIDE null to use startDate from today.json.
//    Set "YYYY-MM-DD" if you changed the start date inside the app.
// 3. A widget parameter, if you set one in Scriptable, replaces BASE_URL.
//
// Small and medium sizes are both laid out. Add the script twice, or let
// iOS pass config.widgetFamily. The answer is fetched and never drawn.
// Tap opens the app. The last successful payload is cached for the train.

const BASE_URL = "https://prxshxntray.github.io/snn-daily";
const START_DATE_OVERRIDE = null;
const PREVIEW_FAMILY = "medium";

const CACHE_NAME = "first-spike-today.json";

function parseISO(iso) {
  const parts = iso.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function isoFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function daysBetween(fromIso, toIso) {
  const ms = parseISO(toIso).getTime() - parseISO(fromIso).getTime();
  return Math.round(ms / 86400000);
}

// Keep this aligned with resolveCurriculumDay in src/lib/unlock.ts.
function resolveToday(feed, todayIso, startOverride) {
  const start = startOverride || feed.startDate;
  const lessons = feed.lessons || [];
  const count = lessons.length;
  const diff = daysBetween(start, todayIso);
  if (count === 0) {
    return { status: "empty", lesson: null, day: 0 };
  }
  if (diff < 0) {
    return {
      status: "before-start",
      day: 1,
      daysUntil: -diff,
      lesson: lessons[0],
    };
  }
  if (diff < count) {
    return { status: "lesson", day: diff + 1, lesson: lessons[diff] };
  }
  const reviewDay = ((diff - count) % count) + 1;
  return {
    status: "finished",
    reviewDay: reviewDay,
    day: reviewDay,
    lesson: lessons[reviewDay - 1],
  };
}

function nextMorning(now) {
  const next = new Date(now.getTime());
  next.setHours(7, 5, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function cachePath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), CACHE_NAME);
}

function readCache() {
  const fm = FileManager.local();
  const path = cachePath();
  if (!fm.fileExists(path)) return null;
  try {
    return JSON.parse(fm.readString(path));
  } catch (error) {
    return null;
  }
}

function writeCache(feed) {
  const fm = FileManager.local();
  fm.writeString(cachePath(), JSON.stringify(feed));
}

async function loadFeed(baseUrl) {
  const url = baseUrl.replace(/\/$/, "") + "/today.json";
  try {
    const request = new Request(url);
    request.timeoutInterval = 15;
    const feed = await request.loadJSON();
    if (!feed || !feed.lessons) throw new Error("Bad payload");
    writeCache(feed);
    return feed;
  } catch (error) {
    const cached = readCache();
    if (cached) return cached;
    throw error;
  }
}

function style(text, size, color, bold) {
  text.font = bold ? Font.semiboldSystemFont(size) : Font.systemFont(size);
  text.textColor = new Color(color);
  return text;
}

function paint(widget, family, resolved) {
  const paper = "#f3efe4";
  const mute = "#a8a292";
  const sage = "#c9d7a6";
  const small = family === "small";
  const lesson = resolved.lesson;

  const brand = widget.addText("FIRST SPIKE");
  style(brand, 10, sage, true);

  if (!lesson) {
    style(widget.addText("No lesson in the feed."), 12, mute, false);
    return;
  }

  let kicker = "DAY " + resolved.day;
  if (resolved.status === "before-start") kicker = "OPENS IN " + resolved.daysUntil + "D";
  if (resolved.status === "finished") kicker = "REVIEW";
  if (lesson.topic) kicker += " · " + lesson.topic.toUpperCase();
  const kickerText = widget.addText(kicker);
  style(kickerText, small ? 10 : 11, mute, true);

  widget.addSpacer(4);
  const title = widget.addText(lesson.title);
  style(title, small ? 15 : 18, paper, true);
  title.lineLimit = small ? 3 : 2;

  if (!small && lesson.summary) {
    widget.addSpacer(4);
    const summary = widget.addText(lesson.summary);
    style(summary, 12, mute, false);
    summary.lineLimit = 3;
  }

  widget.addSpacer(6);
  const label = widget.addText(resolved.status === "before-start" ? "TOMORROW" : "RECALL");
  style(label, 10, sage, true);
  const question = widget.addText(
    resolved.status === "before-start"
      ? "Day 1 is not open yet."
      : lesson.question,
  );
  style(question, small ? 12 : 13, paper, false);
  question.lineLimit = small ? 4 : 3;

  widget.addSpacer();
  const hint = widget.addText("Tap for the answer");
  style(hint, 10, mute, false);
}

async function main() {
  const family = config.widgetFamily || PREVIEW_FAMILY;
  const baseUrl = args.widgetParameter || BASE_URL;
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#10130e");
  widget.setPadding(14, 14, 14, 14);
  widget.url = baseUrl;
  widget.refreshAfterDate = nextMorning(new Date());

  try {
    const feed = await loadFeed(baseUrl);
    const resolved = resolveToday(feed, isoFromDate(new Date()), START_DATE_OVERRIDE);
    paint(widget, family, resolved);
  } catch (error) {
    style(widget.addText("FIRST SPIKE"), 10, "#c9d7a6", true);
    const message = widget.addText("Could not reach today's lesson, and nothing is cached yet.");
    style(message, 12, "#a8a292", false);
    message.lineLimit = 4;
  }

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else if (family === "small") {
    await widget.presentSmall();
  } else {
    await widget.presentMedium();
  }
  Script.complete();
}

globalThis.__firstSpikeResolve = resolveToday;

if (typeof ListWidget !== "undefined") {
  main();
}
