document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.getElementById('text');
  const button = document.getElementById('startOrStopButton');
  const resetButton = document.getElementById('resetButton');
  const timerElement = document.getElementById('timer');

  resetButton.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'resetTimer' });
    console.log(response.status);
  });

  button.addEventListener('click', async () => {
    if (textElement.textContent === 'Start') {
      textElement.textContent = 'Stop';
      const response = await chrome.runtime.sendMessage({ action: 'startTimer' });
      console.log(response.status);
    } else {
      textElement.textContent = 'Start';
      const response = await chrome.runtime.sendMessage({ action: 'stopTimer' });
      console.log(response.status);
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateTime') {
      timerElement.textContent = message.time;
      sendResponse({ status: 'time updated' });
    }
  });
});

