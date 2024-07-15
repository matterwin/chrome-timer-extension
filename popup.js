function startTimer(timerData) {
  timerData.intervalId = setInterval(() => {
    timerData.totalSeconds++;
    timerData.timerElement.textContent = formatTime(timerData.totalSeconds);
  }, 1000);

  return timerData.intervalId;
}

function endTimer(intervalId) {
  clearInterval(intervalId);
}

function resetTimer(timerData) {
  clearInterval(timerData.intervalId);
  timerData.timerElement.textContent = '00:00.00';
  timerData.totalSeconds = 0;
}

function formatTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return `${padZero(hours)}:${padZero(minutes)}.${padZero(seconds)}`;
}

function padZero(num) {
  return (num < 10 ? '0' : '') + num;
}

document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.getElementById('text');
  const button = document.getElementById('startOrStopButton');
  const resetButton = document.getElementById('resetButton');
  const timerElement = document.getElementById('timer');

  const timerData = {
    totalSeconds: 0,
    intervalId: null,
    timerElement: timerElement
  };

  resetButton.addEventListener('click', () => {
    resetTimer(timerData);
  });

  button.addEventListener('click', () => {
    if (textElement.textContent === 'Start') {
      textElement.textContent = 'Stop';
      timerData.intervalId = startTimer(timerData);
    } else {
      textElement.textContent = 'Start';
      endTimer(timerData.intervalId);
    }
  });
});

