/* ============================================
   场景2: 明代画师工作坊 — 给无色杯胎上彩
   交互: 拖拽标签匹配颜色 → 点击 → 拖拽到托盘
   ============================================ */

function initScene2() {
  const dialogs = SCENES[2].dialogs;

  // 标签数据：文件名 对应 颜色名
  const LABELS = [
    { file: 'l1.png', color: '矾红' },
    { file: 'l2.png', color: '古黄' },
    { file: 'l3.png', color: '大绿' },
    { file: 'l4.png', color: '水绿' },
    { file: 'l5.png', color: '赭石' },
  ];

  // 颜料团在背景图上的位置（百分比定位，需要你根据实际 s2.png 调整）
  // 这些是颜料团的大致中心位置
  // 坐标基于 s2.png 原图 2732×1534，转为百分比
  const PAINT_SPOTS = {
    '矾红': { x: 27.6, y: 16.5 },
    '古黄': { x: 38.6, y: 15.6 },
    '大绿': { x: 49.9, y: 15.8 },
    '水绿': { x: 61.3, y: 15.6 },
    '赭石': { x: 72.2, y: 16.2 },
  };

  let cupImg = null;
  let trayImg = null;
  let matchedCount = 0;
  let allMatched = false;

  // ==================== 显示杯胎 p6 ====================
  cupImg = createObject('p6.png', 'cup-s2', {
    x: '50%', y: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  // ==================== 创建颜料团 drop zone ====================
  const dropZones = {};
  Object.entries(PAINT_SPOTS).forEach(([color, pos]) => {
    const zone = document.createElement('div');
    zone.className = 'paint-drop-zone';
    zone.dataset.color = color;
    zone.style.cssText = `
      left: ${pos.x}%;
      top: ${pos.y}%;
      width: 120px;
      height: 120px;
      transform: translate(-50%, -50%);
    `;
    objectLayer.appendChild(zone);
    dropZones[color] = zone;

    // drop 事件
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('highlight');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('highlight');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('highlight');
      const labelColor = e.dataTransfer.getData('text/plain');
      if (labelColor === color) {
        handleMatch(labelColor, zone);
      }
    });
  });

  showHint('拖动标签，匹配矿彩');

  // ==================== 创建标签（顺序打乱，X中轴对齐颜料团） ====================
  const paintXValues = Object.values(PAINT_SPOTS).map(p => p.x);
  const shuffledColors = [...LABELS].sort(() => Math.random() - 0.5);

  shuffledColors.forEach((label, index) => {
    const el = document.createElement('div');
    el.className = 'color-label';
    el.textContent = label.color;
    el.draggable = true;
    el.dataset.color = label.color;
    // X中轴对齐颜料团，底部排列
    el.style.cssText += `
      left: ${paintXValues[index]}%;
      bottom: 12%;
      transform: translateX(-50%);
    `;
    objectLayer.appendChild(el);

    // 拖拽事件
    el.addEventListener('dragstart', (e) => {
      if (el.classList.contains('matched')) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('text/plain', label.color);
      e.dataTransfer.effectAllowed = 'move';
      el.style.opacity = '0.6';
    });

    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
    });
  });

  // ==================== 匹配处理 ====================
  function handleMatch(color, zone) {
    // 隐藏匹配的标签
    const labelEl = objectLayer.querySelector(`.color-label[data-color="${color}"]`);
    if (labelEl && !labelEl.classList.contains('matched')) {
      labelEl.classList.add('matched');
      labelEl.remove();
      matchedCount++;

      // 在颜料团位置固定颜色标记
      const marker = document.createElement('div');
      marker.className = 'color-label';
      marker.textContent = color;
      marker.style.cssText = `
        left: ${zone.style.left};
        top: ${zone.style.top};
        transform: translate(-50%, -50%);
        pointer-events: none;
        background: rgba(245, 240, 232, 0.9);
        border-style: solid;
        border-color: var(--vermillion);
      `;
      objectLayer.appendChild(marker);

      // 移除 drop zone
      zone.style.pointerEvents = 'none';
      zone.style.borderColor = 'transparent';

      // 检测是否全部匹配
      if (matchedCount >= LABELS.length) {
        onAllMatched();
      }
    }
  }

  // ==================== 全部匹配完成 ====================
  function onAllMatched() {
    allMatched = true;
    lock(500);

    showHint('点击上釉彩');
    setTimeout(() => {
      clearAllDialogs();
      showDialog(dialogs.matched.text, dialogs.matched.pos, 3000);
      // 3秒后标签和对话框都消失
      setTimeout(() => {
        clearAllDialogs();
        objectLayer.querySelectorAll('.color-label.matched, .color-label[style*="border-style: solid"]').forEach(el => el.remove());
      }, 3000);
    }, 400);
  }

  // ==================== 点击杯胎 p6 → p7 ====================
  cupImg.addEventListener('click', function onClickCup() {
    if (isLocked() || !allMatched) return;
    lock(500);

    cupImg.src = 'material/cup/p7.png';
    playSFX('paint.mp3', 3000);
    hideHint();
    clearAllDialogs();
    showDialog(dialogs.colored.text, dialogs.colored.pos, dialogs.colored.duration);

    cupImg.removeEventListener('click', onClickCup);

    // 点击 p7 才触发托盘滑入
    cupImg.addEventListener('click', function onClickP7() {
      if (isLocked()) return;
      lock(500);
      clearAllDialogs();
      showHint('拖动交付');
      cupImg.removeEventListener('click', onClickP7);
      enterTrayPhase();
    });
  });

  // ==================== tray 滑入 + 拖拽 p7 ====================
  function enterTrayPhase() {
    clearAllDialogs();

    // 创建托盘
    trayImg = document.createElement('img');
    trayImg.src = 'material/tray.png';
    trayImg.id = 'tray-s2';
    trayImg.style.cssText = `
      position: absolute;
      right: -30%;
      top: 55%;
      width: min(800px, 60vw);
      height: auto;
      transform: translateY(-50%);
      transition: right 0.8s var(--ease-brush);
      z-index: 2;
    `;
    objectLayer.appendChild(trayImg);

    // 触发滑入动画，露出3/5（2/5在屏幕外）
    requestAnimationFrame(() => {
      trayImg.style.right = '-15%';
    });

    // 动画完成后提示拖拽
    setTimeout(() => {
      showHint('拖动交付');
      cupImg.classList.add('draggable');
      cupImg.draggable = true;

      cupImg.addEventListener('dragstart', (e) => {
        cupImg.classList.add('dragging');
        e.dataTransfer.setData('text/plain', 'cup');
        e.dataTransfer.effectAllowed = 'move';
      });

      cupImg.addEventListener('dragend', () => {
        cupImg.classList.remove('dragging');
      });

      // tray 作为 drop zone
      trayImg.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        trayImg.style.filter = 'brightness(1.1)';
      });

      trayImg.addEventListener('dragleave', () => {
        trayImg.style.filter = '';
      });

      trayImg.addEventListener('drop', (e) => {
        e.preventDefault();
        trayImg.style.filter = '';
        hideHint();

        // p7 淡化消失
        cupImg.style.transition = 'opacity 0.8s';
        cupImg.style.opacity = '0';

        // 触发最终旁白
        clearAllDialogs();
        showDialog(dialogs.tray.text, dialogs.tray.pos, dialogs.tray.duration);

        playSFX('fire.mp3', 3000);
        setTimeout(() => {
          cupImg.remove();
          trayImg.remove();
          switchScene(3);
        }, dialogs.tray.duration + 500);
      });
    }, 900);
  }
}
