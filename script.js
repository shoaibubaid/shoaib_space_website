// ---- markdown post loading ----
// Add a new post: write a .md file in posts/<category>/, then add its
// path to manifest.json under the right category's "posts" array.
// Each .md file starts with a frontmatter block:
//
//   ---
//   title: My post title
//   era: some date or label
//   readTime: 5 min read
//   excerpt: One line shown in the list view.
//   ---
//
// followed by normal markdown: ## headings, images ![alt](url),
// links [text](url), code blocks, blockquotes, etc.

let manifestCache = null;
const postCache = {};

async function loadManifest() {
  if (manifestCache) return manifestCache;
  const res = await fetch("manifest.json", { cache: "no-store" });
  manifestCache = await res.json();
  return manifestCache;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  match[1].split("\n").forEach(line => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return { meta, body: match[2].trim() };
}

async function loadPost(path) {
  if (postCache[path]) return postCache[path];
  const res = await fetch(path, { cache: "no-store" });
  const raw = await res.text();
  const parsed = parseFrontmatter(raw);
  postCache[path] = parsed;
  return parsed;
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

// ---- ambience background (snow / embers / rain) ----
// The visitor picks this from the topbar; their choice is remembered.
const bgLayer = document.getElementById("bg-layer");
const ambienceBtn = document.getElementById("ambience-btn");
const ambienceBtnIcon = document.getElementById("ambience-btn-icon");
const ambienceBtnLabel = document.getElementById("ambience-btn-label");
const ambienceMenu = document.getElementById("ambience-menu");
let ambienceTimer = null;

const AMBIENCE_META = {
  snow: { icon: "ti-snowflake", label: "snow" },
  embers: { icon: "ti-flame", label: "embers" },
  rain: { icon: "ti-cloud-rain", label: "rain" },
  none: { icon: "ti-sparkles", label: "none" }
};

function clearAmbience() {
  if (ambienceTimer) clearInterval(ambienceTimer);
  bgLayer.innerHTML = "";
}

// medium-high density flakes drifting down
function startSnow() {
  clearAmbience();
  const make = () => {
    const f = document.createElement("div");
    f.className = "snowflake";
    const size = 2.5 + Math.random() * 3.5;
    f.style.width = size + "px";
    f.style.height = size + "px";
    f.style.left = Math.random() * 100 + "vw";
    f.style.opacity = 0.35 + Math.random() * 0.5;
    const dur = 9 + Math.random() * 9;
    const drift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40);
    f.style.transition = `transform ${dur}s linear, opacity 1s ease`;
    bgLayer.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translate(${drift}px, 105vh)`;
    });
    setTimeout(() => f.remove(), dur * 1000);
  };
  for (let i = 0; i < 55; i++) setTimeout(make, i * 130);
  ambienceTimer = setInterval(make, 220);
}

function startEmbers() {
  clearAmbience();
  const make = () => {
    const f = document.createElement("div");
    f.className = "ember";
    const size = 2 + Math.random() * 3;
    f.style.width = size + "px";
    f.style.height = size + "px";
    f.style.left = Math.random() * 100 + "vw";
    f.style.background = Math.random() > 0.5 ? "#e8963d" : "#d9714f";
    f.style.opacity = "0";
    const dur = 6 + Math.random() * 6;
    const drift = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 30);
    f.style.transition = `transform ${dur}s ease-out, opacity ${dur * 0.3}s ease`;
    bgLayer.appendChild(f);
    requestAnimationFrame(() => {
      f.style.opacity = "0.7";
      f.style.transform = `translate(${drift}px, -105vh)`;
    });
    setTimeout(() => f.remove(), dur * 1000);
  };
  for (let i = 0; i < 15; i++) setTimeout(make, i * 400);
  ambienceTimer = setInterval(make, 500);
}

// fast, thin streaks falling straight down
function startRain() {
  clearAmbience();
  const make = () => {
    const f = document.createElement("div");
    f.className = "raindrop";
    f.style.height = 14 + Math.random() * 16 + "px";
    f.style.left = Math.random() * 100 + "vw";
    f.style.opacity = 0.2 + Math.random() * 0.3;
    const dur = 0.5 + Math.random() * 0.5;
    f.style.transition = `transform ${dur}s linear`;
    bgLayer.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translateY(115vh)`;
    });
    setTimeout(() => f.remove(), dur * 1000);
  };
  ambienceTimer = setInterval(make, 45);
}

function setAmbience(mode) {
  clearAmbience();
  if (mode === "snow") startSnow();
  else if (mode === "embers") startEmbers();
  else if (mode === "rain") startRain();

  const meta = AMBIENCE_META[mode] || AMBIENCE_META.none;
  ambienceBtnIcon.className = "ti " + meta.icon;
  ambienceBtnLabel.textContent = meta.label;

  localStorage.setItem("ambience", mode);
  document.querySelectorAll("#ambience-menu button").forEach(b => {
    b.classList.toggle("active", b.dataset.ambience === mode);
  });
}

ambienceBtn.addEventListener("click", () => {
  ambienceMenu.hidden = !ambienceMenu.hidden;
});
document.addEventListener("click", (e) => {
  if (!ambienceMenu.hidden && !e.target.closest("#ambience-btn, #ambience-menu")) {
    ambienceMenu.hidden = true;
  }
});
document.querySelectorAll("#ambience-menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    setAmbience(btn.dataset.ambience);
    ambienceMenu.hidden = true;
  });
});

setAmbience(localStorage.getItem("ambience") || "snow");

// ---- theme picker (midnight / arcade / space) ----
const themeBtn = document.getElementById("theme-btn");
const themeBtnIcon = document.getElementById("theme-btn-icon");
const themeBtnLabel = document.getElementById("theme-btn-label");
const themeMenu = document.getElementById("theme-menu");

const THEME_META = {
  midnight: { icon: "ti-moon", label: "midnight" },
  arcade: { icon: "ti-bulb", label: "arcade" },
  space: { icon: "ti-rocket", label: "space" }
};

// ---- space theme: crossfading background/planet, drifting ships/meteors ----
// Add more art any time: drop a file into assets/space/<category>/ and add
// its filename to the matching array in space.json. No code changes needed.
let spaceAssetsCache = null;
let spaceTimers = [];
let spaceActive = false;
let arcadeActive = false;

async function loadSpaceAssets() {
  if (spaceAssetsCache) return spaceAssetsCache;
  try {
    const res = await fetch("space.json", { cache: "no-store" });
    spaceAssetsCache = await res.json();
  } catch (e) {
    spaceAssetsCache = { planets: [], spaceships: [], backgrounds: [], meteors: [] };
  }
  return spaceAssetsCache;
}

function clearSpaceTimers() {
  spaceTimers.forEach(t => clearInterval(t));
  spaceTimers = [];
}

// crossfades between two stacked layers, cycling through a file list —
// used for both the background and the corner planet
function startSpaceCrossfade(layerA, layerB, files, basePath, intervalMs) {
  if (!files || files.length === 0) return;
  let showingA = true;
  let idx = 0;
  layerA.style.backgroundImage = `url("${basePath}/${files[idx]}")`;
  layerA.classList.add("active");
  const timer = setInterval(() => {
    idx = (idx + 1) % files.length;
    const next = showingA ? layerB : layerA;
    const current = showingA ? layerA : layerB;
    next.style.backgroundImage = `url("${basePath}/${files[idx]}")`;
    next.classList.add("active");
    current.classList.remove("active");
    showingA = !showingA;
  }, intervalMs);
  spaceTimers.push(timer);
}

// spawns images that drift slowly across the screen, fading in and out —
// used for both spaceships (slow) and meteors (fast, diagonal)
function startSpaceDrift(container, files, basePath, opts) {
  if (!files || files.length === 0) return;
  const spawn = () => {
    if (!spaceActive) return;
    const file = files[Math.floor(Math.random() * files.length)];
    const img = document.createElement("img");
    img.src = `${basePath}/${file}`;
    img.alt = "";
    img.className = "space-drift" + (opts.extraClass ? " " + opts.extraClass : "");
    const size = opts.minSize + Math.random() * (opts.maxSize - opts.minSize);
    img.style.width = size + "px";

    // pick a random direction and a random point to pass near — every
    // spawn gets its own straight-line path at its own angle
    const angle = Math.random() * Math.PI * 2;
    const angleDeg = angle * 180 / Math.PI;
    const travel = Math.max(window.innerWidth, window.innerHeight) * 1.3;
    const dx = Math.cos(angle) * travel;
    const dy = Math.sin(angle) * travel;
    const passX = window.innerWidth * (0.1 + Math.random() * 0.8);
    const passY = window.innerHeight * (0.05 + Math.random() * 0.7);
    const rotateVal = opts.rotateWithTravel === false ? (opts.tilt || 0) : angleDeg + (opts.tilt || 0);

    // position pinned at the pass point; the actual motion happens entirely
    // through one transform transition (translate + a constant rotate), so
    // there's only ever one interpolation driving the path — guaranteed straight
    img.style.left = passX + "px";
    img.style.top = passY + "px";
    img.style.transform = `translate(${-dx / 2}px, ${-dy / 2}px) rotate(${rotateVal}deg)`;

    container.appendChild(img);
    void img.offsetWidth; // force a reflow so the browser commits the starting position before the transition is applied — without this, some spawns randomly skip straight to the end state and never visibly animate
    img.style.transition = `transform ${opts.duration}s linear, opacity 1.5s ease`;
    img.style.opacity = String(opts.opacity || 0.9);
    img.style.transform = `translate(${dx / 2}px, ${dy / 2}px) rotate(${rotateVal}deg)`;
    setTimeout(() => { img.style.opacity = "0"; }, Math.max(0, opts.duration - 1.5) * 1000);
    setTimeout(() => img.remove(), (opts.duration + 1.5) * 1000);
  };
  spawn();
  const timer = setInterval(spawn, opts.everyMs);
  spaceTimers.push(timer);
}

// walks sprites left-to-right or right-to-left along a fixed ground band —
// used for arcade robots. The wrapper div carries the JS-driven horizontal
// position; the inner image carries a CSS-animated bob + facing-direction
// flip, so nothing fights over the "transform" property.
function startGroundWalk(container, files, basePath, opts) {
  if (!files || files.length === 0) return;
  const spawn = () => {
    if (!arcadeActive) return;
    const file = files[Math.floor(Math.random() * files.length)];
    const size = opts.minSize + Math.random() * (opts.maxSize - opts.minSize);
    const bandMin = opts.groundBand ? opts.groundBand[0] : 0.82;
    const bandMax = opts.groundBand ? opts.groundBand[1] : 0.9;
    const groundY = window.innerHeight * (bandMin + Math.random() * (bandMax - bandMin));
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -size - 20 : window.innerWidth + 20;
    const endX = fromLeft ? window.innerWidth + 20 : -size - 20;

    const wrap = document.createElement("div");
    wrap.style.position = "absolute";
    wrap.style.left = startX + "px";
    wrap.style.top = groundY + "px";
    wrap.style.opacity = "0";
    wrap.style.pointerEvents = "none";

    const img = document.createElement("img");
    img.src = `${basePath}/${file}`;
    img.alt = "";
    img.className = "arcade-walk-bob " + (fromLeft ? "dir-right" : "dir-left");
    img.style.width = size + "px";
    img.style.display = "block";

    wrap.appendChild(img);
    container.appendChild(wrap);
    void wrap.offsetWidth; // same forced-reflow fix as startSpaceDrift, for the same reason
    wrap.style.transition = `left ${opts.duration}s linear, opacity 1.5s ease`;
    wrap.style.opacity = String(opts.opacity || 0.9);
    wrap.style.left = endX + "px";

    setTimeout(() => { wrap.style.opacity = "0"; }, Math.max(0, opts.duration - 1.5) * 1000);
    setTimeout(() => wrap.remove(), (opts.duration + 1.5) * 1000);
  };
  spawn();
  const timer = setInterval(spawn, opts.everyMs);
  spaceTimers.push(timer);
}

async function startSpaceTheme() {
  spaceActive = true;
  const assets = await loadSpaceAssets();
  if (!spaceActive) return; // theme may have been switched away while loading

  const bgA = document.getElementById("space-bg-a");
  const bgB = document.getElementById("space-bg-b");
  const driftLayer = document.getElementById("space-drift-layer");

  startSpaceCrossfade(bgA, bgB, assets.backgrounds, "assets/space/backgrounds", 75000);
  startSpaceDrift(driftLayer, assets.planets, "assets/space/planets", { minSize: 70, maxSize: 170, duration: 55, everyMs: 16000, opacity: 0.95, extraClass: "space-drift-planet", rotateWithTravel: false });
  startSpaceDrift(driftLayer, assets.spaceships, "assets/space/spaceships", { minSize: 30, maxSize: 130, duration: 34, everyMs: 9000, opacity: 0.85 });
  startSpaceDrift(driftLayer, assets.meteors, "assets/space/meteors", { minSize: 16, maxSize: 60, duration: 5, everyMs: 3000, opacity: 0.9 });
}

function stopSpaceTheme() {
  spaceActive = false;
  clearSpaceTimers();
  ["space-bg-a", "space-bg-b"].forEach(id => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById("space-drift-layer").innerHTML = "";
}

// ---- arcade theme extras: video background (with image fallback), and
// robots walking along the floor ----
// Add more art any time: drop a file into assets/arcade/<category>/ and add
// its filename to arcade.json. No code changes needed.
let arcadeAssetsCache = null;

async function loadArcadeAssets() {
  if (arcadeAssetsCache) return arcadeAssetsCache;
  try {
    const res = await fetch("arcade.json", { cache: "no-store" });
    arcadeAssetsCache = await res.json();
  } catch (e) {
    arcadeAssetsCache = { backgroundVideo: "", backgroundImages: [], robots: [] };
  }
  return arcadeAssetsCache;
}

async function startArcadeTheme() {
  arcadeActive = true;
  const assets = await loadArcadeAssets();
  if (!arcadeActive) return; // theme may have been switched away while loading

  const video = document.getElementById("arcade-bg-video");
  const bgA = document.getElementById("arcade-bg-a");
  const bgB = document.getElementById("arcade-bg-b");
  const driftLayer = document.getElementById("space-drift-layer");

  const useImageFallback = () => {
    video.classList.remove("active");
    startSpaceCrossfade(bgA, bgB, assets.backgroundImages, "assets/arcade/background", 60000);
  };

  if (assets.backgroundVideo) {
    video.src = `assets/arcade/background/${assets.backgroundVideo}`;
    video.onerror = useImageFallback;
    video.play()
      .then(() => { if (arcadeActive) video.classList.add("active"); })
      .catch(useImageFallback);
  } else {
    useImageFallback();
  }

  startGroundWalk(driftLayer, assets.robots, "assets/arcade/robots", {
    minSize: 50, maxSize: 95, duration: 13, everyMs: 5000, opacity: 0.9, groundBand: [0.8, 0.9]
  });
}

function stopArcadeTheme() {
  arcadeActive = false;
  clearSpaceTimers();
  const video = document.getElementById("arcade-bg-video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.classList.remove("active");
  ["arcade-bg-a", "arcade-bg-b"].forEach(id => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById("space-drift-layer").innerHTML = "";
}

function setTheme(theme) {
  if (theme === "midnight") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }

  if (theme === "space") { startSpaceTheme(); stopArcadeTheme(); }
  else if (theme === "arcade") { startArcadeTheme(); stopSpaceTheme(); }
  else { stopSpaceTheme(); stopArcadeTheme(); }

  const meta = THEME_META[theme] || THEME_META.midnight;
  themeBtnIcon.className = "ti " + meta.icon;
  themeBtnLabel.textContent = meta.label;

  localStorage.setItem("theme", theme);
  document.querySelectorAll("#theme-menu button").forEach(b => {
    b.classList.toggle("active", b.dataset.theme === theme);
  });
}

themeBtn.addEventListener("click", () => {
  themeMenu.hidden = !themeMenu.hidden;
});
document.addEventListener("click", (e) => {
  if (!themeMenu.hidden && !e.target.closest("#theme-btn, #theme-menu")) {
    themeMenu.hidden = true;
  }
});
document.querySelectorAll("#theme-menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    setTheme(btn.dataset.theme);
    themeMenu.hidden = true;
  });
});

setTheme(localStorage.getItem("theme") || "midnight");

// ---- floating decorative props ----
// Add a new prop: drop an image into assets/floats/, then list its filename
// in a post's frontmatter, e.g.  floats: monitor.svg, keyboard.svg, mouse.svg
// A random one from that list appears beside whichever section is currently
// being read, then fades out as the reader scrolls past it.

function wrapContentSections(container) {
  const nodes = Array.from(container.childNodes);
  const frag = document.createDocumentFragment();
  let current = null;
  nodes.forEach(node => {
    if (node.nodeType === 1 && node.tagName === "H2") {
      current = document.createElement("div");
      current.className = "content-section";
      frag.appendChild(current);
    }
    if (!current) {
      current = document.createElement("div");
      current.className = "content-section";
      frag.appendChild(current);
    }
    current.appendChild(node);
  });
  container.innerHTML = "";
  container.appendChild(frag);
  return Array.from(container.querySelectorAll(".content-section"));
}

let floatObserver = null;
let floatsLayerEl = null;
const activeFloats = []; // { sec, wrap, baseSectionTop, side, imgSize, topFraction }

// props scroll a little slower than the page itself, for a subtle
// parallax "lag" — 1 = moves exactly with the page, lower = slower.
const FLOAT_PARALLAX_FACTOR = 0.45;
const FLOAT_GAP_RIGHT = 1;  // distance kept from the article's right edge
const FLOAT_GAP_LEFT = 1;   // distance kept from the article's left edge (note: this will sit on/near the TOC)
const FLOAT_MIN_VIEWPORT_WIDTH = 820; // below this width, props switch to centered/behind-text mode instead of side-margin mode

function getFloatsLayer() {
  if (!floatsLayerEl) {
    floatsLayerEl = document.createElement("div");
    floatsLayerEl.id = "floats-layer";
    document.body.appendChild(floatsLayerEl);
  }
  return floatsLayerEl;
}

function computeFloatLeft(side, imgSize, articleRect) {
  return side === "right"
    ? articleRect.right + FLOAT_GAP_RIGHT
    : Math.max(8, articleRect.left - imgSize - FLOAT_GAP_LEFT);
}

function updateFloatParallax() {
  activeFloats.forEach(({ sec, wrap, baseSectionTop }) => {
    const currentTop = sec.getBoundingClientRect().top;
    const scrolledSince = baseSectionTop - currentTop;
    const lag = scrolledSince * (1 - FLOAT_PARALLAX_FACTOR);
    wrap.style.transform = `translateY(${lag}px)`;
  });
  requestAnimationFrame(updateFloatParallax);
}
requestAnimationFrame(updateFloatParallax);

// recalculates every currently-visible prop's position against the
// present layout — needed because zooming/resizing changes the article
// and TOC widths, so a position computed before the zoom is now stale.
function repositionActiveFloats() {
  const articleEl = document.getElementById("post-article");
  if (!articleEl || activeFloats.length === 0) return;

  const narrow = window.innerWidth < FLOAT_MIN_VIEWPORT_WIDTH;
  const articleRect = articleEl.getBoundingClientRect();
  const rightClearance = window.innerWidth - articleRect.right;
  const leftClearance = articleRect.left;

  activeFloats.slice().forEach(entryObj => {
    const { sec, wrap, side, imgSize, topFraction } = entryObj;

    // a prop spawned for the "other" layout mode doesn't make sense anymore
    // (a centered behind-text prop on desktop, or a margin prop on mobile) —
    // clear it out; it'll respawn correctly for the current mode next time
    // its section re-intersects.
    const modeMismatch = narrow ? side !== "center" : side === "center";
    if (modeMismatch) {
      wrap.style.opacity = "0";
      const idx = activeFloats.indexOf(entryObj);
      if (idx !== -1) activeFloats.splice(idx, 1);
      setTimeout(() => wrap.remove(), 400);
      if (sec._floatWraps) sec._floatWraps = sec._floatWraps.filter(w => w !== wrap);
      return;
    }

    let leftPx;
    if (narrow) {
      leftPx = articleRect.left + Math.random() * Math.max(0, articleRect.width - imgSize);
    } else {
      const minNeeded = imgSize + 24;
      const stillHasRoom = side === "right" ? rightClearance >= minNeeded : leftClearance >= minNeeded;
      if (!stillHasRoom) {
        wrap.style.opacity = "0";
        const idx = activeFloats.indexOf(entryObj);
        if (idx !== -1) activeFloats.splice(idx, 1);
        setTimeout(() => wrap.remove(), 400);
        if (sec._floatWraps) sec._floatWraps = sec._floatWraps.filter(w => w !== wrap);
        return;
      }
      leftPx = computeFloatLeft(side, imgSize, articleRect);
    }

    const sectionRect = sec.getBoundingClientRect();
    const docScrollY = window.scrollY || window.pageYOffset;
    wrap.style.left = leftPx + "px";
    wrap.style.top = (sectionRect.top + docScrollY + topFraction * sectionRect.height) + "px";
    entryObj.baseSectionTop = sectionRect.top; // reset so the parallax lag doesn't jump
  });
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(repositionActiveFloats, 120);
});

function setupFloatingProps(sections, floatList) {
  if (floatObserver) floatObserver.disconnect();
  activeFloats.length = 0;
  const layer = getFloatsLayer();
  layer.innerHTML = "";
  if (!floatList || floatList.length === 0) return;

  const articleEl = document.getElementById("post-article");
  const DESKTOP_OPACITY = 0.85;
  const MOBILE_BEHIND_OPACITY = 0.18; // subtle — meant to peek through gaps in the text, not compete with it
  const TYPICAL_IMG_SIZE = 100; // used only for spacing math — actual per-prop size still randomizes

  function spawnOneProp(sec, articleRect, narrow, topFraction) {
    const sectionRect = sec.getBoundingClientRect();
    const docScrollY = window.scrollY || window.pageYOffset;
    const topPx = sectionRect.top + docScrollY + sectionRect.height * topFraction;
    const file = floatList[Math.floor(Math.random() * floatList.length)];

    let side, imgSize, leftPx;

    if (narrow) {
      side = "center";
      imgSize = 60 + Math.random() * 70;
      leftPx = articleRect.left + Math.random() * Math.max(0, articleRect.width - imgSize);
    } else {
      const rightClearance = window.innerWidth - articleRect.right;
      const leftClearance = articleRect.left;
      imgSize = 50 + Math.random() * 100;
      const minNeeded = imgSize + 24;

      if (rightClearance >= minNeeded && leftClearance >= minNeeded) {
        side = Math.random() > 0.5 ? "left" : "right";
      } else if (rightClearance >= minNeeded) {
        side = "right";
      } else if (leftClearance >= minNeeded) {
        side = "left";
      } else {
        return null; // no real space on either side — skip rather than overlap content
      }
      leftPx = computeFloatLeft(side, imgSize, articleRect);
    }

    const wrap = document.createElement("div");
    wrap.className = "float-wrap";
    wrap.style.left = leftPx + "px";
    wrap.style.top = topPx + "px";

    const img = document.createElement("img");
    img.src = `assets/floats/${file}`;
    img.alt = "";
    img.className = "float-decor";
    img.style.width = imgSize + "px";
    img.style.transform = side === "left" ? "rotate(-10deg)" : (side === "right" ? "rotate(10deg)" : "rotate(6deg)");

    wrap.appendChild(img);
    layer.appendChild(wrap);
    const targetOpacity = narrow ? MOBILE_BEHIND_OPACITY : DESKTOP_OPACITY;
    requestAnimationFrame(() => { wrap.style.opacity = String(targetOpacity); });

    const entryObj = { sec, wrap, baseSectionTop: sectionRect.top, side, imgSize, topFraction };
    activeFloats.push(entryObj);
    wrap._entryObj = entryObj;
    return wrap;
  }

  floatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sec = entry.target;
      if (entry.isIntersecting) {
        if (sec._floatWraps && sec._floatWraps.length > 0) return;

        const narrow = window.innerWidth < FLOAT_MIN_VIEWPORT_WIDTH;
        const articleRect = articleEl.getBoundingClientRect();
        const sectionHeight = sec.getBoundingClientRect().height;

        // one slot roughly every 4x a typical prop's size — taller
        // sections (more content) naturally get more props, short
        // "coming soon" stubs get one or none
        const slotCount = Math.max(1, Math.round(sectionHeight / (4 * TYPICAL_IMG_SIZE)));

        sec._floatWraps = [];
        for (let i = 0; i < slotCount; i++) {
          // evenly spaced slots with a little jitter so it doesn't look like a grid
          const base = (i + 0.5) / slotCount;
          const jitter = (Math.random() - 0.5) * (0.7 / slotCount);
          const topFraction = Math.min(0.95, Math.max(0.05, base + jitter));

          const wrap = spawnOneProp(sec, articleRect, narrow, topFraction);
          if (wrap) sec._floatWraps.push(wrap);
        }
      } else if (sec._floatWraps && sec._floatWraps.length > 0) {
        sec._floatWraps.forEach(wrap => {
          wrap.style.opacity = "0";
          const idx = activeFloats.indexOf(wrap._entryObj);
          if (idx !== -1) activeFloats.splice(idx, 1);
          setTimeout(() => wrap.remove(), 700);
        });
        sec._floatWraps = null;
      }
    });
  }, { rootMargin: "-15% 0px -15% 0px", threshold: 0 });

  sections.forEach(sec => floatObserver.observe(sec));
}

// ---- nav ----
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

function showView(name) {
  views.forEach(v => v.hidden = v.id !== `view-${name}`);
  navLinks.forEach(l => l.classList.toggle("active", l.dataset.nav === name));
  window.scrollTo({ top: 0, behavior: "instant" });
  if (name !== "post") {
    document.getElementById("post-bg-layer").classList.remove("active");
  }
}

document.querySelectorAll("[data-nav]").forEach(el => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    showView(el.dataset.nav);
    if (el.dataset.nav === "projects") await renderProjects();
    if (el.dataset.nav === "speaking") await renderTalks();
    if (el.dataset.nav === "blog") await renderBlogGroups();
  });
});

// ---- projects view ----
// Add a new project: add an entry to projects.json. No new files needed.
let projectsCache = null;

async function renderProjects() {
  if (!projectsCache) {
    const res = await fetch("projects.json", { cache: "no-store" });
    projectsCache = await res.json();
  }

  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";

  projectsCache.forEach(p => {
    const card = document.createElement("a");
    card.href = p.link;
    card.target = "_blank";
    card.rel = "noopener";
    card.className = `category-card cat-${p.color || "amber"}`;
    card.innerHTML = `
      <i class="ti ${p.icon || "ti-code"}"></i>
      <span class="cat-name">${p.title}</span>
      <span class="post-item-excerpt">${p.description}</span>
      <span class="tag-row">${(p.tags || []).map(t => `<span class="tag tag-amber">${t}</span>`).join("")}</span>
    `;
    grid.appendChild(card);
  });
}

// ---- talks view ----
// Add a new talk: add an entry to talks.json. No new files needed.
let talksCache = null;

async function renderTalks() {
  if (!talksCache) {
    const res = await fetch("talks.json", { cache: "no-store" });
    talksCache = await res.json();
  }

  const grid = document.getElementById("talks-grid");
  grid.innerHTML = "";

  talksCache.forEach(t => {
    const card = document.createElement("a");
    card.href = t.link;
    card.target = "_blank";
    card.rel = "noopener";
    card.className = `category-card cat-${t.color || "amber"}`;
    card.innerHTML = `
      <i class="ti ${t.icon || "ti-microphone"}"></i>
      <span class="cat-name">${t.title}</span>
      <span class="post-item-meta">${t.event} · ${t.date}</span>
      <span class="post-item-excerpt">${t.description}</span>
    `;
    grid.appendChild(card);
  });
}

// ---- blog list view ----
async function renderBlogList(catKey) {
  const manifest = await loadManifest();
  const cat = manifest[catKey];
  if (!cat) return;

  document.getElementById("blog-list-title").textContent = cat.label;
  document.getElementById("blog-list-intro").textContent = cat.intro;

  const list = document.getElementById("blog-list");
  list.innerHTML = `<p class="loading">loading…</p>`;

  const entries = await Promise.all(cat.posts.map(async path => {
    const { meta } = await loadPost(path);
    return { path, meta };
  }));

  list.innerHTML = "";
  entries.forEach(({ path, meta }) => {
    const item = document.createElement("a");
    item.href = "#";
    item.className = "post-item";
    item.innerHTML = `
      <span class="post-item-title">${meta.title || path}</span>
      <span class="post-item-meta">${meta.era || ""} · ${meta.readTime || ""}</span>
      <span class="post-item-excerpt">${meta.excerpt || ""}</span>
    `;
    item.addEventListener("click", async (e) => {
      e.preventDefault();
      await renderPost(catKey, path);
      showView("post");
    });
    list.appendChild(item);
  });
}

// ---- blog groups view ----
// Categories are grouped by their "group" field in manifest.json.
// Add a new group: just give a category a new group name — no other setup needed.
async function renderBlogGroups() {
  const manifest = await loadManifest();
  const groupMeta = manifest.groups || {}; // groupName -> {icon, color}

  const groups = {}; // groupName -> [ {catKey, cat} ]
  Object.entries(manifest).forEach(([catKey, cat]) => {
    if (catKey === "groups") return; // reserved key, not a category
    const groupName = cat.group || "Other";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push({ catKey, cat });
  });

  const container = document.getElementById("blog-groups");
  container.innerHTML = "";

  Object.entries(groups).forEach(([groupName, entries]) => {
    const box = document.createElement("div");
    box.className = "category-group";

    const meta = groupMeta[groupName] || {};
    const title = document.createElement("h3");
    title.className = "category-group-title";
    if (meta.icon) {
      title.innerHTML = `<img src="assets/icons/${meta.icon}" alt="" class="group-icon"> ${groupName}`;
    } else {
      title.textContent = groupName;
    }
    box.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "category-grid";

    entries.forEach(({ catKey, cat }) => {
      const card = document.createElement("button");
      card.className = `category-card cat-${cat.color || "amber"}`;
      card.innerHTML = `
        <i class="ti ${cat.icon || "ti-notes"}"></i>
        <span class="cat-name">${cat.label}</span>
        <span class="cat-count">${cat.posts.length} posts</span>
      `;
      card.addEventListener("click", async () => {
        await renderBlogList(catKey);
        showView("blog-list");
      });
      grid.appendChild(card);
    });

    box.appendChild(grid);
    container.appendChild(box);
  });
}

// ---- post view ----
// resolves a relative path (like a markdown link or image src) against the
// directory of the file that referenced it — e.g. an image path written as
// "pictures/x.png" inside posts/seerah/saba.md resolves to
// posts/seerah/pictures/x.png, not to the site root.
function resolveAssetPath(baseDir, relPath) {
  if (!relPath) return relPath;
  if (/^([a-z]+:)?\/\//i.test(relPath) || relPath.startsWith("/") ||
      relPath.startsWith("data:") || relPath.startsWith("#") ||
      relPath.startsWith("mailto:") || relPath.startsWith("post:")) {
    return relPath;
  }
  const combined = baseDir + relPath;
  const stack = [];
  combined.split("/").forEach(part => {
    if (part === "" || part === ".") return;
    if (part === "..") stack.pop();
    else stack.push(part);
  });
  return stack.join("/");
}

// Renders any markdown file — a registered post OR an arbitrary local .md
// file linked from within one — into the post view. backLabel/backFn control
// what the back-link does; eyebrowPrefix is optional text (like a category
// name) shown before the era in the header.
async function renderMarkdownFile(path, { backLabel, backFn, eyebrowPrefix = "" }) {
  const { meta, body } = await loadPost(path);
  const fileDir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";

  const backLink = document.getElementById("post-back-link");
  document.getElementById("post-back-label").textContent = backLabel;
  backLink.onclick = async (e) => {
    e.preventDefault();
    await backFn();
  };

  const fallbackTitle = decodeURIComponent(path.split("/").pop().replace(/\.md$/i, "")).replace(/[-_]/g, " ");

  // per-post background image, set via frontmatter: background: filename.jpg
  // (the file should live in assets/backgrounds/). Sits behind the ambience
  // layer, so snow/rain/embers still show on top of it.
  const postBg = document.getElementById("post-bg-layer");
  if (meta.background) {
    postBg.style.backgroundImage = `url("assets/backgrounds/${meta.background.trim()}")`;
    postBg.classList.add("active");
  } else {
    postBg.classList.remove("active");
  }

  const article = document.getElementById("post-article");
  article.innerHTML = `
    <div class="article-header">
      <span class="article-eyebrow">${eyebrowPrefix}${meta.era || ""}</span>
      <h1 class="handwritten article-title">${meta.title || fallbackTitle}</h1>
      <span class="article-readtime">${meta.readTime || ""}</span>
    </div>
    <div id="article-content" class="article-body"></div>
  `;

  const content = document.getElementById("article-content");

  // custom renderer: resolve image paths, open external links in a new
  // tab, and turn plain relative .md links into in-app sub-page navigation
  const renderer = new marked.Renderer();
  renderer.image = (href, title, text) => {
    const resolved = resolveAssetPath(fileDir, href);
    return `<img src="${resolved}" alt="${text || ""}"${title ? ` title="${title}"` : ""}>`;
  };
  renderer.link = (href, title, text) => {
    if (href.startsWith("post:")) return `<a href="${href}">${text}</a>`;
    if (/^https?:\/\//.test(href) || href.startsWith("mailto:")) {
      return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    }
    if (/\.md$/i.test(href)) {
      const resolved = resolveAssetPath(fileDir, href);
      return `<a href="#" data-subpage="${resolved}">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
  };

  content.innerHTML = marked.parse(body, { renderer });

  // syntax-highlight every code block using highlight.js — auto-detects the
  // language, or uses whatever's after the ``` fence (e.g. ```cpp)
  if (window.hljs) {
    content.querySelectorAll("pre code").forEach(block => {
      hljs.highlightElement(block);
    });
  }

  // internal cross-post links: [text](post:category/slug) jumps straight
  // to another registered post, in the same or a different category.
  content.querySelectorAll('a[href^="post:"]').forEach(a => {
    const target = a.getAttribute("href").slice("post:".length);
    const [targetCat, targetSlug] = target.split("/");
    a.href = "#";
    a.addEventListener("click", async (e) => {
      e.preventDefault();
      await renderPost(targetCat, `posts/${targetCat}/${targetSlug}.md`);
      showView("post");
    });
  });

  // arbitrary local sub-page links: [text](some/local/file.md) — works for
  // any markdown file that exists on disk, no manifest.json entry required.
  // "Back" returns to whichever page linked to it.
  content.querySelectorAll("a[data-subpage]").forEach(a => {
    const target = a.dataset.subpage;
    a.addEventListener("click", async (e) => {
      e.preventDefault();
      await renderMarkdownFile(target, {
        backLabel: meta.title || fallbackTitle,
        backFn: async () => { await renderMarkdownFile(path, { backLabel, backFn, eyebrowPrefix }); },
        eyebrowPrefix: ""
      });
      showView("post");
    });
  });

  // auto-build the table of contents from whatever headings the markdown produced
  const tocList = document.getElementById("toc-list");
  tocList.innerHTML = "";
  const headings = content.querySelectorAll("h2, h3");
  headings.forEach(h => {
    const id = slugify(h.textContent);
    h.id = id;
    h.classList.add("article-heading");
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = h.textContent;
    a.style.paddingLeft = h.tagName === "H3" ? "12px" : "0";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });

  const sections = wrapContentSections(content);
  const floatList = (meta.floats || "").split(",").map(s => s.trim()).filter(Boolean);
  setupFloatingProps(sections, floatList);
}

async function renderPost(catKey, path) {
  const manifest = await loadManifest();
  const cat = manifest[catKey];
  await renderMarkdownFile(path, {
    backLabel: cat.label,
    backFn: async () => {
      await renderBlogList(catKey);
      showView("blog-list");
    },
    eyebrowPrefix: `${cat.label} · `
  });
}