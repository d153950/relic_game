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

  // 加载stain图到Canvas，保存原始像素用于检测
  var stainOriginalData = null;
  var totalStainPixels = 0;
  const stainImg = new Image();
  stainImg.src = '/material/stain.png';
  stainImg.onload = () => {
    ctx.drawImage(stainImg, 0, 0, canvas.width, canvas.height);
    // 保存原始stain像素数据
    var origData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    stainOriginalData = new Uint8Array(origData.data.length);
    for (var j = 0; j < origData.data.length; j += 4) {
      stainOriginalData[j + 3] = origData.data[j + 3];
      if (origData.data[j + 3] > 30) totalStainPixels++;
    }
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
    ctx.lineWidth = 30;
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
    if (!stainOriginalData || totalStainPixels === 0) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var cleared = 0;
    // 只统计原始有stain的像素
    for (var i = 0; i < data.data.length; i += 4) {
      if (stainOriginalData[i + 3] > 30) {
        if (data.data[i + 3] < 30) cleared++;
      }
    }
    if (cleared / totalStainPixels >= 0.80) {
      if (phase !== 0) return;
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
      showHint('点击屏幕继续');
      gameContainer.addEventListener('click', onClickFriend);
      gameContainer._scene7Handler = onClickFriend;
    }, 600);
  }

  function onClickFriend() {
    if (isLocked()) return;
    gameContainer.removeEventListener('click', onClickFriend);
    hideHint();

    clearAllDialogs();
    showDialog(dialogs.friend.text, dialogs.friend.pos, dialogs.friend.duration);

    // 友人对话显示期间就可以点击触发主角
    gameContainer.addEventListener('click', onClickHero);
    gameContainer._scene7Handler = onClickHero;

    // 3秒后友人对话自动消失
    setTimeout(() => {
      clearAllDialogs();
    }, dialogs.friend.duration + 300);
  }

  function onClickHero() {
    if (isLocked()) return;
    gameContainer.removeEventListener('click', onClickHero);
    gameContainer._scene7Handler = null;
    hideHint();

    clearAllDialogs();
    showDialog(dialogs.hero.text, dialogs.hero.pos, dialogs.hero.duration);

    // 主角对话期间点击可直接切换
    gameContainer.addEventListener('click', function skipToNext() {
      gameContainer.removeEventListener('click', skipToNext);
      clearAllDialogs();
      switchScene(8);
    });
    gameContainer._scene7SkipHandler = skipToNext;

    // 对话消失后自动切换
    setTimeout(() => {
      if (gameContainer._scene7SkipHandler) {
        gameContainer.removeEventListener('click', gameContainer._scene7SkipHandler);
        gameContainer._scene7SkipHandler = null;
      }
      clearAllDialogs();
      switchScene(8);
    }, dialogs.hero.duration + 500);
  }
}
