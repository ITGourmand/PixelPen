"use strict"
document.addEventListener("DOMContentLoaded", () => {
  loop();
});


class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }
  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }
  mult(s) {
    return new Vec2(this.x * s, this.y * s);
  }
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}


const canvas = document.getElementById("cvs");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const GRID = 32;
const CELL = canvas.width / GRID;
let pixels = new Array(GRID * GRID).fill(null);
let pts = {
  start: new Vec2(4.5, 27.5),
  c1: new Vec2(4.5, 4.5),
  c2: new Vec2(27.5, 4.5),
  end: new Vec2(27.5, 27.5),
};
let dragging = null;

function getBezier(t) {
  const iT = 1 - t;
  return pts.start
    .mult(iT ** 3)
    .add(pts.c1.mult(3 * iT ** 2 * t))
    .add(pts.c2.mult(3 * iT * t ** 2))
    .add(pts.end.mult(t ** 3));
}

let thickness = 1;

canvas.onwheel = (e) => {
  e.preventDefault();

  if (e.deltaY < 0) {
    thickness = Math.min(10, thickness + 1);
  } else {
    thickness = Math.max(1, thickness - 1);
  }
};

function bakeCurve() {
  const steps = 2000;
  let path = [];
  let pixelData = new Map();

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let p = getBezier(t);
    let px = Math.floor(p.x),
      py = Math.floor(p.y);

    if (px >= 0 && px < GRID && py >= 0 && py < GRID) {
      let key = `${px},${py}`;

      let dist = new Vec2(px + 0.5, py + 0.5).sub(p).mag();

      if (!pixelData.has(key)) {
        pixelData.set(key, { x: px, y: py, dist: dist });
        path.push(key);
      } else {
        let existing = pixelData.get(key);
        if (dist < existing.dist) existing.dist = dist;
      }
    }
  }

  let finalPixels = [];
  for (let i = 0; i < path.length; i++) {
    let curr = pixelData.get(path[i]);
    let skip = false;

    if (i > 0 && i < path.length - 1) {
      let prev = pixelData.get(path[i - 1]);
      let next = pixelData.get(path[i + 1]);

      if (Math.abs(next.x - prev.x) === 1 && Math.abs(next.y - prev.y) === 1) {
        if (curr.dist > prev.dist && curr.dist > next.dist) {
          skip = true;
        }
      }
    }

    if (!skip) finalPixels.push(curr);
  }

  finalPixels.forEach((p) => {
    let offset = Math.floor(thickness / 2);
    for (let dy = 0; dy < thickness; dy++) {
      for (let dx = 0; dx < thickness; dx++) {
        let tx = p.x + dx - offset;
        let ty = p.y + dy - offset;
        if (tx >= 0 && tx < GRID && ty >= 0 && ty < GRID) {
          pixels[ty * GRID + tx] = colorPicker.value;
        }
      }
    }
  });
}

canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const m = new Vec2(
    (e.clientX - rect.left) / CELL,
    (e.clientY - rect.top) / CELL,
  );
  for (let k in pts) {
    if (m.sub(pts[k]).mag() < 1.5) dragging = k;
  }
};
window.onmousemove = (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  pts[dragging] = new Vec2(
    Math.floor(
      Math.max(0, Math.min(GRID - 1, (e.clientX - rect.left) / CELL)),
    ) + 0.5,
    Math.floor(Math.max(0, Math.min(GRID - 1, (e.clientY - rect.top) / CELL))) +
      0.5,
  );
};
window.onmouseup = () => (dragging = null);

function loop() {
  ctx.fillStyle = "#fffcf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i]) {
      ctx.fillStyle = pixels[i];
      ctx.fillRect((i % GRID) * CELL, Math.floor(i / GRID) * CELL, CELL, CELL);
    }
  }

  // 3. Grille (plus discrète, ton bois/papier)
  ctx.strokeStyle = "rgba(68, 36, 0, 0.25)";
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
  }

  const steps = 500;
  let path = [],
    pixelData = new Map();
  for (let i = 0; i <= steps; i++) {
    let p = getBezier(i / steps);
    let px = Math.floor(p.x),
      py = Math.floor(p.y);
    if (px >= 0 && px < GRID && py >= 0 && py < GRID) {
      let key = `${px},${py}`;
      let dist = new Vec2(px + 0.5, py + 0.5).sub(p).mag();
      if (!pixelData.has(key)) {
        pixelData.set(key, { x: px, y: py, dist });
        path.push(key);
      } else if (dist < pixelData.get(key).dist) pixelData.get(key).dist = dist;
    }
  }
  let finalPixels = [];
  for (let i = 0; i < path.length; i++) {
    let curr = pixelData.get(path[i]),
      skip = false;
    if (i > 0 && i < path.length - 1) {
      let prev = pixelData.get(path[i - 1]),
        next = pixelData.get(path[i + 1]);
      if (
        Math.abs(next.x - prev.x) === 1 &&
        Math.abs(next.y - prev.y) === 1 &&
        curr.dist > prev.dist &&
        curr.dist > next.dist
      )
        skip = true;
    }
    if (!skip) finalPixels.push(curr);
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  let offset = Math.floor(thickness / 2);
  let previewSet = new Set();
  finalPixels.forEach((p) => {
    for (let dy = 0; dy < thickness; dy++)
      for (let dx = 0; dx < thickness; dx++) {
        let tx = p.x + dx - offset,
          ty = p.y + dy - offset;
        if (tx >= 0 && tx < GRID && ty >= 0 && ty < GRID)
          previewSet.add(`${tx},${ty}`);
      }
  });
  previewSet.forEach((key) => {
    let [tx, ty] = key.split(",").map(Number);
    ctx.fillRect(tx * CELL, ty * CELL, CELL, CELL);
  });

  ctx.fillStyle = "rgba(160, 90, 44, 0.3)"; 
  previewSet.forEach((key) => {
    let [tx, ty] = key.split(",").map(Number);
    ctx.fillRect(tx * CELL, ty * CELL, CELL, CELL);
  });

  // 5. Poignées de contrôle (plus élégantes)
  for (let k in pts) {
    ctx.fillStyle = (k === 'start' || k === 'end') ? "#4a3623" : "#fff";
    ctx.strokeStyle = "#4a3623";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pts[k].x * CELL, pts[k].y * CELL, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  // Mise à jour de l'affichage de l'épaisseur
  const thicknessEl = document.getElementById("thicknessValue");
  if(thicknessEl) thicknessEl.innerText = thickness;

  requestAnimationFrame(loop);
}