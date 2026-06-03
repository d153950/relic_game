/* ============================================
   场景3: 皇帝贵妃 - 献杯
   ============================================ */

function initScene3() {
  const dialogs = SCENES[3].dialogs;

  var cupImg = null;
  var clothImg = null;
  var clothRemoved = false;
  var cupDelivered = false;
  var dialogIndex = 0;

  cupImg = createObject('p8.png', 'cup-s3', {
    x: '50%', y: '58%',
    transform: 'translate(-50%, -50%)',
    width: 'min(500px, 50vw)',
  });

  clothImg = document.createElement('img');
  clothImg.src = 'material/cloth.png';
  clothImg.id = 'cloth-s3';
  clothImg.draggable = true;
  clothImg.style.cssText = 'position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);width:min(900px,70vw);z-index:3;cursor:grab;';
  objectLayer.appendChild(clothImg);

  showHint('拖动呈上');

  // === 红布拖动 ===
  var clothStartX = 0;
  var clothStartLeft = 0;
  var clothStartTop = 0;
  var clothDragged = false;

  clothImg.addEventListener('mousedown', function(e) {
    e.preventDefault();
    clothStartX = e.clientX;
    clothDragged = true;
    var cr = gameContainer.getBoundingClientRect();
    var rect = clothImg.getBoundingClientRect();
    clothStartLeft = rect.left - cr.left;
    clothStartTop = rect.top - cr.top;
    clothImg.style.cursor = 'grabbing';
    clothImg.style.transition = 'none';
    // 锁定top为像素值
    clothImg.style.top = clothStartTop + 'px';
    clothImg.style.left = clothStartLeft + 'px';
    clothImg.style.transform = 'none';

    function onMove(ev) {
      if (!clothDragged) return;
      var dx = ev.clientX - clothStartX;
      if (dx > 0) return;
      clothImg.style.left = (clothStartLeft + dx) + 'px';
      if (dx < -(cupImg.getBoundingClientRect().width * 0.4)) {
        clothDragged = false;
        clothImg.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        doRemoveCloth();
      }
    }

    function onUp() {
      if (!clothDragged) return;
      clothDragged = false;
      clothImg.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      var moved = clothImg.getBoundingClientRect().left - gameContainer.getBoundingClientRect().left - clothStartLeft;
      if (moved < -(cupImg.getBoundingClientRect().width * 0.25)) doRemoveCloth();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function doRemoveCloth() {
    if (clothRemoved) return;
    clothRemoved = true;
    clothImg.style.transition = 'opacity 0.6s';
    clothImg.style.opacity = '0';
    setTimeout(function() { clothImg.remove(); }, 600);
    setTimeout(function() {
      cupImg.classList.add('draggable');
      cupImg.draggable = true;
      setupCupDrag();
    }, 700);
  }

  // === 拖杯子给贵妃 ===
  function setupCupDrag() {
    var zone = document.createElement('div');
    zone.style.cssText = 'position:absolute;right:15%;top:10%;width:25%;height:40%;z-index:5;border:2px dashed rgba(192,64,64,0.3);border-radius:8px;';
    objectLayer.appendChild(zone);

    cupImg.addEventListener('dragstart', function(e) {
      cupImg.classList.add('dragging');
      e.dataTransfer.setData('text/plain', 'cup');
      e.dataTransfer.effectAllowed = 'move';
    });
    cupImg.addEventListener('dragend', function() {
      cupImg.classList.remove('dragging');
    });

    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      zone.style.borderColor = 'rgba(192,64,64,0.8)';
    });
    zone.addEventListener('dragleave', function() {
      zone.style.borderColor = 'rgba(192,64,64,0.3)';
    });
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      zone.remove();
      cupImg.style.transition = 'opacity 0.6s';
      cupImg.style.opacity = '0';
      setTimeout(function() { cupImg.remove(); }, 600);
      cupDelivered = true;
      playSFX('porcelain.mp3', 5000);
      setTimeout(function() {
        showHint('点击继续');
        // 第一轮对话自动触发
        startDialogSequence();
      }, 900);
    });
  }

  // === 5轮对话 ===
  function startDialogSequence() {
    dialogIndex = 0;
    function next() {
      if (isLocked()) return;
      if (dialogIndex >= dialogs.length) {
        hideHint();
        gameContainer.removeEventListener('click', next);
        setTimeout(function() { switchScene(4); }, 1500);
        return;
      }
      clearAllDialogs();
      showDialog(dialogs[dialogIndex].text, dialogs[dialogIndex].pos);
      dialogIndex++;
    }
    gameContainer.addEventListener('click', next);
    gameContainer._scene3Handler = next;
    next();
  }
}
