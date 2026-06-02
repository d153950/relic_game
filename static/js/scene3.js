/* ============================================
   场景3: 皇帝贵妃 — 献杯
   交互: 拖拽红布 → 拖拽杯子给贵妃 → 5轮点击对话
   ============================================ */

function initScene3() {
  const dialogs = SCENES[3].dialogs;

  let cupImg = null;
  let clothImg = null;
  let clothRemoved = false;
  let cupDelivered = false;
  let dialogIndex = 0;

  // ==================== 显示背景 + 杯子 + 红布 ====================

  // 成品杯 p8
  cupImg = createObject('p8.png', 'cup-s3', {
    x: '50%', y: '58%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  // 红布覆盖在杯子上
  clothImg = document.createElement('img');
  clothImg.src = '/material/cloth.png';
  clothImg.id = 'cloth-s3';
  clothImg.className = 'object-img draggable';
  clothImg.draggable = true;
  clothImg.style.cssText = `
    position: absolute;
    left: 50%;
    top: 58%;
    transform: translate(-50%, -50%);
    width: min(900px, 70vw);
    height: auto;
    z-index: 3;
    cursor: grab;
  `;
  objectLayer.appendChild(clothImg);

  showHint('揭开红布，一睹真容');

  // ==================== 拖拽红布（向左） ====================
  let clothStartX = 0;
  let clothDragged = false;
  let totalDx = 0;

  clothImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    clothStartX = e.clientX;
    clothDragged = true;
    totalDx = 0;
    clothImg.style.cursor = 'grabbing';
    clothImg.style.transition = 'none';

    function onMove(ev) {
      if (!clothDragged) return;
      const dx = ev.clientX - clothStartX;
      totalDx += dx;
      clothStartX = ev.clientX;

      // 只允许向左移动
      if (dx < 0) {
        const containerRect = gameContainer.getBoundingClientRect();
        const currentLeft = parseFloat(clothImg.style.left) || (clothImg.getBoundingClientRect().left - containerRect.left);
        clothImg.style.left = `${currentLeft + dx}px`;
        clothImg.style.transform = 'none';
      }

      // 向左拖动超过杯子宽度一半就消失
      const cupRect = cupImg.getBoundingClientRect();
      if (totalDx < -(cupRect.width * 0.4)) {
        clothDragged = false;
        clothImg.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        removeCloth();
      }
    }

    function onUp() {
      clothDragged = false;
      clothImg.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      const cupRect = cupImg.getBoundingClientRect();
      if (totalDx < -(cupRect.width * 0.3)) {
        removeCloth();
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // 触摸支持
  clothImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    clothStartX = t.clientX;
    clothDragged = true;
    totalDx = 0;
    clothImg.style.transition = 'none';

    function onMove(ev) {
      if (!clothDragged) return;
      const t2 = ev.touches[0];
      const dx = t2.clientX - clothStartX;
      totalDx += dx;
      clothStartX = t2.clientX;
      if (dx < 0) {
        const containerRect = gameContainer.getBoundingClientRect();
        const currentLeft = parseFloat(clothImg.style.left) || (clothImg.getBoundingClientRect().left - containerRect.left);
        clothImg.style.left = `${currentLeft + dx}px`;
        clothImg.style.transform = 'none';
      }
      const cupRect = cupImg.getBoundingClientRect();
      if (totalDx < -(cupRect.width * 0.4)) {
        clothDragged = false;
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        removeCloth();
      }
    }

    function onUp() {
      clothDragged = false;
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      const cupRect = cupImg.getBoundingClientRect();
      if (totalDx < -(cupRect.width * 0.3)) {
        removeCloth();
      }
    }

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  });

  function removeCloth() {
    if (clothRemoved) return;
    clothRemoved = true;
    hideHint();

    // 红布淡出消失
    clothImg.style.transition = 'opacity 0.6s';
    clothImg.style.opacity = '0';
    setTimeout(() => clothImg.remove(), 600);

    // 提示拖杯子给贵妃
    setTimeout(() => {
      showHint('将鸡缸杯献给贵妃');
      cupImg.classList.add('draggable');
      cupImg.draggable = true;
      setupCupDrag();
    }, 700);
  }

  // ==================== 拖拽杯子给贵妃（右上区域） ====================
  function setupCupDrag() {
    // 贵妃 drop zone（右上区域）
    const consortZone = document.createElement('div');
    consortZone.id = 'consort-zone';
    consortZone.style.cssText = `
      position: absolute;
      right: 15%;
      top: 10%;
      width: 25%;
      height: 40%;
      z-index: 5;
      border: 2px dashed rgba(192,64,64,0.3);
      border-radius: 8px;
    `;
    objectLayer.appendChild(consortZone);

    cupImg.addEventListener('dragstart', (e) => {
      cupImg.classList.add('dragging');
      e.dataTransfer.setData('text/plain', 'cup');
      e.dataTransfer.effectAllowed = 'move';
    });

    cupImg.addEventListener('dragend', () => {
      cupImg.classList.remove('dragging');
    });

    consortZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      consortZone.style.borderColor = 'rgba(192,64,64,0.8)';
      consortZone.style.background = 'rgba(192,64,64,0.06)';
    });

    consortZone.addEventListener('dragleave', () => {
      consortZone.style.borderColor = 'rgba(192,64,64,0.3)';
      consortZone.style.background = 'transparent';
    });

    consortZone.addEventListener('drop', (e) => {
      e.preventDefault();
      consortZone.style.borderColor = 'rgba(192,64,64,0.3)';
      consortZone.style.background = 'transparent';
      consortZone.remove();
      hideHint();

      // 杯子移动到贵妃位置
      cupImg.style.transition = 'all 0.8s var(--ease-brush)';
      cupImg.style.left = '75%';
      cupImg.style.top = '30%';
      cupImg.style.transform = 'translate(-50%, -50%)';
      cupImg.draggable = false;
      cupImg.classList.remove('draggable');

      cupDelivered = true;

      // 杯子淡出消失
      cupImg.style.transition = 'opacity 0.6s';
      cupImg.style.opacity = '0';
      setTimeout(() => cupImg.remove(), 600);

      setTimeout(() => {
        showHint('点击屏幕，聆听对话');
        startDialogSequence();
      }, 900);
    });
  }

  // ==================== 5轮对话序列 ====================
  function startDialogSequence() {
    dialogIndex = 0;

    function nextDialog() {
      if (isLocked()) return;
      if (dialogIndex >= dialogs.length) {
        hideHint();
        gameContainer.removeEventListener('click', nextDialog);
        gameContainer._scene3Handler = null;
        // 对话结束，切换到场景4
        setTimeout(() => switchScene(4), 1500);
        return;
      }

      clearAllDialogs();
      const d = dialogs[dialogIndex];
      showDialog(d.text, d.pos);
      dialogIndex++;
    }

    // 点击推进对话
    gameContainer.addEventListener('click', nextDialog);
    gameContainer._scene3Handler = nextDialog;

    // 自动显示第一句
    setTimeout(() => nextDialog(), 500);
  }
}
