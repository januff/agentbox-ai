const canvas = document.querySelector("#agent-field");
const context = canvas.getContext("2d");
const pointer = { x: 0.66, y: 0.34, active: false };

let width = 0;
let height = 0;
let deviceScale = 1;
let nodes = [];
let traces = [];
let animationFrame = 0;

const palette = ["#6fe5a3", "#73d7e7", "#e9bf69", "#d97757", "#f5f1e8"];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(width * deviceScale);
  canvas.height = Math.floor(height * deviceScale);
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  buildScene();
}

function buildScene() {
  const nodeCount = width < 720 ? 20 : 34;
  nodes = Array.from({ length: nodeCount }, (_, index) => {
    const lane = index % 4;
    const spreadX = 0.38 + (lane * 0.18);
    return {
      x: width * (spreadX + (Math.random() - 0.5) * 0.16),
      y: height * (0.14 + Math.random() * 0.72),
      size: 9 + Math.random() * 18,
      color: palette[index % palette.length],
      speed: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      link: Math.max(0, index - 1 - Math.floor(Math.random() * 3)),
    };
  });

  traces = Array.from({ length: nodeCount + 8 }, (_, index) => ({
    from: Math.floor(Math.random() * nodeCount),
    to: Math.floor(Math.random() * nodeCount),
    progress: Math.random(),
    speed: 0.0025 + Math.random() * 0.006,
    color: palette[index % palette.length],
  }));
}

function roundedRect(x, y, rectWidth, rectHeight, radius) {
  const r = Math.min(radius, rectWidth / 2, rectHeight / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, r);
  context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, r);
  context.arcTo(x, y + rectHeight, x, y, r);
  context.arcTo(x, y, x + rectWidth, y, r);
  context.closePath();
}

function drawLine(a, b, alpha) {
  context.strokeStyle = `rgba(245, 241, 232, ${alpha})`;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
}

function drawTrace(trace) {
  const from = nodes[trace.from];
  const to = nodes[trace.to];
  if (!from || !to || from === to) return;

  trace.progress += trace.speed;
  if (trace.progress > 1) {
    trace.progress = 0;
    trace.from = Math.floor(Math.random() * nodes.length);
    trace.to = Math.floor(Math.random() * nodes.length);
  }

  const x = from.x + (to.x - from.x) * trace.progress;
  const y = from.y + (to.y - from.y) * trace.progress;
  context.fillStyle = trace.color;
  context.shadowColor = trace.color;
  context.shadowBlur = 14;
  roundedRect(x - 3, y - 3, 6, 6, 2);
  context.fill();
  context.shadowBlur = 0;
}

function drawNode(node, index, time) {
  const pullX = pointer.active ? (pointer.x * width - node.x) * 0.015 : 0;
  const pullY = pointer.active ? (pointer.y * height - node.y) * 0.015 : 0;
  const driftX = Math.cos(time * node.speed + node.phase) * 7 + pullX;
  const driftY = Math.sin(time * node.speed + node.phase) * 5 + pullY;
  const x = node.x + driftX;
  const y = node.y + driftY;
  const boxWidth = node.size * 1.65;
  const boxHeight = node.size * 1.15;

  node.currentX = x;
  node.currentY = y;

  context.fillStyle = "rgba(16, 16, 14, 0.72)";
  context.strokeStyle = index % 5 === 0 ? node.color : "rgba(245, 241, 232, 0.24)";
  context.lineWidth = 1;
  roundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 4);
  context.fill();
  context.stroke();

  context.fillStyle = node.color;
  roundedRect(x - boxWidth / 2 + 5, y - 3, 6, 6, 2);
  context.fill();
}

function drawConsole(time) {
  const panelWidth = Math.min(440, width * 0.35);
  const panelHeight = Math.min(300, height * 0.42);
  if (panelWidth < 240 || panelHeight < 220) return;

  const x = width - panelWidth - width * 0.08;
  const y = height * 0.18 + Math.sin(time * 0.55) * 8;

  context.fillStyle = "rgba(16, 16, 14, 0.48)";
  context.strokeStyle = "rgba(245, 241, 232, 0.18)";
  context.lineWidth = 1;
  roundedRect(x, y, panelWidth, panelHeight, 8);
  context.fill();
  context.stroke();

  const rows = 6;
  for (let i = 0; i < rows; i += 1) {
    const rowY = y + 34 + i * 38;
    const rowAlpha = 0.18 + i * 0.025;
    context.fillStyle = `rgba(245, 241, 232, ${rowAlpha})`;
    roundedRect(x + 24, rowY, panelWidth * (0.34 + (i % 3) * 0.15), 9, 3);
    context.fill();

    context.fillStyle = palette[i % palette.length];
    roundedRect(x + panelWidth - 58, rowY - 3, 18, 15, 4);
    context.fill();
  }

  const meterWidth = panelWidth - 48;
  context.fillStyle = "rgba(245, 241, 232, 0.09)";
  roundedRect(x + 24, y + panelHeight - 42, meterWidth, 10, 4);
  context.fill();
  context.fillStyle = "#6fe5a3";
  roundedRect(x + 24, y + panelHeight - 42, meterWidth * (0.64 + Math.sin(time) * 0.08), 10, 4);
  context.fill();
}

function render(timestamp) {
  const time = timestamp / 1000;
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#10100e");
  gradient.addColorStop(0.54, "#171713");
  gradient.addColorStop(1, "#1f1913");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  nodes.forEach((node, index) => drawNode(node, index, time));

  nodes.forEach((node, index) => {
    const linked = nodes[node.link];
    if (!linked || linked === node) return;
    drawLine(
      { x: node.currentX || node.x, y: node.currentY || node.y },
      { x: linked.currentX || linked.x, y: linked.currentY || linked.y },
      0.08 + (index % 4) * 0.016,
    );
  });

  traces.forEach(drawTrace);
  drawConsole(time);

  animationFrame = requestAnimationFrame(render);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / Math.max(1, window.innerWidth);
  pointer.y = event.clientY / Math.max(1, window.innerHeight);
  pointer.active = true;
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resizeCanvas();
animationFrame = requestAnimationFrame(render);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else {
    animationFrame = requestAnimationFrame(render);
  }
});
