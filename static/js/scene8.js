/* ============================================
   场景8: 西方拍卖会 — 拖拽排序时间线
   交互: 拖拽4个气泡按时间顺序排列
   ============================================ */

function initScene8() {
  // 确保背景已设置
  bgImg.src = '/material/scene/s8.png';

  const BUBBLES = [
    {
      id: 1,
      year: '1949年',
      title: '香港·仇焱之',
      text: '战后文物外流，香港成中转站。古玩商仇焱之，以1000港币"捡漏"买下一对鸡缸杯。当时没人信这是真成化，他却认准：胎薄、色润、画活。',
      order: 0,
    },
    {
      id: 2,
      year: '50年代',
      title: '伦敦·Dreyfus夫人',
      text: '仇焱之出手，杯子到英国，入藏Leopold Dreyfus夫人之手，正式进入西方顶级收藏圈。',
      order: 1,
    },
    {
      id: 3,
      year: '1980年',
      title: '香港苏富比→日本·坂本五郎',
      text: '上拍，528万港元成交，创纪录。买家是日本"小拿破仑"坂本五郎。马未都回忆：在坂本家，仆人用这杯给他盛茶汤——他喝了"这辈子最贵的一口茶"。',
      order: 2,
    },
    {
      id: 4,
      year: '1999年',
      title: '香港→瑞士·玫茵堂',
      text: '再上拍，2917万港元成交。入藏瑞士银行家"玫茵堂"，成为其镇堂之宝，一藏15年。',
      order: 3,
    },
  ];

  // 打乱顺序
  const shuffled = [...BUBBLES].sort(() => Math.random() - 0.5);

  const bubbleEls = [];
  const startYPositions = []; // 记录初始Y位置

  shuffled.forEach((bubble, index) => {
    const el = document.createElement('div');
    el.className = 'sort-bubble';
    el.draggable = true;
    el.dataset.id = bubble.id;
    el.dataset.order = bubble.order;
    el.style.top = `${10 + index * 18}%`;
    el.innerHTML = `
      <span class="bubble-year">${bubble.year}</span>，${bubble.title}<br>
      <span style="font-size:0.8rem;color:var(--ink);">${bubble.text}</span>
    `;
    objectLayer.appendChild(el);
    bubbleEls.push(el);

    // 拖拽事件
    el.addEventListener('dragstart', (e) => {
      el.classList.add('dragging');
      e.dataTransfer.setData('text/plain', el.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      checkOrder();
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromId = e.dataTransfer.getData('text/plain');
      const fromEl = bubbleEls.find(b => b.dataset.id === fromId);
      const toEl = el;
      if (fromEl && toEl && fromEl !== toEl) {
        // 交换位置
        const fromTop = fromEl.style.top;
        fromEl.style.top = toEl.style.top;
        toEl.style.top = fromTop;
      }
    });
  });

  showHint('拖动排序');

  // 箭头+文字
  var arrowContainer = document.createElement('div');
  arrowContainer.style.cssText = 'position:absolute;right:8%;top:10%;height:72%;z-index:5;display:flex;flex-direction:column;align-items:center;';
  var arrowLine = document.createElement('div');
  arrowLine.style.cssText = 'width:2px;flex:1;background:#ffffff;';
  var arrowHead = document.createElement('div');
  arrowHead.style.cssText = 'width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #ffffff;';
  var arrowText = document.createElement('div');
  arrowText.textContent = '进入现代';
  arrowText.style.cssText = 'writing-mode:vertical-rl;color:#ffffff;font-family:var(--font-title);font-size:1.5rem;letter-spacing:0.2em;margin-top:0.5rem;';
  arrowContainer.appendChild(arrowHead);
  arrowContainer.appendChild(arrowLine);
  arrowContainer.appendChild(arrowText);
  objectLayer.appendChild(arrowContainer);

  // ==================== 检查排序 ====================
  function checkOrder() {
    // 按当前Y坐标排序
    const sorted = [...bubbleEls].sort((a, b) => {
      return parseFloat(a.style.top) - parseFloat(b.style.top);
    });

    // 检查 data-order 是否 0,1,2,3
    const correct = sorted.every((el, i) => parseInt(el.dataset.order) === i);

    if (correct) {
      hideHint();
      lock(500);

      // 保持2秒再消失
      setTimeout(() => {
        bubbleEls.forEach(el => {
          el.style.transition = 'opacity 0.6s';
          el.style.opacity = '0';
        });
        arrowContainer.style.transition = 'opacity 0.6s';
        arrowContainer.style.opacity = '0';
        setTimeout(() => {
          bubbleEls.forEach(el => el.remove());
          arrowContainer.remove();
          switchScene(9);
        }, 800);
      }, 2000);
    }
  }
}
