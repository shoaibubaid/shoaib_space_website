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
  const res = await fetch("manifest.json");
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
  const res = await fetch(path);
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

// slow, soft flakes drifting down behind the glass pane
function startSnow() {
  clearAmbience();
  const make = () => {
    const f = document.createElement("div");
    f.className = "snowflake";
    const size = 2 + Math.random() * 3;
    f.style.width = size + "px";
    f.style.height = size + "px";
    f.style.left = Math.random() * 100 + "vw";
    f.style.opacity = 0.25 + Math.random() * 0.45;
    const dur = 10 + Math.random() * 10;
    const drift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40);
    f.style.transition = `transform ${dur}s linear, opacity 1s ease`;
    bgLayer.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translate(${drift}px, 105vh)`;
    });
    setTimeout(() => f.remove(), dur * 1000);
  };
  for (let i = 0; i < 25; i++) setTimeout(make, i * 300);
  ambienceTimer = setInterval(make, 550);
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
  if (!ambienceMenu.hidden && !e.target.closest(".ambience-wrap")) {
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
const FLOAT_PARALLAX_FACTOR = 0.55;
const FLOAT_GAP_RIGHT = 28;  // distance kept from the article's right edge
const FLOAT_GAP_LEFT = 12;   // distance kept from the article's left edge (note: this will sit on/near the TOC)

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
// and TOC widths, so a position computed before the zoom is now stale
function repositionActiveFloats() {
  const articleEl = document.getElementById("post-article");
  if (!articleEl || activeFloats.length === 0) return;
  const articleRect = articleEl.getBoundingClientRect();
  const rightClearance = window.innerWidth - articleRect.right;
  const leftClearance = articleRect.left;

  activeFloats.slice().forEach(entryObj => {
    const { sec, wrap, side, imgSize, topFraction } = entryObj;
    const minNeeded = imgSize + 24;
    const stillHasRoom = side === "right" ? rightClearance >= minNeeded : leftClearance >= minNeeded;

    if (!stillHasRoom) {
      wrap.style.opacity = "0";
      const idx = activeFloats.indexOf(entryObj);
      if (idx !== -1) activeFloats.splice(idx, 1);
      setTimeout(() => wrap.remove(), 400);
      sec._floatWrap = null;
      return;
    }

    const leftPx = computeFloatLeft(side, imgSize, articleRect);
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

  floatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sec = entry.target;
      if (entry.isIntersecting) {
        if (sec._floatWrap) return;

        const articleRect = articleEl.getBoundingClientRect();
        const rightClearance = window.innerWidth - articleRect.right;
        const leftClearance = articleRect.left;

        const imgSize = 44 + Math.random() * 36;
        const minNeeded = imgSize + 24; // image plus a small breathing gap

        let side;
        if (rightClearance >= minNeeded && leftClearance >= minNeeded) {
          side = Math.random() > 0.5 ? "left" : "right";
        } else if (rightClearance >= minNeeded) {
          side = "right";
        } else if (leftClearance >= minNeeded) {
          side = "left";
        } else {
          return; // no real space on either side — skip rather than overlap content
        }

        // uniform random pick — every file in the list has an equal chance
        const file = floatList[Math.floor(Math.random() * floatList.length)];

        const sectionRect = sec.getBoundingClientRect();
        const docScrollY = window.scrollY || window.pageYOffset;
        const topFraction = 0.15 + Math.random() * 0.55;
        const topPx = sectionRect.top + docScrollY + sectionRect.height * topFraction;
        const leftPx = computeFloatLeft(side, imgSize, articleRect);

        const wrap = document.createElement("div");
        wrap.className = "float-wrap";
        wrap.style.left = leftPx + "px";
        wrap.style.top = topPx + "px";

        const img = document.createElement("img");
        img.src = `assets/floats/${file}`;
        img.alt = "";
        img.className = "float-decor";
        img.style.width = imgSize + "px";
        img.style.transform = side === "left" ? "rotate(-45deg)" : "rotate(45deg)";

        wrap.appendChild(img);
        layer.appendChild(wrap);
        requestAnimationFrame(() => { wrap.style.opacity = "0.85"; });

        sec._floatWrap = wrap;
        const entryObj = { sec, wrap, baseSectionTop: sectionRect.top, side, imgSize, topFraction };
        activeFloats.push(entryObj);
        wrap._entryObj = entryObj;
      } else if (sec._floatWrap) {
        const wrap = sec._floatWrap;
        wrap.style.opacity = "0";
        const idx = activeFloats.indexOf(wrap._entryObj);
        if (idx !== -1) activeFloats.splice(idx, 1);
        setTimeout(() => wrap.remove(), 700);
        sec._floatWrap = null;
      }
    });
  }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });

  sections.forEach(sec => floatObserver.observe(sec));
}

// ---- nav ----
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

function showView(name) {
  views.forEach(v => v.hidden = v.id !== `view-${name}`);
  navLinks.forEach(l => l.classList.toggle("active", l.dataset.nav === name));
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll("[data-nav]").forEach(el => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    showView(el.dataset.nav);
    if (el.dataset.nav === "projects") await renderProjects();
    if (el.dataset.nav === "speaking") await renderTalks();
  });
});

// ---- projects view ----
// Add a new project: add an entry to projects.json. No new files needed.
let projectsCache = null;

async function renderProjects() {
  if (!projectsCache) {
    const res = await fetch("projects.json");
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
    const res = await fetch("talks.json");
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

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", async () => {
    await renderBlogList(card.dataset.cat);
    showView("blog-list");
  });
});

// ---- post view ----
async function renderPost(catKey, path) {
  const manifest = await loadManifest();
  const cat = manifest[catKey];
  const { meta, body } = await loadPost(path);

  const backLink = document.getElementById("post-back-link");
  document.getElementById("post-back-label").textContent = cat.label;
  backLink.onclick = async (e) => {
    e.preventDefault();
    await renderBlogList(catKey);
    showView("blog-list");
  };

  const article = document.getElementById("post-article");
  article.innerHTML = `
    <div class="article-header">
      <span class="article-eyebrow">${cat.label} · ${meta.era || ""}</span>
      <h1 class="handwritten article-title">${meta.title || ""}</h1>
      <span class="article-readtime">${meta.readTime || ""}</span>
    </div>
    <div id="article-content" class="article-body"></div>
  `;

  const content = document.getElementById("article-content");
  content.innerHTML = marked.parse(body);

  // internal cross-post links: [text](post:category/slug) jumps straight
  // to another post, in the same or a different category.
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
