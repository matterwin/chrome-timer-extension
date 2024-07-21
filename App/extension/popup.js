document.addEventListener('DOMContentLoaded', () => {
  var port = chrome.runtime.connect({name: "knockknock"});

  const textElement = document.getElementById('text');
  const button = document.getElementById('startOrStopButton');
  const resetButton = document.getElementById('resetButton');
  const timerElement = document.getElementById('timer');


  resetButton.addEventListener('click', async () => {
    port.postMessage({ action: 'resetTimer' });
  });

  button.addEventListener('click', async () => {
    if (textElement.textContent === 'Start') {
      port.postMessage({ action: 'startTimer' });
      textElement.textContent = 'Stop';
    } else {
      port.postMessage({ action: 'stopTimer' });
      textElement.textContent = 'Start';
    }
  });

  port.onMessage.addListener(function(msg) {
    timerElement.textContent = msg.time;
    port.postMessage({ action: 'received msg' })
  });
});

