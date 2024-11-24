// typing.js

let originalText = '';
let words = [];
let currentWordIndex = 0;

document.getElementById('fileInput').addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = function (e) {
      originalText = e.target.result;
      words = originalText.split(/\s+/); // Split text into words by spaces or line breaks
      currentWordIndex = 0;

      displayTextWithHighlight(); // Display the first highlighted word
      document.getElementById('typingArea').value = '';
      document.getElementById('accuracy').textContent = 'Accuracy: 100%';
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid .txt file.');
  }
});

document.getElementById('typingArea').addEventListener('input', function () {
  const typedText = this.value.trim();
  const currentWord = words[currentWordIndex];

  // Check if the current word is typed correctly
  if (typedText === currentWord) {
    // Move to the next word
    currentWordIndex++;
    this.value = ''; // Clear the input area

    // If there are more words to type
    if (currentWordIndex < words.length) {
      displayTextWithHighlight();
    } else {
      document.getElementById('displayText').innerHTML = '<span class="completed">Congratulations! You have completed typing the text.</span>';
    }
  }

  updateAccuracy(typedText, currentWord);
});

// Function to display the text with the current word highlighted
function displayTextWithHighlight() {
  let displayHtml = '';

  words.forEach((word, index) => {
    if (index === currentWordIndex) {
      displayHtml += `<span class="highlight">${word}</span> `;
    } else if (index < currentWordIndex) {
      displayHtml += `<span class="completed">${word}</span> `;
    } else {
      displayHtml += `${word} `;
    }
  });

  document.getElementById('displayText').innerHTML = displayHtml;
  autoScrollToCurrentWord();
}

// Function to automatically scroll to the current word
function autoScrollToCurrentWord() {
  const displayElement = document.getElementById('displayText');
  const highlightedWord = document.querySelector('.highlight');

  if (highlightedWord) {
    const topOffset = highlightedWord.offsetTop - displayElement.offsetTop;
    displayElement.scrollTop = topOffset - displayElement.clientHeight / 2; // Center the highlighted word vertically
  }
}

// Function to update the accuracy
function updateAccuracy(typedText, currentWord) {
  const accuracyElement = document.getElementById('accuracy');
  let correctChars = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentWord[i]) {
      correctChars++;
    }
  }

  const accuracy = typedText.length
    ? ((correctChars / typedText.length) * 100).toFixed(2)
    : 100;
  accuracyElement.textContent = `Accuracy: ${accuracy}%`;
}
