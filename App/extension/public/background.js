async function playSound(source = './raidhorn_02.mp3', volume = 1) {
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}

async function stopSound() {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.runtime.sendMessage({ stop: true });
  }
}

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'countdown' 
  });
}

const urlToCheck = chrome.runtime.getURL('index.html');
let timerPort = null;

let trackedTabs = new Map();

let pollingIntervalId = null;
const POLL_INTERVAL = 15000; // 15000 needed to keep service worker active

const startPolling = () => {
  pollingIntervalId = setInterval(() => {
    if (timerPort) {
      timerPort.postMessage({ action: 'ping' }); 
    }
  }, POLL_INTERVAL);
};

const stopPolling = () => {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
};

function openTab() {
  chrome.tabs.query({}, (tabs) => {
    let tabFound = false;
    
    for (let tab of tabs) {
      if (tab.url === urlToCheck) {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
        tabFound = true;
        break;
      }
    }
    
    if (!tabFound) {
      chrome.windows.create({
        url: urlToCheck,
        type: 'popup',
        width: 400,
        height: 300
      }, (window) => {
        if (window.tabs && window.tabs.length > 0) {
          trackedTabs.set(window.tabs[0].id, urlToCheck);
        }
      });
    }
  });
}

// Opened extension
chrome.action.onClicked.addListener(() => {
  openTab();
});

// Track extension id
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url === urlToCheck) {
    trackedTabs.set(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url === urlToCheck) {
    trackedTabs.set(tabId, tab.url);
  }
});

// polling to update timer in background without inactivation
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (!pollingIntervalId) startPolling();
  } else {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      let isTrackedTabInFocus = false;
      window.tabs.forEach((tab) => {
        if (trackedTabs.has(tab.id)) {
          isTrackedTabInFocus = true;
        }
      });
      if (isTrackedTabInFocus) {
        if (pollingIntervalId) stopPolling();
      } else {
        if (!pollingIntervalId) startPolling();
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (trackedTabs.has(tabId) && trackedTabs.get(tabId) === urlToCheck) {
    resetTimer();
    trackedTabs.delete(tabId);
    if (pollingIntervalId) stopPolling();
  }
});

// Connect port
chrome.runtime.onConnect.addListener((connectedPort) => {
  if (connectedPort.name == "timer") {
    timerPort = connectedPort;

    if (timerPort) {
      timerPort.postMessage({ 
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
        currentlyRunning: timeData.currentlyRunning
      });
    }

    if (!pollingIntervalId) startPolling();

    timerPort.onMessage.addListener(handleTimerMessage);
    timerPort.onDisconnect.addListener(handleTimerDisconnect);
  }
});

let timeData = {
  startTime: 0,
  currTime: 0,
  stopTime: 0,
  totalPausedDuration: 0,
  runningClockInterval: null,
  hours: '00',
  minutes: '00',
  seconds: '00',
  countUpFromInSeconds: 0,
  countDownFromInSeconds: 0,
  countUpFromInSeconds: 0,
  currentlyRunning: false,
  countingDown: false, 
  countDownFinished: false
};

function handleTimerMessage(msg) {
  if (msg.action === "startTimer") {
    startTimer();
  } else if (msg.action === "stopTimer") {
    stopTimer();
  } else if (msg.action === "resetTimer") {
    resetTimer();
  } else if (msg.action === "getTime") {
    if (timerPort) {
      timerPort.postMessage({ 
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
      });
    }
  } else if (msg.action === "countDown") {
    startCountdown(msg.seconds);
  } else if (msg.action === "countUp") {
    startCountUp(msg.seconds);
  }
}

function handleTimerDisconnect() {
  if (!pollingIntervalId) startPolling();
  timerPort = null;
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  const formattedHours = padZero(hours);
  const formattedMinutes = padZero(minutes);
  const formattedSeconds = padZero(seconds);

  timeData.hours = formattedHours;
  timeData.minutes = formattedMinutes;
  timeData.seconds = formattedSeconds;
}

function updateDisplayedTime() {
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  if (timeData.countingDown) {
    const elapsed = (timeData.countDownFromInSeconds * 1000) - (currentTime - timeData.startTime - timeData.totalPausedDuration);

    const remainingTimeInSeconds = Math.ceil(elapsed / 1000);
    formatTime(remainingTimeInSeconds);
    
    if (remainingTimeInSeconds === 0) {
      playSound();
      clearInterval(timeData.runningClockInterval);

      timeData.startTime = 0;
      timeData.currTime = 0;
      timeData.stopTime = 0;
      timeData.hours ='00';
      timeData.minutes = '00';
      timeData.seconds = '00';
      timeData.totalPausedDuration = 0;
      timeData.runningClockInterval = null;
      timeData.currentlyRunning = false;

      if (timerPort) {
        timerPort.postMessage({ 
          hours: '00',
          minutes: '00',
          seconds: '00',
          currentlyRunning: false,
          countDownFinished: true
        });
      }
    } else {
      if (timerPort) timerPort.postMessage({ 
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
        time: timeData.formattedTime 
      });
    }
  } else {
    const elapsed = timeData.countUpFromInSeconds * 1000 + (currentTime - timeData.startTime - timeData.totalPausedDuration);
    formatTime(elapsed / 1000);

    if (timerPort) timerPort.postMessage({ 
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
      time: timeData.formattedTime 
    });
  }
}

function resetForCountingUpOrDown() {
  clearInterval(timeData.runningClockInterval);
  timeData.startTime = 0;
  timeData.currTime = 0;
  timeData.stopTime = 0;
  timeData.totalPausedDuration = 0;
  timeData.runningClockInterval = null;
  timeData.currentlyRunning = false;
}


function startCountdown(durationInSeconds) {
  resetForCountingUpOrDown();
  timeData.countDownFromInSeconds = durationInSeconds; 
  timeData.countingDown = true;
  formatTime(durationInSeconds);

  if (timerPort) {
    timerPort.postMessage({ 
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
      currentlyRunning: timeData.currentlyRunning 
    });
  }
}

function startCountUp(durationInSeconds) {
  resetForCountingUpOrDown();
  timeData.countUpFromInSeconds = durationInSeconds;
  timeData.countingDown = false;
  timeData.currentlyRunning = false;
  formatTime(durationInSeconds);

  if (timerPort) {
    timerPort.postMessage({ 
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
      currentlyRunning: timeData.currentlyRunning 
    });
  }
}

function startTimer() {
  if (!timeData.currentlyRunning) {
    if (timeData.countingDown) stopSound();
    if (pollingIntervalId) stopPolling();
    timeData.currentlyRunning = true;

    if (timeData.stopTime) {
      timeData.totalPausedDuration += (Date.now() - timeData.stopTime);
      timeData.stopTime = 0;
    } else {
      timeData.startTime = Date.now();
    }

    updateDisplayedTime();
    timeData.runningClockInterval = setInterval(() => {
      updateDisplayedTime();
    }, 1000);  
  }
}

function stopTimer() {
  if (timeData.currentlyRunning) {
    timeData.currentlyRunning = false;
    timeData.stopTime = Date.now();
    clearInterval(timeData.runningClockInterval);
    if (!pollingIntervalId) startPolling();
  }

  if (timerPort) {
    timerPort.postMessage({ 
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
      currentlyRunning: timeData.currentlyRunning 
    });
  }
}

function resetTimer() {
  if (!pollingIntervalId) startPolling();
  if (timeData.countingDown) stopSound();
  clearInterval(timeData.runningClockInterval);

  timeData.startTime = 0;
  timeData.currTime = 0;
  timeData.stopTime = 0;
  timeData.totalPausedDuration = 0;
  timeData.runningClockInterval = null;
  timeData.currentlyRunning = false;
  timeData.countDownFinished = false;

  if (timeData.countingDown) {
    formatTime(timeData.countDownFromInSeconds);

    if (timerPort) {
      timerPort.postMessage({ 
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
        currentlyRunning: timeData.currentlyRunning,
        countDownFinished: false
      });
    }
  }
  else {
    timeData.countUpFromInSeconds = 0;
    timeData.hours ='00';
    timeData.minutes = '00';
    timeData.seconds = '00';

    if (timerPort) {
      timerPort.postMessage({ 
        hours: '00',
        minutes: '00',
        seconds: '00',
        currentlyRunning: timeData.currentlyRunning
      });
    }
  }
}

function getTime() {
  return timeData.formattedTime;
}

function setTime(time) {
  timeData.formattedTime = time;
  return getTime();
}
