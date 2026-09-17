window.onload = function() {
  if (typeof grammarData !== 'undefined') {
    initUI();
  } else {
    document.getElementById('section-checkboxes').innerHTML = 
      '<span style="color: red;">Error: data.js is not loaded properly.</span>';
  }
};

function initUI() {
  const keys = Object.keys(grammarData).map(Number).sort((a, b) => a - b);
  const minKey = keys[0] || 1;
  const maxKey = keys[keys.length - 1] || 1;

  const startInput = document.getElementById('range-start');
  const endInput = document.getElementById('range-end');
  
  startInput.min = minKey;
  startInput.max = maxKey;
  startInput.value = minKey;
  
  endInput.min = minKey;
  endInput.max = maxKey;
  endInput.value = maxKey;

  renderCheckboxes();
  applyRange();
}

function renderCheckboxes() {
  const container = document.getElementById('section-checkboxes');
  container.innerHTML = ''; 
  
  for (const key of Object.keys(grammarData)) {
    const title = grammarData[key].title;
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" class="sec-cb" value="${key}" onchange="syncInputsFromCheckboxes()"> ${title}`;
    container.appendChild(label);
  }
}

function applyRange() {
  const start = parseInt(document.getElementById('range-start').value, 10);
  const end = parseInt(document.getElementById('range-end').value, 10);

  if (start > end) {
    alert("Start section must be less than or equal to End section.");
    return;
  }

  const checkboxes = document.querySelectorAll('.sec-cb');
  checkboxes.forEach(cb => {
    const val = parseInt(cb.value, 10);
    cb.checked = (val >= start && val <= end);
  });
}

function setQuickRange(start, end) {
  document.getElementById('range-start').value = start;
  document.getElementById('range-end').value = end;
  applyRange();
}

function syncInputsFromCheckboxes() {
  const checked = Array.from(document.querySelectorAll('.sec-cb:checked'))
    .map(cb => parseInt(cb.value, 10))
    .sort((a, b) => a - b);

  if (checked.length > 0) {
    document.getElementById('range-start').value = checked[0];
    document.getElementById('range-end').value = checked[checked.length - 1];
  }
}

// 変更: 英数字ではなくランダムな絵文字2つを生成する
function generateEmojiMark() {
  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦋', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🍅', '🍆', '🥑', '🍔', '🍟', '🍕', '🌭', '🍿', '🍩', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🚀', '🛸', '🚁', '🌟', '⭐', '🌠', '✨', '⚡', '🔥', '💧', '☀️', '🌈', '☁️', '❄️', '🍀', '🌻', '🌺', '🌸', '🌼', '🌷', '🌱', '🌲'];
  
  const e1 = emojis[Math.floor(Math.random() * emojis.length)];
  let e2 = emojis[Math.floor(Math.random() * emojis.length)];
  
  // 同じ絵文字が並ばないようにする
  while (e1 === e2) {
    e2 = emojis[Math.floor(Math.random() * emojis.length)];
  }
  
  return e1 + e2;
}

function generateWorksheet() {
  const qType = document.querySelector('input[name="qType"]:checked').value;
  const checkboxes = document.querySelectorAll('.sec-cb:checked');
  const targetNum = parseInt(document.getElementById('target-num').value, 10);
  
  if (checkboxes.length === 0) {
    alert("Please select at least one section.");
    return;
  }

  const selectedKeys = Array.from(checkboxes)
    .map(cb => parseInt(cb.value, 10))
    .sort((a, b) => a - b);

  let pool = [];
  selectedKeys.forEach(key => {
    if (grammarData[key]) {
      pool = pool.concat(grammarData[key].sentences);
    }
  });

  pool = pool.sort(() => 0.5 - Math.random());
  const finalNum = Math.min(targetNum, pool.length);
  pool = pool.slice(0, finalNum);

  if (pool.length === 0) {
    alert("No questions found.");
    return;
  }

  let rangeTitle = '';
  if (selectedKeys.length === 1) {
    rangeTitle = `出題範囲 S${selectedKeys[0]}`;
  } else {
    rangeTitle = `出題範囲 S${selectedKeys[0]}-S${selectedKeys[selectedKeys.length - 1]}`;
  }

  // 絵文字パターンのセット
  const emojiMark = generateEmojiMark();
  const markLabel = `パターン: ${emojiMark}`;

  document.getElementById('student-header-title').textContent = rangeTitle;
  document.getElementById('student-serial-code').textContent = markLabel;

  document.getElementById('teacher-header-title').textContent = rangeTitle;
  document.getElementById('teacher-serial-code').textContent = markLabel;

  const qList = document.getElementById('student-questions');
  const aList = document.getElementById('teacher-answers');
  qList.innerHTML = '';
  aList.innerHTML = '';

  pool.forEach(q => {
    const qLi = document.createElement('li');
    const aLi = document.createElement('li');
    
    const questionText = (qType === 'en2jp') ? q.en : q.jp;
    const answerText = (qType === 'en2jp') ? q.jp : q.en;

    qLi.innerHTML = `
      ${questionText}
      <div class="interactive-blank">
        <span class="placeholder-hint">クリック／タップで解答を表示</span>
        <span class="revealed-answer">${answerText}</span>
      </div>
    `;

    const blankDiv = qLi.querySelector('.interactive-blank');
    blankDiv.addEventListener('click', function() {
      this.classList.toggle('show');
    });

    aLi.innerHTML = `<u>${questionText}</u><br>${answerText}`;
    
    qList.appendChild(qLi);
    aList.appendChild(aLi);
  });

  document.getElementById('print-area').style.display = 'block';
}