// ---- focus timer ----
// Countdown with a value that rises for the first half of the session,
// peaks at the midpoint, then falls back to zero by the end. Lives in
// #view-focus-timer, entered via the "focus timer" button on the blog page.
(function () {
  const MAX_MINUTES = 60;

  const canvas = document.getElementById("ft-canvas");
  if (!canvas) return; // section not present on this page
  const ctx = canvas.getContext("2d");

  const minutesInput = document.getElementById("ft-minutes");
  const startBtn = document.getElementById("ft-start");
  const pauseBtn = document.getElementById("ft-pause");
  const resetBtn = document.getElementById("ft-reset");
  const timeLabel = document.getElementById("ft-time");
  const phaseLabel = document.getElementById("ft-phase");
  const valueLabel = document.getElementById("ft-value");

  let totalSeconds = clampMinutes(minutesInput.value) * 60;
  let remaining = totalSeconds;
  let running = false;
  let rafId = null;
  let deadline = null;
  let pausedAt = null;

  function clampMinutes(v) {
    return Math.max(1, Math.min(MAX_MINUTES, Math.round(Number(v) || 1)));
  }

  // 0 at t=0, peak (1.0) at t=T/2, 0 at t=T.
  function curveValue(t, T) {
    if (T <= 0) return 0;
    const x = t / T;
    return 4 * x * (1 - x);
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function drawCurve(elapsedSeconds) {
    const w = canvas.width;
    const h = canvas.height;
    const padding = 30;
    ctx.clearRect(0, 0, w, h);

    const accent = "#818cf8";
    const dotColor = "#f87171";
    const borderColor = "rgba(255,255,255,0.18)";
    const mutedColor = "rgba(255,255,255,0.35)";

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    const midX = padding + (w - 2 * padding) / 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = mutedColor;
    ctx.beginPath();
    ctx.moveTo(midX, padding);
    ctx.lineTo(midX, h - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    const steps = 200;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalSeconds;
      const v = curveValue(t, totalSeconds);
      const x = padding + (i / steps) * (w - 2 * padding);
      const y = (h - padding) - v * (h - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const clampedElapsed = Math.min(Math.max(elapsedSeconds, 0), totalSeconds);
    const v = curveValue(clampedElapsed, totalSeconds);
    const dx = padding + (clampedElapsed / totalSeconds) * (w - 2 * padding);
    const dy = (h - padding) - v * (h - 2 * padding);
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(dx, dy, 7, 0, Math.PI * 2);
    ctx.fill();

    valueLabel.textContent = "value: " + Math.round(v * 100) + "%";
  }

  function render() {
    let elapsed;
    if (running && deadline !== null) {
      remaining = (deadline - performance.now()) / 1000;
      elapsed = totalSeconds - remaining;
      if (remaining <= 0) {
        remaining = 0;
        elapsed = totalSeconds;
        running = false;
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="ti ti-player-play"></i> start';
        pauseBtn.disabled = true;
        phaseLabel.textContent = "done";
      } else {
        phaseLabel.textContent = elapsed < totalSeconds / 2 ? "rising" : "falling";
      }
    } else {
      elapsed = totalSeconds - remaining;
    }

    timeLabel.textContent = formatTime(remaining);
    drawCurve(elapsed);

    if (running) rafId = requestAnimationFrame(render);
  }

  function start() {
    if (running) return;
    totalSeconds = clampMinutes(minutesInput.value) * 60;
    remaining = (remaining <= 0 || pausedAt === null) ? totalSeconds : pausedAt;
    deadline = performance.now() + remaining * 1000;
    running = true;
    pausedAt = null;
    minutesInput.disabled = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    phaseLabel.textContent = "rising";
    render();
  }

  function pause() {
    if (!running) return;
    running = false;
    pausedAt = remaining;
    if (rafId) cancelAnimationFrame(rafId);
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="ti ti-player-play"></i> resume';
    pauseBtn.disabled = true;
    phaseLabel.textContent = "paused";
  }

  function reset() {
    running = false;
    pausedAt = null;
    if (rafId) cancelAnimationFrame(rafId);
    totalSeconds = clampMinutes(minutesInput.value) * 60;
    remaining = totalSeconds;
    minutesInput.disabled = false;
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="ti ti-player-play"></i> start';
    pauseBtn.disabled = true;
    phaseLabel.textContent = "ready";
    timeLabel.textContent = formatTime(remaining);
    drawCurve(0);
  }

  minutesInput.addEventListener("change", () => {
    minutesInput.value = clampMinutes(minutesInput.value);
    if (!running) reset();
  });
  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  reset();
})();
