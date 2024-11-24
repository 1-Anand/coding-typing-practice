// typing.js

let originalText = '';

document.getElementById('fileInput').addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = function (e) {
      originalText = e.target.result;
      document.getElementById('displayText').textContent = originalText;
      document.getElementById('typingArea').value = '';
      document.getElementById('accuracy').textContent = 'Accuracy: 100%';
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid .txt file.');
  }
});

document.getElementById('typingArea').addEventListener('input', function () {
  const typedText = this.value;
  const accuracyElement = document.getElementById('accuracy');
  let correctChars = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === originalText[i]) {
      correctChars++;
    }
  }

  const accuracy = typedText.length
    ? ((correctChars / typedText.length) * 100).toFixed(2)
    : 100;
  accuracyElement.textContent = `Accuracy: ${accuracy}%`;
});
