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
    font-size: 2.5rem;
    color: var(--vermillion);
    letter-spacing: 0.15em;
    z-index: 5;
    padding: 0.5rem 1.5rem;
    background: var(--paper);
    border: 2px dashed var(--ink);
    border-radius: 6px;
  `;
  timeLabel.textContent = '2014年4月8日';
  uiLayer.appendChild(timeLabel);

  // 2秒后开始对话
  setTimeout(() => {
    startAuctionDialogs();
  }, 2000);

  // ==================== 前3句对话（点击或3秒自动切换） ====================
  const preDialogs = [dialogs.d1, dialogs.d2, dialogs.d3];
  let autoTimer = null;
  let preFinished = false;

  function startAuctionDialogs() {
    dialogIdx = 0;
    preFinished = false;
    showPreDialog();
  }

  function showPreDialog() {
    if (preFinished) return;
    if (dialogIdx >= preDialogs.length) {
      preFinished = true;
      gameContainer.removeEventListener('click', onClickPre);
      gameContainer._scene9Handler = null;
      clearTimeout(autoTimer);
      showBidInput();
      return;
    }
    clearAllDialogs();
    const d = preDialogs[dialogIdx];
    showDialog(d.text, d.pos, 0);
    dialogIdx++;

    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      showPreDialog();
    }, 3000);
  }

  function onClickPre(e) {
    if (isLocked() || preFinished) return;
    e.stopPropagation();
    clearTimeout(autoTimer);
    showPreDialog();
  }

  gameContainer.addEventListener('click', onClickPre);
  gameContainer._scene9Handler = onClickPre;
  showPreDialog();

  // ==================== 输入框 ====================
  function showBidInput() {
    phase = 1;
    clearAllDialogs();

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 12%;
      transform: translateX(-50%);
      z-index: 10;
      text-align: center;
    `;

    const label = document.createElement('div');
    label.textContent = '请输入 1.0 ~ 5.0';
    label.style.cssText = `
      font-family: var(--font-title);
      font-size: 3rem;
      color: #ffffff;
      margin-bottom: 1.5rem;
      letter-spacing: 0.1em;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '5';
    input.step = '0.1';
    input.className = 'bid-input';
    input.placeholder = '';

    const btn = document.createElement('button');
    btn.textContent = '出价';
    btn.className = 'btn-handdraw';
    btn.style.marginLeft = '2rem';
    btn.style.fontSize = '2.5rem';
    btn.style.padding = '1rem 3rem';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#ffffff';

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputContainer.appendChild(btn);
    uiLayer.appendChild(inputContainer);

    // 阻止点击冒泡到gameContainer
    inputContainer.addEventListener('click', function(e) { e.stopPropagation(); });

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

  // ==================== 竞价成功后对话（点击或3秒自动切换） ====================
  let winTimer = null;
  let winFinished = false;

  function showWinSequence() {
    const winDialogs = [dialogs.win, dialogs.sold, dialogs.cong];
    let wi = 0;
    winFinished = false;

    function showWin() {
      if (winFinished) return;
      if (wi >= winDialogs.length) {
        winFinished = true;
        gameContainer.removeEventListener('click', onClickWin);
        gameContainer._scene9WinHandler = null;
        clearTimeout(winTimer);
        setTimeout(() => switchScene(10), 2000);
        return;
      }
      clearAllDialogs();
      const d = winDialogs[wi];
      showDialog(d.text, d.pos, 0, { big: d.big });
      wi++;

      clearTimeout(winTimer);
      winTimer = setTimeout(() => {
        showWin();
      }, 3000);
    }

    function onClickWin(e) {
      if (isLocked() || winFinished) return;
      e.stopPropagation();
      clearTimeout(winTimer);
      showWin();
    }

    gameContainer.addEventListener('click', onClickWin);
    gameContainer._scene9WinHandler = onClickWin;
    showWin();
  }
}
