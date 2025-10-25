# public/script.js
function startGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let x = 20, y = 20, dx = 3, dy = 3;
  setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4d00';
    ctx.fill();
    ctx.closePath();
    x += dx;
    y += dy;
    if (x + 15 > canvas.width || x - 15 < 0) dx = -dx;
    if (y + 15 > canvas.height || y - 15 < 0) dy = -dy;
  }, 20);
}
