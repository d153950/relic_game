/* ============================================
   场景9: 现代拍卖会 — 竞价回归
   交互: 点击对话 → 输入竞价 → 继续对话
   ============================================ */

function initScene9() {
  const dialogs = SCENES[9].dialogs;

  let phase = 0; // 0=前3句对话, 1=等待输入, 2=后3句对话
  let dialogIdx = 0;

  // ==================== 显示杯子 + 时间标签 ====================
  createObject('p8.png', 'cup-s9', {
    x: '50%', y: '45%',
    transform: 'translate(-50%, -50%)',
    width: 'min(400px, 35vw)',
  });

  // 时间标签
  const timeLabel = document.createElement('div');
  timeLabel.style.cssText = `
    position: absolute;
    right: 5%;
    top: 5%;
    font-family: var(--font-title);
    font-size: 1.5rem;
    color: var(--vermillion);
    letter-spacing: 0.1em;
    z-index: 5;
  `;
  timeLabel.textContent = '2014年4月8日';
  uiLayer.appendChild(timeLabel);

  // 2秒后开始对话
  setTimeout(() => {
    startAuctionDialogs();
  }, 2000);

  // ==================== 前3句对话 ====================
  const preDialogs = [dialogs.d1, dialogs.d2, dialogs.d3];

  function startAuctionDialogs() {
    dialogIdx = 0;

    function nextDialog() {
      if (isLocked()) return;
      if (dialogIdx >= preDialogs.length) {
        gameContainer.removeEventListener('click', nextDialog);
        gameContainer._scene9Handler = null;
        showBidInput();
        return;
      }
      clearAllDialogs();
      const d = preDialogs[dialogIdx];
      showDialog(d.text, d.pos, d.duration);
      dialogIdx++;
    }

    gameContainer.addEventListener('click', nextDialog);
    gameContainer._scene9Handler = nextDialog;
    nextDialog();
  }

  // ==================== 输入框 ====================
  function showBidInput() {
    phase = 1;
    clearAllDialogs();

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      text-align: center;
    `;

    const label = document.createElement('div');
    label.textContent = '请输入竞价（1~5亿，一位小数）';
    label.style.cssText = `
      font-family: var(--font-body);
      font-size: 1.2rem;
      color: var(--ink);
      margin-bottom: 0.8rem;
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '5';
    input.step = '0.1';
    input.className = 'bid-input';
    input.placeholder = '2.5';

    const btn = document.createElement('button');
    btn.textContent = '出价';
    btn.className = 'btn-handdraw';
    btn.style.marginLeft = '1rem';
    btn.style.fontSize = '1rem';
    btn.style.padding = '0.5rem 1.5rem';

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputContainer.appendChild(btn);
    uiLayer.appendChild(inputContainer);

    input.focus();

    function submitBid() {
      const val = parseFloat(input.value);
      if (isNaN(val) || val < 1 || val > 5) return;

      inputContainer.remove();
      clearAllDialogs();

      if (val > 2.5) {
        showDialog(dialogs.high.text, dialogs.high.pos, dialogs.high.duration);
        setTimeout(() => {
          clearAllDialogs();
          showBidInput();
        }, dialogs.high.duration + 500);
      } else if (val < 2.5) {
        showDialog(dialogs.low.text, dialogs.low.pos, dialogs.low.duration);
        setTimeout(() => {
          clearAllDialogs();
          showBidInput();
        }, dialogs.low.duration + 500);
      } else {
        // 正确！2.5亿
        phase = 2;
        showWinSequence();
      }
    }

    btn.addEventListener('click', submitBid);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitBid();
    });
  }

  // ==================== 竞价成功后对话 ====================
  function showWinSequence() {
    const winDialogs = [dialogs.win, dialogs.sold, dialogs.cong];
    let i = 0;

    function next() {
      if (i >= winDialogs.length) {
        gameContainer.removeEventListener('click', next);
        setTimeout(() => switchScene(10), 2000);
        return;
      }
      clearAllDialogs();
      const d = winDialogs[i];
      showDialog(d.text, d.pos, d.duration, { big: d.big });
      i++;
    }

    gameContainer.addEventListener('click', next);
    gameContainer._scene9WinHandler = next;
    next();
  }
}
