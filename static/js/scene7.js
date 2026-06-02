/* ============================================
   场景7: 民国富豪工作室 — 清理污渍鉴宝
   交互: Canvas擦除污渍 → 点击对话
   ============================================ */

function initScene7() {
  const dialogs = SCENES[7].dialogs;

  let cupImg = null;
  let canvas = null;
  let ctx = null;
  let isDrawing = false;
  let phase = 0;

  cupImg = createObject('p8.png', 'cup-s7', {
    x: '50%', y: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  const cupRect = cupImg.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  // Canvas：画stain，鼠标擦除
  canvas = document.createElement('canvas');
  canvas.className = 'brush-canvas';
  canvas.width = cupRect.width;
  canvas.height = cupRect.height;
  canvas.style.cssText = `
    left: ${cupRect.left - containerRect.left}px;
    top: ${cupRect.top - containerRect.top}px;
    width: ${cupRect.width}px;
    height: ${cupRect.height}px;
  `;
  objectLayer.appendChild(canvas);
  ctx = canvas.getContext('2d');

  // 加载stain图到Canvas
  const stainImg = new Image();
  stainImg.src = '/material/stain.png';
  stainImg.onload = () => {
    ctx.drawImage(stainImg, 0, 0, canvas.width, canvas.height);
  };

  showHint('用鼠标涂抹，清理杯上污渍');

  // ==================== 擦除事件 ====================
  canvas.addEventListener('mousedown', startErase);
  canvas.addEventListener('mousemove', erase);
  canvas.addEventListener('mouseup', stopErase);
  canvas.addEventListener('mouseleave', stopErase);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    startErase({ clientX: t.clientX, clientY: t.clientY });
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    erase({ clientX: t.clientX, clientY: t.clientY });
  });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopErase();
  });

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function startErase(e) {
    if (phase !== 0) return;
    isDrawing = true;
    ctx.globalCompositeOperation = 'destination-out';
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function erase(e) {
    if (!isDrawing || phase !== 0) return;
    const pos = getPos(e);
    if (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    checkCoverage();
  }

  function stopErase() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    checkCoverage();
  }

  function checkCoverage() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let total = 0;
    for (let i = 0; i < data.data.length; i += 16) {
      total++;
      if (data.data[i + 3] < 30) cleared++;
    }
    if (total > 0 && cleared / total >= 0.80) {
      completeCleaning();
    }
  }

  function completeCleaning() {
    phase = 1;
    hideHint();

    canvas.style.transition = 'opacity 0.5s';
    canvas.style.opacity = '0';
    setTimeout(() => canvas.remove(), 500);

    setTimeout(() => {
      clearAllDialogs();
      showDialog(dialogs.friend.text, dialogs.friend.pos, dialogs.friend.duration);
      setTimeout(() => {
        clearAllDialogs();
        showHint('点击屏幕继续');
        gameContainer.addEventListener('click', onClickHero);
        gameContainer._scene7Handler = onClickHero;
      }, dialogs.friend.duration + 500);
    }, 600);
  }

  function onClickHero() {
    if (isLocked()) return;
    gameContainer.removeEventListener('click', onClickHero);
    gameContainer._scene7Handler = null;
    hideHint();

    clearAllDialogs();
    showDialog(dialogs.hero.text, dialogs.hero.pos, dialogs.hero.duration);

    setTimeout(() => {
      clearAllDialogs();
      switchScene(8);
    }, dialogs.hero.duration + 500);
  }
}
