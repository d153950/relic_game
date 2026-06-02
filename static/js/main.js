/* ============================================
   鸡缸杯·六百年 — 主控制器
   ============================================ */

// ==================== DOM 引用 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const app = $('#app');
const startScreen = $('#start-screen');
const gameContainer = $('#game-container');
const endingScreen = $('#ending-screen');
const bgLayer = $('#bg-layer');
const bgImg = $('#bg-img');
const objectLayer = $('#object-layer');
const dialogLayer = $('#dialog-layer');
const uiLayer = $('#ui-layer');
const hintEl = $('#hint');
const fadeOverlay = $('#fade-overlay');

// ==================== 游戏状态 ====================
const STATE = {
  phase: 'start',        // 'start' | 'playing' | 'ending'
  scene: 0,              // 当前场景 1~10
  step: 0,               // 场景内步骤
  dialogTimers: [],      // 对话框定时器
  locked: false,         // 是否锁定交互
};

// ==================== 场景数据 ====================
// 所有场景的对话和配置
const SCENES = {
  1: {
    bg: 's1.png',
    dialogs: {
      d1:  { text: '师傅，近来麻仓土，已然日渐稀少了吗？', pos: 'left', duration: 3000 },
      d2:  { text: '正是。宫里钦定此杯，百窑难成一器，百余件里能挑出一件上品，已是万幸。', pos: 'top', duration: 3000 },
      d3:  { text: '烧制御器，非此土不可吗？', pos: 'left', duration: 3000 },
      d4:  { text: '唯麻仓土胎质细腻坚白，轻薄透光，方能成御用绝品，你且用心记牢。', pos: 'top', duration: 3000 },
      d5a: { text: '这釉下青线勾勒，着实太难把控了……', pos: 'left', duration: 2000 },
      d5b: { text: '慎手慎笔！平等青料珍稀无比，此宫廷秘法，分毫错不得。', pos: 'top', duration: 3000 },
      d6:  { text: '全杯通罩透釉，薄浆匀挂，莫积厚浆糊了胎上青线，留心细看，好生学着。', pos: 'top', duration: 4000 },
    },
  },
  2: {
    bg: 's2.png',
    dialogs: {
      matched: { text: '颜料齐备、次序规整，此番便可静心填彩施色了。', pos: 'left', duration: 4000 },
      colored: { text: '填、点、覆、染，层层施彩，分寸合规，此番器型纹样已然周全。', pos: 'left', duration: 4000 },
      tray:    { text: '诸色釉火温度各有讲究，愿此器入窑无疵，不负窑火、不负天工。', pos: 'left', duration: 4000 },
    },
  },
  3: {
    bg: 's3.png',
    dialogs: [
      { text: '此杯绘雏鸡嬉闹，色泽玲珑，陛下费心了。', pos: 'right', speaker: '贵妃' },
      { text: '臣妾年岁见长，朝野闲话纷纭，恐陛下日久生厌。', pos: 'right', speaker: '贵妃' },
      { text: '雄鸡护家，母鸡育雏，此杯便是朕所求的阖家相守。', pos: 'left', speaker: '皇帝' },
      { text: '朕幼年遭废幽居，满目寒凉，唯卿守在身侧，患难相伴。', pos: 'left', speaker: '皇帝' },
      { text: '得陛下此言，此生足矣。', pos: 'right', speaker: '贵妃' },
    ],
  },
  7: {
    bg: 's7.png',
    dialogs: {
      friend: { text: '人人都说这是晚清仿瓷，你何苦重金入手？', pos: 'left', duration: 3000 },
      hero:   { text: '汝等只观品相，未察胎土、平等青料与填彩笔法。胎薄色润、画工灵动，确是成窑鸡缸，日久自见分晓。', pos: 'bottom', duration: 3000 },
    },
  },
  9: {
    bg: 's9.png',
    dialogs: {
      d1: { text: '本场玫茵堂旧藏成化斗彩鸡缸杯，起拍价一亿六千万港元，诸位藏家，可以出价！', pos: 'top', duration: 5000 },
      d2: { text: '一亿八千万！此稀世名瓷，值得重金珍藏！', pos: 'left', duration: 5000 },
      d3: { text: '两亿！此物流落海外太久，我志在必得！', pos: 'right', duration: 5000 },
      low:  { text: '价位节节走高，我若出价保守，恐无缘这件至宝。', pos: 'bottom', duration: 3000 },
      high: { text: '若以此价居高不下，囊中银两怕是难以接续。', pos: 'bottom', duration: 3000 },
      win:  { text: '两亿五千万，我收，迎此杯回归中土！', pos: 'center', duration: 5000, big: true },
      sold: { text: '落槌！两亿五千万港元，含佣金合计逾二点八亿港元，创下历来中国古代瓷器拍卖新高！', pos: 'top', duration: 5000 },
      cong: { text: '恭喜刘益谦先生！', pos: 'top', duration: 5000 },
    },
  },
  10: {
    bg: 's10.png',
    dialogs: [
      { text: '各位游客，眼前便是明成化斗彩鸡缸杯。', pos: 'bottom' },
      { text: '它以稀缺麻仓土制胎，先平等青料勾线高温烧成胎体，再填矾红、古黄等五色矿彩二次低温烘烧，古时百窑难成一器。', pos: 'bottom' },
      { text: '后世麻仓土用尽，平等青失传，便再难仿制。', pos: 'bottom' },
      { text: '成化帝幼年孤苦，唯有年长十七岁的万贵妃朝夕不离不弃。此杯便是当年成化帝为万贵妃定制，杯上雄鸡啼鸣、母鸡护雏，寄托相守天伦的情意。', pos: 'bottom' },
      { text: '成化帝死后，鸡缸杯深藏内库。明末李自成破北京，宫中珍宝被拷掠、损毁、少数流向民间。清代乾隆极爱此杯，一边写诗赞美，一边命官窑拼命仿制。真杯被重新收进清宫，藏于深宫；而这一只，清末又随动荡流出宫外。', pos: 'bottom' },
      { text: '此杯出宫后漂泊海外百年，2014年经拍卖回归，藏家重金接回落户龙美术馆。', pos: 'bottom' },
      { text: '方寸小杯，凝着古法匠心与六百年家国归途。', pos: 'bottom' },
    ],
  },
};

// ==================== 工具函数 ====================

/** 切换屏幕 */
function switchScreen(show) {
  [startScreen, gameContainer, endingScreen].forEach(s => s.classList.add('hidden'));
  if (show === 'start') startScreen.classList.remove('hidden');
  else if (show === 'game') gameContainer.classList.remove('hidden');
  else if (show === 'ending') endingScreen.classList.remove('hidden');
  STATE.phase = show;
}

/** 淡入淡出过渡 */
function fadeTransition(callback, duration = 600) {
  fadeOverlay.classList.add('active');
  setTimeout(() => {
    callback();
    setTimeout(() => {
      fadeOverlay.classList.remove('active');
    }, 100);
  }, duration / 2);
}

/** 切换场景 */
function switchScene(sceneNum) {
  STATE.scene = sceneNum;
  STATE.step = 0;
  clearAllDialogs();
  objectLayer.innerHTML = '';
  uiLayer.innerHTML = '';
  hintEl.classList.add('hidden');

  const cfg = SCENES[sceneNum];
  if (cfg && cfg.bg) {
    bgImg.src = `/material/scene/${cfg.bg}`;
  }

  fadeTransition(() => {
    // 加载场景脚本
    loadScene(sceneNum);
  });
}

/** 加载场景逻辑 */
function loadScene(n) {
  switch (n) {
    case 1: initScene1(); break;
    case 2: initScene2(); break;
    case 3: initScene3(); break;
    case 4: runScene456(); break;
    case 7: initScene7(); break;
    case 8: initScene8(); break;
    case 9: initScene9(); break;
    case 10: initScene10(); break;
  }
}

/** 显示对话框 */
function showDialog(text, pos = 'left', duration = 0, opts = {}) {
  const div = document.createElement('div');
  div.className = `dialog ${pos}`;
  if (opts.big) div.classList.add('big');
  div.textContent = text;
  dialogLayer.appendChild(div);

  if (duration > 0) {
    const timer = setTimeout(() => {
      div.classList.add('fading');
      setTimeout(() => div.remove(), 500);
    }, duration);
    STATE.dialogTimers.push(timer);
  }

  return div;
}

/** 清除所有对话框 */
function clearAllDialogs() {
  STATE.dialogTimers.forEach(t => clearTimeout(t));
  STATE.dialogTimers = [];
  dialogLayer.innerHTML = '';
}

/** 锁定/解锁交互 */
function lock(ms = 0) {
  STATE.locked = true;
  if (ms > 0) {
    setTimeout(() => { STATE.locked = false; }, ms);
  }
}

function unlock() {
  STATE.locked = false;
}

/** 检查是否锁定 */
function isLocked() {
  return STATE.locked;
}

/** 显示提示 */
function showHint(text) {
  hintEl.textContent = text;
  hintEl.classList.remove('hidden');
}

function hideHint() {
  hintEl.classList.add('hidden');
}

/** 创建操作对象图片 */
function createObject(src, id, opts = {}) {
  const img = document.createElement('img');
  img.src = `/material/cup/${src}`;
  img.className = 'object-img';
  if (id) img.id = id;
  if (opts.draggable) {
    img.classList.add('draggable');
    img.draggable = true;
  }
  if (opts.x) img.style.left = opts.x;
  if (opts.y) img.style.top = opts.y;
  if (opts.width) img.style.width = opts.width;
  if (opts.height) img.style.height = opts.height;
  if (opts.transform) img.style.transform = opts.transform;
  objectLayer.appendChild(img);
  return img;
}

// ==================== 场景 4~6: 自动过渡 ====================
function runScene456() {
  const seq = [
    { bg: 's4.png', duration: 3000 },
    { bg: 's5.png', duration: 3000 },
    { bg: 's6.png', duration: 3000 },
  ];

  let currentIdx = 0;
  let autoTimer = null;
  let finished = false;

  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(autoTimer);
    gameContainer.removeEventListener('click', onClick);
  }

  function play(i) {
    if (finished) return;
    if (i >= seq.length) {
      cleanup();
      switchScene(7);
      return;
    }
    currentIdx = i;
    bgImg.src = `/material/scene/${seq[i].bg}`;
    autoTimer = setTimeout(() => play(i + 1), seq[i].duration);
  }

  function onClick(e) {
    if (isLocked() || finished) return;
    e.stopPropagation();
    clearTimeout(autoTimer);
    play(currentIdx + 1);
  }

  // 清理场景3的残留事件
  if (gameContainer._scene3Handler) {
    gameContainer.removeEventListener('click', gameContainer._scene3Handler);
    gameContainer._scene3Handler = null;
  }

  gameContainer.addEventListener('click', onClick);
  gameContainer._scene456Handler = onClick;

  play(0);
}

// ==================== 场景10: 博物馆 ====================
function initScene10() {
  // 展示成品杯
  createObject('p8.png', 'cup-final', {
    x: '50%', y: '40%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  const dialogs = SCENES[10].dialogs;
  let idx = 0;
  let finished = false;

  function nextDialog() {
    if (isLocked() || finished) return;
    if (idx >= dialogs.length) {
      finished = true;
      gameContainer.removeEventListener('click', nextDialog);
      gameContainer._scene10Handler = null;
      clearAllDialogs();
      // 最后一句后通关
      setTimeout(() => endGame(), 2000);
      return;
    }
    clearAllDialogs();
    const d = dialogs[idx];
    showDialog(d.text, d.pos);
    idx++;
  }

  // 清理之前场景的残留事件
  if (gameContainer._scene9Handler) {
    gameContainer.removeEventListener('click', gameContainer._scene9Handler);
    gameContainer._scene9Handler = null;
  }
  if (gameContainer._scene9WinHandler) {
    gameContainer.removeEventListener('click', gameContainer._scene9WinHandler);
    gameContainer._scene9WinHandler = null;
  }

  // 点击任意位置推进
  gameContainer.addEventListener('click', nextDialog);
  gameContainer._scene10Handler = nextDialog;

  // 显示第一条
  setTimeout(() => nextDialog(), 500);
}

// ==================== 开始 / 通关 ====================
function startGame() {
  switchScreen('game');
  switchScene(1);
}

function endGame() {
  switchScreen('ending');
  // 清理可能的残留
  clearAllDialogs();
  objectLayer.innerHTML = '';
  uiLayer.innerHTML = '';
}

// ==================== 事件绑定 ====================
$('#btn-start').addEventListener('click', startGame);
$('#btn-restart').addEventListener('click', () => {
  switchScreen('start');
});

// ==================== 初始化 ====================
console.log('🐔 鸡缸杯·六百年 — 已就绪');
console.log('   点击「触摸此杯，开启尘缘」开始游戏');
