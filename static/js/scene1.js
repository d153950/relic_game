/* ============================================
   场景1: 古代工人烧窑
   交互: 点击切换图片/对话 -> Canvas涂抹 -> 拖拽
   ============================================ */

function initScene1() {
  var dialogs = SCENES[1].dialogs;
  var cupImg = null;
  var canvas = null;
  var ctx = null;
  var isDrawing = false;
  var hasDrawn = false;
  var lineImg = null;
  var currentPhase = 0;
  var brushPixels = 0;
  var totalLinePixels = 0;

  // === 显示 p1 ===
  cupImg = createObject('p1.png', 'cup-s1', {
    x: '50%', y: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });
  showHint('点击制作');

  // === 步骤0: 点击p1 -> p2 ===
  cupImg.addEventListener('click', function step0() {
    if (isLocked()) return;
    cupImg.removeEventListener('click', step0);
    cupImg.src = '/material/cup/p2.png';
    hideHint();
    showHint('再次点击杯子');
    // 步骤1: 再次点击 -> 对话1
    cupImg.addEventListener('click', function step1(e) {
      e.stopPropagation();
      console.log('step1 triggered, locked=' + isLocked());
      if (isLocked()) return;
      cupImg.removeEventListener('click', step1);
      hideHint();
      clearAllDialogs();
      console.log('showing dialog1');
      showDialog(dialogs.d1.text, dialogs.d1.pos, 0);
      // 步骤2: 点击 -> 对话2(替换对话1)
      gameContainer.addEventListener('click', function step2() {
        gameContainer.removeEventListener('click', step2);
        clearAllDialogs();
        showDialog(dialogs.d2.text, dialogs.d2.pos, 0);
        // 步骤3: 点击 -> p3 + 对话3
        gameContainer.addEventListener('click', function step3() {
          gameContainer.removeEventListener('click', step3);
          cupImg.src = '/material/cup/p3.png';
          clearAllDialogs();
          showDialog(dialogs.d3.text, dialogs.d3.pos, 0);
          // 步骤4: 点击 -> 对话4(替换对话3)
          gameContainer.addEventListener('click', function step4() {
            gameContainer.removeEventListener('click', step4);
            clearAllDialogs();
            showDialog(dialogs.d4.text, dialogs.d4.pos, 0);
            // 步骤5: 点击 -> 进入涂抹阶段
            gameContainer.addEventListener('click', function step5() {
              gameContainer.removeEventListener('click', step5);
              clearAllDialogs();
              enterDrawPhase();
            });
          });
        });
      });
    });
  });

  // === Canvas涂抹 ===
  function enterDrawPhase() {
    currentPhase = 2;
    showHint('拖动淡描青花');

    var rect = cupImg.getBoundingClientRect();
    var cr = gameContainer.getBoundingClientRect();

    lineImg = document.createElement('img');
    lineImg.src = '/material/line.png';
    lineImg.style.cssText = 'position:absolute;left:' + (rect.left - cr.left) + 'px;top:' + (rect.top - cr.top) + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;pointer-events:none;z-index:3;opacity:0.6;';
    objectLayer.appendChild(lineImg);

    canvas = document.createElement('canvas');
    canvas.className = 'brush-canvas';
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.cssText = 'left:' + (rect.left - cr.left) + 'px;top:' + (rect.top - cr.top) + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;';
    objectLayer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var t = e.touches[0];
      startDraw({ clientX: t.clientX, clientY: t.clientY });
    });
    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var t = e.touches[0];
      draw({ clientX: t.clientX, clientY: t.clientY });
    });
    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      stopDraw();
    });
  }

  function getCanvasPos(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function startDraw(e) {
    if (currentPhase !== 2) return;
    isDrawing = true;
    if (!hasDrawn) {
      hasDrawn = true;
      clearAllDialogs();
      showDialog(dialogs.d5a.text, dialogs.d5a.pos, dialogs.d5a.duration);
      setTimeout(function() {
        showDialog(dialogs.d5b.text, dialogs.d5b.pos, dialogs.d5b.duration);
        setTimeout(function() { clearAllDialogs(); }, dialogs.d5b.duration + 300);
      }, dialogs.d5a.duration + 200);
    }
    var pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#3a5a8c';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.8;
  }

  function draw(e) {
    if (!isDrawing || currentPhase !== 2) return;
    var pos = getCanvasPos(e);
    if (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    checkCoverage();
  }

  function stopDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
    checkCoverage();
  }

  function checkCoverage() {
    if (!lineImg || !lineImg.complete) return;
    var tc = document.createElement('canvas');
    tc.width = canvas.width;
    tc.height = canvas.height;
    var tctx = tc.getContext('2d');
    tctx.drawImage(lineImg, 0, 0, canvas.width, canvas.height);
    var lineData = tctx.getImageData(0, 0, canvas.width, canvas.height);
    var brushData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var lineCount = 0;
    var coveredCount = 0;
    for (var i = 0; i < lineData.data.length; i += 16) {
      if (lineData.data[i + 3] > 50) {
        lineCount++;
        if (brushData.data[i + 3] > 30) coveredCount++;
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
    if (lineImg) { lineImg.style.transition = 'opacity 0.5s'; lineImg.style.opacity = '0'; setTimeout(function() { lineImg.remove(); }, 500); }
    if (canvas) { canvas.style.transition = 'opacity 0.5s'; canvas.style.opacity = '0'; setTimeout(function() { canvas.remove(); }, 500); }
    cupImg.src = '/material/cup/p4.png';
    setTimeout(function() {
      showHint('点击上釉');
      cupImg.addEventListener('click', function clickP4() {
        if (isLocked() || currentPhase !== 3) return;
        cupImg.removeEventListener('click', clickP4);
        hideHint();
        cupImg.src = '/material/cup/p5.png';
        clearAllDialogs();
        showDialog(dialogs.d6.text, dialogs.d6.pos, dialogs.d6.duration);
        showHint('向右拖动烧制');
        enterDragPhase();
      });
    }, 600);
  }

  // === 拖拽p5到右侧 ===
  function enterDragPhase() {
    currentPhase = 4;
    cupImg.classList.add('draggable');
    cupImg.draggable = true;

    var dropZone = document.createElement('div');
    dropZone.style.cssText = 'position:absolute;right:0;top:0;width:33.33%;height:100%;z-index:5;border-left:2px dashed rgba(139,115,85,0.4);';
    objectLayer.appendChild(dropZone);

    cupImg.addEventListener('dragstart', function(e) {
      cupImg.classList.add('dragging');
      e.dataTransfer.setData('text/plain', 'cup');
      e.dataTransfer.effectAllowed = 'move';
    });
    cupImg.addEventListener('dragend', function() { cupImg.classList.remove('dragging'); });

    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.style.borderLeftColor = 'rgba(192,64,64,0.6)';
    });
    dropZone.addEventListener('dragleave', function() {
      dropZone.style.borderLeftColor = 'rgba(139,115,85,0.4)';
    });
    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.style.borderLeftColor = 'rgba(139,115,85,0.4)';
      hideHint();
      cupImg.style.transition = 'opacity 0.8s';
      cupImg.style.opacity = '0';
      dropZone.remove();
      playSFX('fire.mp3', 3000);
      setTimeout(function() { cupImg.remove(); switchScene(2); }, 3000);
    });
  }
}
