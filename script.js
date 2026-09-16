window.onload = function() {
  if (typeof grammarData !== 'undefined') {
    renderCheckboxes();
  } else {
    document.getElementById('section-checkboxes').innerHTML = 
      '<span style="color: red;">Error: data.js is not loaded properly.</span>';
  }
};

function renderCheckboxes() {
  const container = document.getElementById('section-checkboxes');
  container.innerHTML = ''; 
  
  for (const key of Object.keys(grammarData)) {
    const title = grammarData[key].title;
    const label = document.createElement('label');
    const isChecked = key === "1" ? "checked" : "";
    label.innerHTML = `<input type="checkbox" name="targetSection" value="${key}" ${isChecked}> ${title}`;
    container.appendChild(label);
  }
}

function checkAll(checked) {
  const checkboxes = document.querySelectorAll('input[name="targetSection"]');
  checkboxes.forEach(cb => cb.checked = checked);
}

function generateRandomCode(length = 2) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateWorksheet() {
  const qType = document.querySelector('input[name="qType"]:checked').value;
  const checkboxes = document.querySelectorAll('input[name="targetSection"]:checked');
  const targetNum = parseInt(document.getElementById('target-num').value);
  
  if (checkboxes.length === 0) {
    alert("Please select at least one section.");
    return;
  }

  const selectedKeys = Array.from(checkboxes)
    .map(cb => parseInt(cb.value))
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

  const testCode = generateRandomCode(2);
  let rangeLabel = '';
  if (selectedKeys.length === 1) {
    rangeLabel = `${selectedKeys[0]}`;
  } else {
    rangeLabel = `${selectedKeys[0]}_${selectedKeys[selectedKeys.length - 1]}`;
  }
  const fullTestTitle = `${rangeLabel}_${testCode}`;

  document.getElementById('student-header-title').textContent = fullTestTitle;
  document.getElementById('teacher-header-title').textContent = `${fullTestTitle} [解答]`;

  const qList = document.getElementById('student-questions');
  const aList = document.getElementById('teacher-answers');
  qList.innerHTML = '';
  aList.innerHTML = '';

  pool.forEach(q => {
    const qLi = document.createElement('li');
    const aLi = document.createElement('li');
    
    if (qType === 'en2jp') {
      qLi.innerHTML = `${q.en}<span class="blank-line"></span>`;
      aLi.innerHTML = `<u>${q.en}</u><br>${q.jp}`;
    } else {
      qLi.innerHTML = `${q.jp}<span class="blank-line"></span>`;
      aLi.innerHTML = `<u>${q.jp}</u><br>${q.en}`;
    }
    
    qList.appendChild(qLi);
    aList.appendChild(aLi);
  });

  document.getElementById('print-area').style.display = 'block';
}
