/* ============================================
   场景9: 现代拍卖会 - 竞价回归
   ============================================ */

function initScene9() {
  var dialogs = SCENES[9].dialogs;

  createObject('p8.png', 'cup-s9', {
    x: '50%', y: '45%',
    transform: 'translate(-50%, -50%)',
    width: 'min(400px, 35vw)',
  });

  var timeLabel = document.createElement('div');
  timeLabel.style.cssText = 'position:absolute;right:5%;top:5%;font-family:var(--font-title);font-size:2.5rem;color:var(--vermillion);letter-spacing:0.15em;z-index:5;padding:0.5rem 1.5rem;background:var(--paper);border:2px dashed var(--ink);border-radius:6px;';
  timeLabel.textContent = '2014年4月8日';
  uiLayer.appendChild(timeLabel);

  var preDialogs = [dialogs.d1, dialogs.d2, dialogs.d3];
  var idx = 0;
  var timer = null;
  var phaseDone = false;

  function showNext() {
    if (phaseDone) return;
    clearTimeout(timer);
    if (idx >= preDialogs.length) {
      phaseDone = true;
      gameContainer.removeEventListener('click', onGameClick);
      showBidInput();
      return;
    }
    clearAllDialogs();
    showDialog(preDialogs[idx].text, preDialogs[idx].pos, 0);
    idx++;
    timer = setTimeout(showNext, 3000);
  }

  function onGameClick(e) {
    if (phaseDone || isLocked()) return;
    clearTimeout(timer);
    showNext();
  }

  setTimeout(function() {
    gameContainer.addEventListener('click', onGameClick);
    showNext();
  }, 2000);

  // ==================== 输入框 ====================
  function showBidInput() {
    clearAllDialogs();
    showHint('估价竞拍');
    uiLayer.innerHTML = '';

    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:50%;bottom:12%;transform:translateX(-50%);z-index:10;text-align:center;';
    container.addEventListener('click', function(e) { e.stopPropagation(); });

    var label = document.createElement('div');
    label.textContent = '请输入 1.6 ~ 4.6';
    label.style.cssText = 'font-family:var(--font-title);font-size:3rem;color:#ffffff;margin-bottom:1.5rem;letter-spacing:0.1em;text-shadow:1px 1px 3px rgba(0,0,0,0.5);';

    var input = document.createElement('input');
    input.type = 'number';
    input.min = '1.6';
    input.max = '4.6';
    input.step = '0.1';
    input.className = 'bid-input';

    var btn = document.createElement('button');
    btn.textContent = '出价';
    btn.className = 'btn-handdraw';
    btn.style.cssText = 'margin-left:2rem;font-size:2.5rem;padding:1rem 3rem;color:#ffffff;border-color:#ffffff;';

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(btn);
    uiLayer.appendChild(container);
    input.focus();

    var bidDone = false;

    function submitBid() {
      if (bidDone) return;
      var val = parseFloat(input.value);
      if (isNaN(val) || val < 1.6 || val > 4.6) return;

      if (val > 2.5) {
        container.remove();
        clearAllDialogs();
        showErrorDialog(dialogs.high);
      } else if (val < 2.5) {
        container.remove();
        clearAllDialogs();
        showErrorDialog(dialogs.low);
      } else {
        bidDone = true;
        container.remove();
        hideHint();
        clearAllDialogs();
        showWinSequence();
      }
    }

    btn.addEventListener('click', submitBid);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitBid(); });
  }

  // 错误提示
  function showErrorDialog(d) {
    clearAllDialogs();
    showDialog(d.text, d.pos, 0);
    var errTimer = setTimeout(function() {
      gameContainer.removeEventListener('click', onErrClick);
      clearAllDialogs();
      showBidInput();
    }, 3000);
    function onErrClick() {
      clearTimeout(errTimer);
      gameContainer.removeEventListener('click', onErrClick);
      clearAllDialogs();
      showBidInput();
    }
    gameContainer.addEventListener('click', onErrClick);
  }

  // ==================== 胜利对话 ====================
  function showWinSequence() {
    playSFX('applause.mp3', 5000);
    var winDialogs = [dialogs.win, dialogs.sold, dialogs.cong];
    var wi = 0;
    var wTimer = null;
    var wDone = false;

    function showWin() {
      if (wDone) return;
      clearTimeout(wTimer);
      if (wi >= winDialogs.length) {
        wDone = true;
        gameContainer.removeEventListener('click', onWinClick);
        setTimeout(function() { switchScene(10); }, 2000);
        return;
      }
      clearAllDialogs();
      var d = winDialogs[wi];
      showDialog(d.text, d.pos, 0, { big: d.big });
      wi++;
      wTimer = setTimeout(showWin, 3000);
    }

    function onWinClick(e) {
      if (wDone || isLocked()) return;
      clearTimeout(wTimer);
      showWin();
    }

    gameContainer.addEventListener('click', onWinClick);
    showWin();
  }
}
