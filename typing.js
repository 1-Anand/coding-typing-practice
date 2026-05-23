const lessons = [
  {
    title: 'Azure Terraform Starter',
    type: 'Guided lesson',
    summary: 'Terraform commands, provider setup, and resource group basics.',
    text: `terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan

resource "azurerm_resource_group" "practice" {
  name     = "rg-typing-devops"
  location = "eastus"
}`
  },
  {
    title: 'CI/CD Pipeline Flow',
    type: 'DevOps lesson',
    summary: 'Common pipeline stages used before infrastructure deployment.',
    text: `checkout source
install terraform
run terraform fmt -check
run terraform validate
publish plan artifact
wait for approval
apply the approved plan`
  },
  {
    title: 'Kubernetes Deployment',
    type: 'Kubernetes lesson',
    summary: 'Practice typing a compact deployment checklist.',
    text: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: typing-practice
spec:
  replicas: 2
  strategy:
    type: RollingUpdate`
  },
  {
    title: 'Azure CLI Warmup',
    type: 'Azure lesson',
    summary: 'Short commands for account and resource group practice.',
    text: `az login
az account show
az group create --name rg-devops-lab --location eastus
az deployment group what-if --resource-group rg-devops-lab`
  }
];

const keyboardRows = [
  [
    ['`', '`'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['0', '0'], ['-', '-'], ['=', '='], ['backspace', 'Back']
  ],
  [
    ['tab', 'Tab'], ['q', 'Q'], ['w', 'W'], ['e', 'E'], ['r', 'R'], ['t', 'T'], ['y', 'Y'],
    ['u', 'U'], ['i', 'I'], ['o', 'O'], ['p', 'P'], ['[', '['], [']', ']'], ['\\', '\\']
  ],
  [
    ['capslock', 'Caps'], ['a', 'A'], ['s', 'S'], ['d', 'D'], ['f', 'F'], ['g', 'G'], ['h', 'H'],
    ['j', 'J'], ['k', 'K'], ['l', 'L'], [';', ';'], ["'", "'"], ['enter', 'Enter']
  ],
  [
    ['shift', 'Shift'], ['z', 'Z'], ['x', 'X'], ['c', 'C'], ['v', 'V'], ['b', 'B'], ['n', 'N'],
    ['m', 'M'], [',', ','], ['.', '.'], ['/', '/'], ['shift-right', 'Shift']
  ],
  [
    ['space', 'Space']
  ]
];

const elements = {
  lessonSelect: document.getElementById('lessonSelect'),
  fileInput: document.getElementById('fileInput'),
  resetButton: document.getElementById('resetButton'),
  displayText: document.getElementById('displayText'),
  typingArea: document.getElementById('typingArea'),
  accuracy: document.getElementById('accuracy'),
  wpm: document.getElementById('wpm'),
  timer: document.getElementById('timer'),
  progressText: document.getElementById('progressText'),
  progressBar: document.getElementById('progressBar'),
  bestWpm: document.getElementById('bestWpm'),
  statusMessage: document.getElementById('statusMessage'),
  mistakes: document.getElementById('mistakes'),
  nextKey: document.getElementById('nextKey'),
  lessonTitle: document.getElementById('lessonTitle'),
  lessonType: document.getElementById('lessonType'),
  lessonSummary: document.getElementById('lessonSummary'),
  keyboard: document.getElementById('keyboard')
};

let activeLessonIndex = 0;
let targetText = '';
let startedAt = null;
let timerId = null;
let completed = false;

function init() {
  renderLessonOptions();
  renderKeyboard();
  loadLesson(0);
  bindEvents();
  elements.typingArea.focus();
}

function bindEvents() {
  elements.lessonSelect.addEventListener('change', (event) => {
    loadLesson(Number(event.target.value));
  });

  elements.fileInput.addEventListener('change', handleFileUpload);
  elements.resetButton.addEventListener('click', resetLesson);
  
  elements.typingArea.addEventListener('input', handleTyping);
  elements.typingArea.addEventListener('paste', (e) => e.preventDefault());
  elements.typingArea.addEventListener('copy', (e) => e.preventDefault());
  elements.typingArea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = elements.typingArea.selectionStart;
      const end = elements.typingArea.selectionEnd;
      elements.typingArea.value = elements.typingArea.value.substring(0, start) + "  " + elements.typingArea.value.substring(end);
      elements.typingArea.selectionStart = elements.typingArea.selectionEnd = start + 2;
      handleTyping();
    }
  });

  elements.displayText.addEventListener('click', () => elements.typingArea.focus());
  elements.displayText.addEventListener('keydown', () => elements.typingArea.focus());
}

function renderLessonOptions() {
  lessons.forEach((lesson, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = lesson.title;
    elements.lessonSelect.appendChild(option);
  });
}

function renderKeyboard() {
  elements.keyboard.innerHTML = '';

  keyboardRows.forEach((row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard-row';

    row.forEach(([key, label]) => {
      const keyElement = document.createElement('span');
      keyElement.className = `key key-${key}`;
      keyElement.dataset.key = key;
      keyElement.textContent = label;
      rowElement.appendChild(keyElement);
    });

    elements.keyboard.appendChild(rowElement);
  });
}

function loadLesson(index) {
  activeLessonIndex = index;
  const lesson = lessons[index];
  targetText = lesson.text;
  elements.lessonSelect.value = String(index);
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonType.textContent = lesson.type;
  elements.lessonSummary.textContent = lesson.summary;
  
  const savedWpm = localStorage.getItem(`bestWpm_${index}`);
  elements.bestWpm.textContent = savedWpm ? savedWpm : '-';
  
  resetTypingState();
}

function handleFileUpload() {
  const file = elements.fileInput.files[0];

  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith('.txt')) {
    setStatus('Please upload a valid .txt file.');
    elements.fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const customText = String(event.target.result || '').trim();

    if (!customText) {
      setStatus('That text file is empty.');
      return;
    }

    const existingCustomIndex = lessons.findIndex((lesson) => lesson.title === 'Custom Upload');
    const customLesson = {
      title: 'Custom Upload',
      type: 'Custom lesson',
      summary: file.name,
      text: customText
    };

    if (existingCustomIndex >= 0) {
      lessons[existingCustomIndex] = customLesson;
      elements.lessonSelect.options[existingCustomIndex].textContent = customLesson.title;
      loadLesson(existingCustomIndex);
    } else {
      lessons.push(customLesson);
      const option = document.createElement('option');
      option.value = lessons.length - 1;
      option.textContent = customLesson.title;
      elements.lessonSelect.appendChild(option);
      loadLesson(lessons.length - 1);
    }
  };
  reader.readAsText(file);
}

function resetLesson() {
  loadLesson(activeLessonIndex);
  elements.typingArea.focus();
}

function resetTypingState() {
  stopTimer();
  startedAt = null;
  completed = false;
  elements.typingArea.value = '';
  elements.typingArea.disabled = false;
  elements.typingArea.placeholder = 'Start typing here...';
  setStatus('Focus the box and begin when you are ready.');
  renderText();
  updateStats();
  highlightKeyboard();
}

function handleTyping() {
  if (completed) {
    return;
  }

  if (!startedAt) {
    startedAt = Date.now();
    timerId = window.setInterval(updateStats, 1000);
  }

  if (elements.typingArea.value.length > targetText.length) {
    elements.typingArea.value = elements.typingArea.value.slice(0, targetText.length);
  }

  renderText();
  updateStats();
  highlightKeyboard();

  if (elements.typingArea.value.length === targetText.length) {
    completeLesson();
  }
}

function renderText() {
  const typedText = elements.typingArea.value;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < targetText.length; index++) {
    const expectedChar = targetText[index];
    const typedChar = typedText[index];
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = expectedChar;

    if (index < typedText.length) {
      span.classList.add(typedChar === expectedChar ? 'correct' : 'incorrect');
    } else if (index === typedText.length) {
      span.classList.add('current');
    } else {
      span.classList.add('pending');
    }

    if (expectedChar === ' ') {
      span.classList.add('space-char');
    }

    fragment.appendChild(span);
  }

  elements.displayText.innerHTML = '';
  elements.displayText.appendChild(fragment);

  const currentChar = elements.displayText.querySelector('.char.current');
  if (currentChar) {
    keepCurrentCharacterVisible(currentChar);
  }
}

function keepCurrentCharacterVisible(currentChar) {
  const container = elements.displayText;
  const padding = 32;
  const charTop = currentChar.offsetTop;
  const charBottom = charTop + currentChar.offsetHeight;
  const viewTop = container.scrollTop;
  const viewBottom = viewTop + container.clientHeight;

  if (charTop < viewTop + padding || charBottom > viewBottom - padding) {
    container.scrollTop = Math.max(charTop - container.clientHeight / 2, 0);
  }
}

function updateStats() {
  const typedText = elements.typingArea.value;
  const elapsedSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const correctCharacters = getCorrectCharacterCount(typedText);
  const mistakes = getMistakeCount(typedText);
  const accuracy = typedText.length ? Math.round((correctCharacters / typedText.length) * 100) : 100;
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = startedAt ? Math.round((correctCharacters / 5) / minutes) : 0;
  const progress = targetText.length ? Math.round((typedText.length / targetText.length) * 100) : 0;

  elements.accuracy.textContent = `${accuracy}%`;
  elements.wpm.textContent = String(wpm);
  elements.timer.textContent = formatTime(elapsedSeconds);
  elements.progressText.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.mistakes.textContent = `Mistakes: ${mistakes}`;
  elements.nextKey.textContent = getNextKeyLabel();

  if (!completed && typedText.length > 0) {
    setStatus(mistakes ? 'Keep going. Fix red characters as you type.' : 'Nice rhythm. Stay accurate.');
  }
}

function getCorrectCharacterCount(typedText) {
  let count = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] === targetText[index]) {
      count++;
    }
  }

  return count;
}

function getMistakeCount(typedText) {
  let count = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] !== targetText[index]) {
      count++;
    }
  }

  return count;
}

function completeLesson() {
  completed = true;
  stopTimer();
  elements.typingArea.disabled = true;
  elements.typingArea.placeholder = 'Lesson complete';
  setStatus('Lesson complete. Reset or choose another lesson.');
  highlightKeyboard();

  const currentWpm = Number(elements.wpm.textContent);
  const savedWpm = Number(localStorage.getItem(`bestWpm_${activeLessonIndex}`)) || 0;
  
  if (currentWpm > savedWpm) {
    localStorage.setItem(`bestWpm_${activeLessonIndex}`, currentWpm);
    elements.bestWpm.textContent = String(currentWpm);
  }
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function highlightKeyboard() {
  const activeKey = getKeyName(targetText[elements.typingArea.value.length]);
  elements.keyboard.querySelectorAll('.key').forEach((key) => {
    key.classList.toggle('active', Boolean(activeKey) && key.dataset.key === activeKey);
  });
}

function getNextKeyLabel() {
  const nextChar = targetText[elements.typingArea.value.length];

  if (!nextChar) {
    return 'Done';
  }

  if (nextChar === ' ') {
    return 'Space';
  }

  if (nextChar === '\n') {
    return 'Enter';
  }

  return nextChar;
}

function getKeyName(character = '') {
  if (character === ' ') {
    return 'space';
  }

  if (character === '\n') {
    return 'enter';
  }

  if (character === '\t') {
    return 'tab';
  }

  return character.toLowerCase();
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

init();
