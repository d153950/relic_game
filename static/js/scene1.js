/* ============================================
   场景1: 古代工人烧窑
   交互: 点击切换图片 → 自动对话 → Canvas涂抹 → 拖拽
   ============================================ */

function initScene1() {
  const dialogs = SCENES[1].dialogs;

  // 状态变量
  let cupImg = null;       // 当前杯子图片元素
  let canvas = null;       // 涂抹 canvas
  let ctx = null;
  let isDrawing = false;
  let hasDrawn = false;    // 是否已经开始涂抹
  let lineImg = null;      // 虚线图层元素
  let currentPhase = 0;    // 0=等待点击p1, 1=等待点击p2, 2=等待涂抹, 3=等待拖拽
  let brushPixels = 0;     // 已涂抹像素数
  let totalLinePixels = 0; // 虚线总像素数

  // ==================== 阶段0: 显示 p1，等待点击 ====================
  cupImg = createObject('p1.png', 'cup-s1', {
    x: '50%', y: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  showHint('点击杯子，开始制瓷');

  cupImg.addEventListener('click', function onClickP1() {
    if (isLocked()) return;
    lock(500);

    // p1 → p2
    cupImg.src = '/material/cup/p2.png';

    // 对话1 (左, 3s)
    clearAllDialogs();
    showDialog(dialogs.d1.text, dialogs.d1.pos, dialogs.d1.duration);

    // 1秒后自动对话2 (上, 3s)
    setTimeout(() => {
      showDialog(dialogs.d2.text, dialogs.d2.pos, dialogs.d2.duration);
    }, 1000);

    hideHint();
    currentPhase = 1;
    cupImg.removeEventListener('click', onClickP1);
    // 等对话1和对话2都消失后才能点击p2
    // 对话1=3s, 对话2在1s后出现持续3s, 总共4s后都消失
    setTimeout(() => {
      cupImg.addEventListener('click', onClickP2);
      showHint('点击杯子继续');
    }, 4500);
  });

  // ==================== 阶段1: 点击 p2 → p3 ====================
  function onClickP2() {
    if (isLocked()) return;
    lock(500);
    hideHint();

    // p2 → p3
    cupImg.src = '/material/cup/p3.png';

    // 对话3 (左, 3s)
    clearAllDialogs();
    showDialog(dialogs.d3.text, dialogs.d3.pos, dialogs.d3.duration);

    // 1秒后自动对话4 (上, 3s)
    setTimeout(() => {
      showDialog(dialogs.d4.text, dialogs.d4.pos, dialogs.d4.duration);
      // 对话4消失后，进入涂抹阶段
      setTimeout(() => {
        clearAllDialogs();
        enterDrawPhase();
      }, dialogs.d4.duration + 500);
    }, 1000);

    cupImg.removeEventListener('click', onClickP2);
  }

  // ==================== 阶段2: Canvas 涂抹 ====================
  function enterDrawPhase() {
    currentPhase = 2;
    showHint('用鼠标沿虚线涂抹，勾勒青花线条');

    // 获取 p3 图片的位置和尺寸
    const rect = cupImg.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // 创建虚线图层 (line.png)
    lineImg = document.createElement('img');
    lineImg.src = '/material/line.png';
    lineImg.style.cssText = `
      position: absolute;
      left: ${rect.left - containerRect.left}px;
      top: ${rect.top - containerRect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 3;
    `;
    objectLayer.appendChild(lineImg);

    // 创建 Canvas
    canvas = document.createElement('canvas');
    canvas.className = 'brush-canvas';
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.cssText = `
      left: ${rect.left - containerRect.left}px;
      top: ${rect.top - containerRect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
    objectLayer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // 鼠标事件
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // 触摸事件
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const fakeE = { clientX: touch.clientX, clientY: touch.clientY };
      startDraw(fakeE);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const fakeE = { clientX: touch.clientX, clientY: touch.clientY };
      draw(fakeE);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopDraw();
    });
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDraw(e) {
    if (currentPhase !== 2) return;
    isDrawing = true;

    // 首次涂抹触发对话5
    if (!hasDrawn) {
      hasDrawn = true;
      clearAllDialogs();
      showDialog(dialogs.d5a.text, dialogs.d5a.pos, dialogs.d5a.duration);
      setTimeout(() => {
        showDialog(dialogs.d5b.text, dialogs.d5b.pos, dialogs.d5b.duration);
        setTimeout(() => clearAllDialogs(), dialogs.d5b.duration + 300);
      }, dialogs.d5a.duration + 200);
    }

    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#3a5a8c';  // 青蓝色
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.8;
  }

  function draw(e) {
    if (!isDrawing || currentPhase !== 2) return;
    const pos = getCanvasPos(e);

    // 限制在 canvas 范围内
    if (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    // 检测覆盖率
    checkCoverage();
  }

  function stopDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
    checkCoverage();
  }

  function checkCoverage() {
    // 抽样检测：取虚线图层的像素，看 Canvas 上对应位置是否有颜色
    if (!lineImg || !lineImg.complete) return;

    // 创建临时 canvas 来分析虚线图层
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(lineImg, 0, 0, canvas.width, canvas.height);
    const lineData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

    const brushData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let lineCount = 0;
    let coveredCount = 0;

    // 每隔 4 个像素采样（性能优化）
    for (let i = 0; i < lineData.data.length; i += 16) {
      // 虚线图层有内容 (alpha > 50)
      if (lineData.data[i + 3] > 50) {
        lineCount++;
        // Canvas 上有笔触 (alpha > 30)
        if (brushData.data[i + 3] > 30) {
          coveredCount++;
        }
      }
    }

    totalLinePixels = lineCount;
    brushPixels = coveredCount;

    if (lineCount > 0 && coveredCount / lineCount >= 0.60) {
      completeDrawing();
    }
  }

  function completeDrawing() {
    currentPhase = 3;
    hideHint();

    // line 消失
    if (lineImg) {
      lineImg.style.transition = 'opacity 0.5s';
      lineImg.style.opacity = '0';
      setTimeout(() => lineImg.remove(), 500);
    }

    // Canvas 消失
    if (canvas) {
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
      setTimeout(() => canvas.remove(), 500);
    }

    // p3 → p4
    cupImg.src = '/material/cup/p4.png';

    // 短暂延迟后提示点击
    setTimeout(() => {
      showHint('点击杯子继续');
      cupImg.addEventListener('click', onClickP4);
    }, 600);
  }

  // ==================== 阶段3: 点击 p4 → p5 ====================
  function onClickP4() {
    if (isLocked() || currentPhase !== 3) return;
    lock(500);

    cupImg.src = '/material/cup/p5.png';
    hideHint();

    // 触发对话 d6（不阻塞拖拽）
    clearAllDialogs();
    showDialog(dialogs.d6.text, dialogs.d6.pos, dialogs.d6.duration);

    // 同时就可以拖拽
    showHint('将杯子拖到右侧窑中');
    enterDragPhase();

    cupImg.removeEventListener('click', onClickP4);
  }

  // ==================== 阶段4: 拖拽 p5 到右侧 ====================
  function enterDragPhase() {
    currentPhase = 4;
    cupImg.classList.add('draggable');
    cupImg.draggable = true;

    // 创建右侧 drop zone
    const dropZone = document.createElement('div');
    dropZone.id = 'drop-zone-right';
    dropZone.style.cssText = `
      position: absolute;
      right: 0;
      top: 0;
      width: 33.33%;
      height: 100%;
      z-index: 5;
      border-left: 2px dashed rgba(139,115,85,0.4);
    `;
    objectLayer.appendChild(dropZone);

    // 拖拽事件
    cupImg.addEventListener('dragstart', (e) => {
      cupImg.classList.add('dragging');
      e.dataTransfer.setData('text/plain', 'cup');
      e.dataTransfer.effectAllowed = 'move';
    });

    cupImg.addEventListener('dragend', () => {
      cupImg.classList.remove('dragging');
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.style.borderLeftColor = 'rgba(192,64,64,0.6)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderLeftColor = 'rgba(139,115,85,0.4)';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderLeftColor = 'rgba(139,115,85,0.4)';
      hideHint();

      // p5 淡化消失
      cupImg.style.transition = 'opacity 0.8s';
      cupImg.style.opacity = '0';
      dropZone.remove();

      setTimeout(() => {
        cupImg.remove();
        // 切换到场景2
        switchScene(2);
      }, 800);
    });
  }
}
