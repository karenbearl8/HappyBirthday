import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { motion, useScroll, useTransform, AnimatePresence } from "https://esm.sh/framer-motion@11.11.9?bundle";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

const INTRO_IMAGES = {
  happybday: "intro_images/happybday.png",
  together: "intro_images/together.png",
  airplane: "intro_images/airplane.png",
  time: "intro_images/time.png",
  grad: "intro_images/grad.png",
};

const INTRO_SEGMENTS = [
  { text: "宇良，生日快乐。", visual: "happybday" },
  {
    text: "原来我们已经从十八，走到二十，又走过二十一、二十二，如今停在这里。青春像一列夜车，窗玻璃上倒映着无数张模糊的脸，可我只看清了你的，从腼腆的轮廓，到成熟的线条，每一帧都亮得像星。",
    visual: "time",
  },
  {
    text: "七十八次去机场时我在想你有没有好好吃饭，七十八次落地开机时跳出的第一条消息必定是你，七十八次在安检口回头，都看见你还站在原地，隔着玻璃朝我挥手的剪影。",
    visual: "together",
  },
  {
    text: "张爱玲说，于千万人之中遇见你所遇见的人，于千万年之中，时间的无涯的荒野里，没有早一步，也没有晚一步。",
    visual: "airplane",
  },
  {
    text: "从高中毕业到大学毕业，从\"懵懂的以后\"到\"携手的确信\"，生日快乐，我的宇良。",
    visual: "grad",
  },
  {
    text: "愿你的二十三岁，是我们第七十九次起飞的理由，是云层之上，我偷偷握住你手时，你回握得更紧的力道。",
    visual: "happybday",
  },
];

const INTRO_FADE_IN_MS = 950;
const INTRO_HOLD_MIN_MS = 5000;
const INTRO_HOLD_MAX_MS = 10000;

function randomHoldMs() {
  return INTRO_HOLD_MIN_MS + Math.random() * (INTRO_HOLD_MAX_MS - INTRO_HOLD_MIN_MS);
}

/** Same track as open.spotify.com/embed/track/5TH7TT8Aej6dybwQFGipWi — hidden embed; browser may still block autoplay. */
const SPOTIFY_BG_TRACK_URI = "spotify:track:5TH7TT8Aej6dybwQFGipWi";

function initBackgroundSpotifyOnce() {
  if (typeof window === "undefined" || window.__bgSpotifyLaneInited) return;
  window.__bgSpotifyLaneInited = true;

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:0;top:0;width:0;height:0;opacity:0;overflow:hidden;clip:rect(0,0,0,0);pointer-events:none;z-index:-1;border:0;margin:0;padding:0;";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);

  const prev = window.onSpotifyIframeApiReady;
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    try {
      if (typeof prev === "function") prev(IFrameAPI);
    } catch (_) {
      /* ignore */
    }
    if (window.__bgSpotifyController) return;

    IFrameAPI.createController(
      host,
      {
        uri: SPOTIFY_BG_TRACK_URI,
        width: 300,
        height: 152,
      },
      (EmbedController) => {
        window.__bgSpotifyController = EmbedController;
        window.__bgSpotifyTryPlay = () => {
          try {
            const p = EmbedController.play?.();
            if (p && typeof p.catch === "function") p.catch(() => {});
          } catch (_) {
            /* ignore */
          }
        };
        EmbedController.addListener("ready", () => {
          window.__bgSpotifyReady = true;
          window.dispatchEvent(new Event("bg-spotify-ready"));
        });
      }
    );
  };

  if (!document.querySelector("script[data-spotify-bg-api]")) {
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.dataset.spotifyBgApi = "1";
    document.body.appendChild(s);
  }
}

function IntroVisual({ visual }) {
  const src = INTRO_IMAGES[visual];
  if (!src) return null;
  return html`
    <div className="mx-auto flex w-full max-w-[min(94vw,880px)] items-center justify-center py-1" style=${{ minHeight: "18vh" }}>
      <img
        src=${src}
        alt=""
        className="h-auto max-h-[min(58vh,680px)] w-full object-contain"
      />
    </div>
  `;
}
const photoSlots = [
  "left-[14%] top-[14%] w-[29vw] min-w-[254px] max-w-[448px] rotate-[-5deg] z-20",
  "left-[26%] top-[38%] w-[31vw] min-w-[273px] max-w-[488px] rotate-[3deg] z-30",
  "left-[40%] top-[18%] w-[27vw] min-w-[234px] max-w-[410px] rotate-[6deg] z-10 opacity-90",
  "left-[44%] top-[40%] w-[24vw] min-w-[206px] max-w-[352px] rotate-[-4deg] z-20 opacity-85",
  "left-[36%] top-[8%] w-[24vw] min-w-[215px] max-w-[380px] rotate-[-2deg] z-40 opacity-95",
  "left-[10%] top-[46%] w-[25vw] min-w-[224px] max-w-[372px] rotate-[4deg] z-10 opacity-80",
];

const yearMemories = [
  {
    year: "2022",
    title: "The beginning pages",
    date: "2022",
    description: "A gentle start to the timeline, full of firsts and warm memories.",
    photos: [
      {
        src: "images%20of%20us/2022first.jpg",
        alt: "2022 first date",
        annotationText: "初遇",
        annotationNote: "樱花落在你肩，我第一次觉得春天有了具体的形状",
      },
      {
        src: "images%20of%20us/2022volunteer.jpg",
        alt: "2022 volunteer",
        annotationText: "义工",
        annotationNote: "两个傻子在社区忙前忙后，以为这样就能把世界变好一点",
      },
      {
        src: "images%20of%20us/2022meet.jpg",
        alt: "2022 meet",
        annotationText: "遇见",
        annotationNote: "路人丢了钱包，我们却捡到了「原来你也在这里」",
      },
      {
        src: "images%20of%20us/2022prom.jpg",
        alt: "2022 prom",
        annotationText: "prom",
        annotationNote: "灯光昏黄，我偷偷记住你握我手时掌心的温度",
      },
      {
        src: "images%20of%20us/2022grad.jpg",
        alt: "2022 graduation",
        annotationText: "毕业",
        annotationNote: "人海里弄丢过你一次，还好命运让我又找到了",
      },
    ],
  },
  {
    year: "2023",
    title: "Soft light and long roads",
    date: "2023",
    description: "Roadtrip playlists, handwritten notes, and places that felt familiar right away.",
    photos: [
      {
        src: "images%20of%20us/2023summerpick.JPG",
        alt: "2023 summer pick",
        annotationText: "暑假来接",
        annotationNote: "你穿越一整个暑假来接我，像携着风来的",
      },
      {
        src: "images%20of%20us/2023summer.jpg",
        alt: "2023 summer",
        annotationText: "Berkeley",
        annotationNote: "帮你把家搬到 Berkeley，也把我的一部分搬进了你的生活",
      },
      {
        src: "images%20of%20us/2023redhair.jpg",
        alt: "2023 red hair",
        annotationText: "红发",
        annotationNote: "我红发张扬，我却只看见你眼里为我亮的光",
      },
      {
        src: "images%20of%20us/2023beach.jpg",
        alt: "2023 beach",
        annotationText: "沙滩",
        annotationNote: "沙滩上挖一颗小心，潮汐来了又走，它还在",
      },
      {
        src: "images%20of%20us/2023xmas.JPG",
        alt: "2023 christmas",
        annotationText: "圣诞",
        annotationNote: "推开门看见你跟狗狗 Penny，难忘的冬日",
      },
      {
        src: "images%20of%20us/2023dog.jpg",
        alt: "2023 dog",
        annotationText: "Penny",
        annotationNote: "有你在的冬天，连狗狗的笑都像在替我们存档。",
      },
    ],
  },
  {
    year: "2024",
    title: "Quiet mornings, brighter skies",
    date: "2024",
    description: "Slow mornings, spontaneous plans, and photo rolls full of little celebrations.",
    photos: [
      {
        src: "images%20of%20us/2024ny.JPG",
        alt: "2024 new year",
        annotationText: "跨年",
        annotationNote: "在你家跨年",
      },
      {
        src: "images%20of%20us/2024mash.jpg",
        alt: "2024 face mask",
        annotationText: "面膜",
        annotationNote: "两个人傻敷着面膜笑到面膜皱掉，时间也皱掉",
      },
      {
        src: "images%20of%20us/2024beach.jpg",
        alt: "2024 beach",
        annotationText: "黄昏",
        annotationNote: "学校黄昏太灿烂，我偷看你侧脸，比夕阳更晃眼",
      },
      {
        src: "images%20of%20us/2024grocery.jpg",
        alt: "2024 grocery",
        annotationText: "炖锅",
        annotationNote: "你跑那么远，只为陪我做一锅 Korean stew pot",
      },
      {
        src: "images%20of%20us/2024twins.jpg",
        alt: "2024 twin peaks",
        annotationText: "山顶",
        annotationNote: "爬到山顶才发现，最好的风景是身边喘着气的你",
      },
      {
        src: "images%20of%20us/2024bday.JPG",
        alt: "2024 birthday",
        annotationText: "20 岁",
        annotationNote: "20 岁你陪了我整整一个月，那是我收过最奢侈的礼物",
      },
    ],
  },
  {
    year: "2025",
    title: "The year of postcards",
    date: "2025",
    description: "Moments came in layers like scrapbook pages, from calm weekdays to joyful trips.",
    photos: [
      {
        src: "images%20of%20us/2025school.jpg",
        alt: "2025 school",
        annotationText: "下课",
        annotationNote: "海棠花落在你的伞上，我接你下课，像接我的整个春天",
      },
      {
        src: "images%20of%20us/2025okla.jpg",
        alt: "2025 spring break Oklahoma",
        annotationText: "春假",
        annotationNote: "疯到 Oklahoma 看小狗，原来跟你去哪儿都是正经事",
      },
      {
        src: "images%20of%20us/2025carmel.jpeg",
        alt: "2025 Carmel",
        annotationText: "Carmel",
        annotationNote: "被小屁孩气到跳脚，你却在旁边笑，气也消了",
      },
      {
        src: "images%20of%20us/2025pickleball.JPG",
        alt: "2025 pickleball",
        annotationText: "匹克球",
        annotationNote: "两个人打得稀烂，却热爱得一塌糊涂。",
      },
    ],
  },
  {
    year: "2026",
    title: "To be continued",
    date: "2026",
    description: "",
    photos: [],
  },
];

const PROMISE_TEXTS = [
  "一次为你做饭的机会。",
  "一次立马消气的机会",
  "一次吹吹的机会",
  "一次为你全身按摩的机会",
  "一次为你做一道甜品的机会",
  "一次接你下课的机会",
  "一次带你去约会的机会",
  "一次给你求婚的机会",
  "一次哄你入睡的机会",
  "一次替你暖手的机会",
  "一次逗你笑的机会",
];

const PROMISE_STAMP_FILES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((n) => `promisestamps/${n}.png`);

const STAMP_LABELS = [...PROMISE_TEXTS, PROMISE_TEXTS[4]];

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Stamp scatter: centers in %; AABB approximates card + rotation so pairs only “kiss” at corners, not stack. */
function buildStampLayout(count, seed) {
  const rand = seededRand(seed);
  const positions = [];
  const halfW = 0.088;
  const halfH = 0.1;
  const maxOverlapRatio = 0.1;

  for (let i = 0; i < count; i += 1) {
    let placed = false;
    for (let att = 0; att < 520; att += 1) {
      const left = 10 + rand() * 78;
      const top = 12 + rand() * 70;
      const rot = -18 + rand() * 36;
      const cx = left / 100;
      const cy = top / 100;
      const ok = positions.every((p) => {
        const pcx = p.left / 100;
        const pcy = p.top / 100;
        return (
          memoryRectOverlapRatio(
            pcx - halfW,
            pcy - halfH,
            2 * halfW,
            2 * halfH,
            cx - halfW,
            cy - halfH,
            2 * halfW,
            2 * halfH
          ) <= maxOverlapRatio
        );
      });
      if (ok) {
        positions.push({ left, top, rot });
        placed = true;
        break;
      }
    }
    if (!placed) {
      const cols = 3;
      const col = i % cols;
      const row = Math.floor(i / cols);
      let left = 14 + col * 28;
      let top = 14 + row * 24;
      let rot = (i % 7) * 5 - 15;
      for (let nudge = 0; nudge < 30; nudge += 1) {
        const cx = left / 100;
        const cy = top / 100;
        const fits = positions.every((p) => {
          const pcx = p.left / 100;
          const pcy = p.top / 100;
          return (
            memoryRectOverlapRatio(
              pcx - halfW,
              pcy - halfH,
              2 * halfW,
              2 * halfH,
              cx - halfW,
              cy - halfH,
              2 * halfW,
              2 * halfH
            ) <= maxOverlapRatio
          );
        });
        if (fits) break;
        left += (nudge % 3) * 4 - 4;
        top += Math.floor(nudge / 3) * 3;
      }
      positions.push({ left, top, rot });
    }
  }
  return positions;
}

function shuffleTextOrder(len, seed) {
  const idx = Array.from({ length: len }, (_, i) => i);
  const rand = seededRand(seed ^ 0x9e3779b9);
  for (let i = len - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const t = idx[i];
    idx[i] = idx[j];
    idx[j] = t;
  }
  return idx;
}

function hashYearString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33 + s.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

function memoryRectOverlapRatio(ax, ay, aw, ah, bx, by, bw, bh) {
  const ix0 = Math.max(ax, bx);
  const iy0 = Math.max(ay, by);
  const ix1 = Math.min(ax + aw, bx + bw);
  const iy1 = Math.min(ay + ah, by + bh);
  if (ix1 <= ix0 || iy1 <= iy0) return 0;
  const inter = (ix1 - ix0) * (iy1 - iy0);
  const a1 = aw * ah;
  const a2 = bw * bh;
  return inter / Math.min(a1, a2);
}

function buildMemoryPhotoLayout(photoCount, seed) {
  const rand = seededRand(seed);
  const maxOverlap = 0.2;
  const w = 0.33;
  const h = 0.36;
  const positions = [];
  for (let i = 0; i < photoCount; i += 1) {
    let placed = false;
    for (let att = 0; att < 320; att += 1) {
      const left = 0.03 + rand() * Math.max(0.01, 1 - w - 0.06);
      const top = 0.05 + rand() * Math.max(0.01, 1 - h - 0.08);
      const rot = -14 + rand() * 28;
      let bad = false;
      for (const p of positions) {
        if (memoryRectOverlapRatio(p.left, p.top, w, h, left, top, w, h) > maxOverlap) {
          bad = true;
          break;
        }
      }
      if (!bad) {
        positions.push({ left, top, width: w, rot, z: 18 + i, opacity: 0.92 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      positions.push({
        left: 0.04 + (i % 3) * 0.3,
        top: 0.08 + Math.floor(i / 3) * 0.38,
        width: w,
        rot: (i % 6) * 5 - 12,
        z: 18 + i,
        opacity: 0.9,
      });
    }
  }
  return positions;
}

const memories = yearMemories.map((memory) => {
  const layout =
    memory.photos.length > 0 ? buildMemoryPhotoLayout(memory.photos.length, hashYearString(`${memory.year}-${memory.photos.length}`)) : null;
  return {
    ...memory,
    id: `memory-${memory.year}`,
    photos: memory.photos.map((photo, index) => ({
      ...photo,
      frameLayout: layout ? layout[index] : null,
      className: layout ? null : photoSlots[index % photoSlots.length],
      annotationText: photo.annotationText || photo.alt,
      annotationNote: photo.annotationNote || `${memory.year} · ${photo.alt}`,
    })),
  };
});

/** Year columns + promise stamps (closing line lives inside the stamps panel; no extra column) */
const MEMORY_STRIP_PANEL_COUNT = memories.length + 1;

/** Scroll share per horizontal gap; last gap (2026 → stamps) is one “year step”, not a full extra year. */
function buildStripeGapWeights(stripPanelCount) {
  const g = [];
  for (let i = 0; i < stripPanelCount - 2; i += 1) g.push(1);
  g.push(0.4);
  return g;
}

function gapScrollCumulative(g) {
  const sum = g.reduce((a, b) => a + b, 0);
  const cum = [0];
  for (const wt of g) cum.push(cum[cum.length - 1] + wt / sum);
  cum[cum.length - 1] = 1;
  return cum;
}

function progressToLaneOffset(p, cum) {
  const segCount = cum.length - 1;
  const clamped = Math.min(1, Math.max(0, p));
  if (clamped <= cum[0]) return 0;
  for (let k = 0; k < segCount; k += 1) {
    if (clamped <= cum[k + 1] + 1e-9) {
      const lo = cum[k];
      const hi = cum[k + 1];
      const d = hi - lo || 1e-9;
      const t = (clamped - lo) / d;
      return k + Math.min(1, Math.max(0, t));
    }
  }
  return segCount;
}

function annotationSideForPhoto(photoSrc) {
  let h = 2166136261;
  for (let i = 0; i < photoSrc.length; i += 1) {
    h ^= photoSrc.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 2 === 0 ? "left" : "right";
}

function PhotoCard({ photo, scrollYProgress, laneIndex, laneCum }) {
  const [frameRatio, setFrameRatio] = useState("4 / 5");
  const start = laneCum[laneIndex];
  const end = laneCum[laneIndex + 1];
  const driftY = useTransform(scrollYProgress, [start, end], [18, -18]);
  const scale = useTransform(scrollYProgress, [start, start + 0.5 * (end - start), end], [0.96, 1.03, 0.98]);
  const side = annotationSideForPhoto(photo.src);
  const annotFirst = side === "left";
  const annotTextAlign = side === "left" ? "text-right" : "text-left";

  const originX = annotFirst ? "right" : "left";
  const annotCol = html`
    <div
      className=${`pointer-events-none z-10 flex w-[min(11.5rem,38%)] shrink-0 flex-col gap-2 ${annotTextAlign}`}
    >
      <button
        type="button"
        className="pointer-events-auto w-full rounded-xl border border-[#cbb89a] bg-[#efe4d4] px-2.5 py-2 text-[13px] leading-snug text-[#5c4638] shadow-sm transition hover:brightness-[1.03] font-handwritten break-words"
      >
        <span className="mr-1 inline-block rotate-12 text-[15px]">↷</span>
        ${photo.annotationText}
      </button>
      <div
        className="pointer-events-none max-h-[min(40vh,15rem)] overflow-y-auto overscroll-contain rounded-xl border border-[#c9b896] bg-[#f7efd9] px-2.5 py-2 text-xs leading-relaxed text-[#4a3d30] opacity-0 shadow-sm transition duration-300 group-hover:opacity-100 group-hover:shadow-md font-chinese-handwrite break-words"
        lang="zh-Hant"
      >
        ${photo.annotationNote}
      </div>
    </div>
  `;

  const imageCol = html`
    <div className="flex min-w-0 flex-1 basis-0 justify-center">
      <div
        className="max-w-full rounded-[20px] bg-white/70 p-2 shadow-floaty backdrop-blur-[1px] transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.07] group-hover:shadow-[0_20px_44px_rgba(120,100,80,0.2)]"
        style=${{ transformOrigin: `${originX} center` }}
      >
        <div className="w-full overflow-hidden rounded-[14px]" style=${{ aspectRatio: frameRatio }}>
          <img
            src=${photo.src}
            alt=${photo.alt}
            onLoad=${(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              setFrameRatio(naturalWidth >= naturalHeight ? "5 / 4" : "4 / 5");
            }}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  `;

  const innerRow = html`
    <div className="flex min-w-0 w-full flex-row items-center gap-3 overflow-visible md:gap-4">
      ${[annotFirst ? annotCol : imageCol, annotFirst ? imageCol : annotCol]}
    </div>
  `;

  const fl = photo.frameLayout;
  if (fl) {
    return html`
      <${motion.div}
        className="group absolute max-w-[min(92vw,560px)]"
        style=${{
          left: `${fl.left * 100}%`,
          top: `${fl.top * 100}%`,
          width: `${fl.width * 100}%`,
          y: driftY,
          scale,
          zIndex: fl.z,
        }}
        whileHover=${{ zIndex: 120 }}
        transition=${{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div style=${{ transform: `rotate(${fl.rot}deg)` }}>${innerRow}</div>
      </${motion.div}>
    `;
  }

  return html`
    <${motion.figure}
      style=${{ y: driftY, scale }}
      whileHover=${{ zIndex: 120 }}
      transition=${{ type: "spring", stiffness: 260, damping: 22 }}
      className=${`group absolute ${photo.className} flex min-w-0 flex-row items-center gap-3 overflow-visible md:gap-4`}
    >
      ${innerRow}
    </${motion.figure}>
  `;
}

function ToBeContinuedPanel() {
  return html`
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center px-4 py-4">
      <p className="font-chinese-handwrite m-0 max-w-xl text-center text-lg leading-relaxed text-[#6b5844] md:text-xl" lang="zh-Hant">
        下一页，我们慢慢写。
      </p>
      <p className="font-handwritten mt-6 text-2xl tracking-[0.12em] text-[#8a7358] md:mt-8 md:text-3xl">To be continued</p>
    </div>
  `;
}

function PromiseStampsPanel({ scrollYProgress, laneCum }) {
  const layout = useMemo(() => buildStampLayout(PROMISE_STAMP_FILES.length, 778652026), []);
  const order = useMemo(() => shuffleTextOrder(STAMP_LABELS.length, 3141592653), []);
  const stampPanelIndex = memories.length;
  const lo = laneCum[stampPanelIndex];
  const hi = laneCum[stampPanelIndex + 1];
  const hiEase = Math.min(lo + (hi - lo) * 0.55, hi);
  const quoteOpacity = useTransform(scrollYProgress, [lo, hiEase, hi, 1], [0, 1, 1, 1]);
  const quoteY = useTransform(scrollYProgress, [lo, hiEase, hi, 1], [10, 0, 0, 0]);

  return html`
    <div className="flex h-full min-h-0 w-full flex-col px-2 pt-2 md:px-4 md:pt-3">
      <p className="font-handwritten shrink-0 text-center text-lg text-[#4a5f78] md:text-left md:text-xl">Promise stamps</p>
      <div className="relative mx-auto mt-1 min-h-0 w-full max-w-6xl flex-1 md:mt-2">
        ${PROMISE_STAMP_FILES.map((src, i) => {
          const label = STAMP_LABELS[order[i]];
          const pos = layout[i];
          return html`<${PromiseStamp} key=${src} src=${src} text=${label} pos=${pos} z=${20 + i} />`;
        })}
      </div>
      <footer className="shrink-0 border-t border-[#a8c4dc]/40 px-2 py-2 md:px-3 md:py-2">
        <${motion.p}
          style=${{ opacity: quoteOpacity, y: quoteY }}
          className="font-chinese-handwrite m-0 text-center text-2xl leading-snug text-[#5a4a3a] md:text-3xl md:leading-relaxed"
          lang="zh-Hant"
        >
          愿我们像星月相依，长长久久，岁岁彼此环绕。
        </${motion.p}>
      </footer>
    </div>
  `;
}

function PromiseStamp({ src, text, pos, z }) {
  return html`
    <div
      className="group absolute w-[clamp(5.5rem,15vw,10.5rem)] cursor-pointer"
      style=${{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        transform: `translate(-50%, -50%) rotate(${pos.rot}deg)`,
        zIndex: z,
      }}
    >
      <div className="relative">
        <img
          src=${src}
          alt=""
          className="relative z-10 w-full select-none object-contain drop-shadow-[0_10px_22px_rgba(40,60,90,0.25)] transition-opacity duration-300 group-hover:opacity-20"
        />
        <p
          className="font-chinese-handwrite pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 px-2 text-center text-sm font-medium leading-relaxed text-[#2c2438] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:text-base"
          lang="zh-Hant"
        >
          ${text}
        </p>
      </div>
    </div>
  `;
}

function PhotoCluster({ memory, scrollYProgress, laneIndex, laneCum }) {
  if (!memory.photos?.length) return null;
  return html`
    <div className="absolute inset-x-0 top-[3%] bottom-[6%]">
      ${memory.photos.map(
        (photo) =>
          html`<${PhotoCard}
            key=${photo.src}
            photo=${photo}
            scrollYProgress=${scrollYProgress}
            laneIndex=${laneIndex}
            laneCum=${laneCum}
          />`
      )}
    </div>
  `;
}

function MemoryLaneSection({ introCleared }) {
  const sectionRef = useRef(null);
  const stripPanelCount = MEMORY_STRIP_PANEL_COUNT;
  const sectionHeight = useMemo(() => `${stripPanelCount * 100}vh`, [stripPanelCount]);
  const musicStartedRef = useRef(false);

  const gapWeights = useMemo(() => buildStripeGapWeights(stripPanelCount), [stripPanelCount]);
  const laneCum = useMemo(() => gapScrollCumulative(gapWeights), [gapWeights]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const laneX = useTransform(scrollYProgress, (p) => `${-progressToLaneOffset(p, laneCum) * 100}%`);

  useEffect(() => {
    initBackgroundSpotifyOnce();
  }, []);

  useEffect(() => {
    if (!introCleared) return undefined;

    const tryStartHiddenSpotify = () => {
      if (musicStartedRef.current) return;
      musicStartedRef.current = true;
      const run = () => {
        try {
          const p = window.__bgSpotifyTryPlay?.();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (_) {
          /* ignore */
        }
      };
      if (window.__bgSpotifyReady) run();
      else window.addEventListener("bg-spotify-ready", run, { once: true });
    };

    const onScrollProgress = (v) => {
      if (musicStartedRef.current) return;
      if (v > 0.0004) tryStartHiddenSpotify();
    };
    onScrollProgress(scrollYProgress.get());
    const unsubScroll = scrollYProgress.on("change", onScrollProgress);

    const el = sectionRef.current;
    let io = null;
    if (el) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && e.intersectionRatio > 0.008) tryStartHiddenSpotify();
          }
        },
        { threshold: [0, 0.01, 0.05] }
      );
      io.observe(el);
    }

    return () => {
      unsubScroll();
      if (io && el) io.disconnect();
    };
  }, [introCleared, scrollYProgress]);

  return html`
    <section ref=${sectionRef} style=${{ height: sectionHeight }} className="relative bg-paper">
      <div className="sticky top-0 h-screen overflow-hidden grain">
        <${motion.div} style=${{ x: laneX, width: `${stripPanelCount * 100}vw` }} className="flex h-full">
          ${memories.map(
            (memory, index) => html`
              <article key=${memory.id} className="relative h-full w-screen shrink-0 overflow-hidden bg-gradient-to-b from-[#faf5ed] to-[#f2e8d8]">
                <p className="font-serif-editorial absolute left-6 top-4 z-50 m-0 text-5xl text-[#8e7558]/40 md:left-8 md:top-5 md:text-7xl">
                  ${memory.year}
                </p>
                ${memory.photos?.length
                  ? html`<${PhotoCluster}
                      memory=${memory}
                      scrollYProgress=${scrollYProgress}
                      laneIndex=${index}
                      laneCum=${laneCum}
                    />`
                  : html`<${ToBeContinuedPanel} />`}
              </article>
            `
          )}
          <article
            key="memory-stamps"
            className="relative flex h-full w-screen shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#dceaf8] via-[#d2e4f6] to-[#c5daf0]"
          >
            <${PromiseStampsPanel} scrollYProgress=${scrollYProgress} laneCum=${laneCum} />
          </article>
        </${motion.div}>
      </div>
    </section>
  `;
}

function App() {
  const [segmentIdx, setSegmentIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    if (!showIntro) return;
    if (segmentIdx >= INTRO_SEGMENTS.length) {
      setShowIntro(false);
      return;
    }
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
    }
    const hold = randomHoldMs();
    holdTimerRef.current = window.setTimeout(() => {
      if (segmentIdx < INTRO_SEGMENTS.length - 1) {
        setSegmentIdx((n) => n + 1);
      } else {
        setShowIntro(false);
      }
    }, INTRO_FADE_IN_MS + hold);
    return () => {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, [segmentIdx, showIntro]);

  const seg = INTRO_SEGMENTS[segmentIdx];

  return html`
    <div className="relative">
      <${motion.section}
        animate=${{ opacity: showIntro ? 1 : 0 }}
        transition=${{ duration: 1.1, ease: "easeInOut" }}
        className=${`fixed inset-0 z-[90] overflow-y-auto bg-paper ${showIntro ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 md:px-10 md:py-10">
          <div className="w-full max-w-4xl rounded-[24px] border border-[#e4d6c4] bg-[#fff9ef]/92 px-5 py-6 shadow-soft md:px-10 md:py-8">
            <${AnimatePresence} mode="wait">
              ${seg
                ? html`
                    <${motion.div}
                      key=${segmentIdx}
                      initial=${{ opacity: 0 }}
                      animate=${{ opacity: 1 }}
                      exit=${{ opacity: 0 }}
                      transition=${{ duration: 0.85, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-5 md:gap-7"
                    >
                      <p
                        className="font-chinese-handwrite m-0 w-full text-center text-lg leading-[1.9] text-[#5c4638] md:text-xl md:leading-[2]"
                        lang="zh-Hant"
                      >
                        ${seg.text}
                      </p>
                      <div className="flex w-full justify-center">
                        <${IntroVisual} visual=${seg.visual} />
                      </div>
                    </${motion.div}>
                  `
                : null}
            </${AnimatePresence}>
          </div>
        </div>
      </${motion.section}>

      <main className="bg-paper">
        <header className="px-6 pb-1 pt-4 md:px-12 md:pt-5">
          <p className="font-handwritten m-0 text-2xl text-[#9b7f61]">Memory Lane</p>
          <p className="font-chinese-handwrite m-0 text-3xl text-[#8b6a52]" lang="zh-Hant">甄宇良</p>
        </header>
        <${MemoryLaneSection} introCleared=${!showIntro} />
      </main>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
