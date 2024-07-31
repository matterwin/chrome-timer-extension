console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

const urlToCheck = chrome.runtime.getURL('index.html');
let port = null;

let trackedTabs = new Map();

let pollingIntervalId = null;
const POLL_INTERVAL = 60000; 

const startPolling = () => {
  pollingIntervalId = setInterval(() => {
    if (port) {
      console.log('pong');
      port.postMessage({ action: 'ping' }); 
    }
  }, POLL_INTERVAL);
};

const stopPolling = () => {
  if (pollingIntervalId) {
    console.log("ping terminated");
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
        height: 400
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

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (trackedTabs.has(tabId) && trackedTabs.get(tabId) === urlToCheck) {
    resetTimer();
    trackedTabs.delete(tabId);
  }
});

// Connected to port
chrome.runtime.onConnect.addListener((connectedPort) => {
  console.log("Port connected");
  port = connectedPort;
  if (port) {
    port.postMessage({ 
      time: timeData.formattedTime, 
      currentlyRunning: timeData.currentlyRunning 
    });
  }

  startPolling();

  port.onMessage.addListener(handleMessage);
  port.onDisconnect.addListener(handleDisconnect);
});

function handleMessage(msg) {
  console.log(msg);
  if (msg.action === "startTimer") {
    startTimer();
  } else if (msg.action === "stopTimer") {
    stopTimer();
  } else if (msg.action === "resetTimer") {
    resetTimer();
  } else if (msg.action === "getTime") {
    if (port) port.postMessage({ time: timeData.formattedTime });
  } else if (msg.action === "saveTime") {}
}

function handleDisconnect() {
  console.log('Port disconnected');
  stopPolling();
  port = null;
}

let timeData = {
  startTime: 0,
  currTime: 0,
  stopTime: 0,
  totalPausedDuration: 0,
  runningClockInterval: null,
  formattedTime: '00 00 00',
  currentlyRunning: false
};

function updateDisplayedTime() {
  console.log("Current time: ", timeData.formattedTime);
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  const elapsed = (timeData.currTime - timeData.startTime) - timeData.totalPausedDuration;
  timeData.formattedTime = formatTime(elapsed / 1000);
  if (port) port.postMessage({ time: timeData.formattedTime });
}

function startTimer() {
  if (!timeData.currentlyRunning) {
    stopPolling();
    timeData.currentlyRunning = true;

    if (timeData.stopTime) {
      timeData.totalPausedDuration += (Date.now() - timeData.stopTime);
      timeData.stopTime = 0;
    } else {
      timeData.startTime = Date.now();
    }

    timeData.runningClockInterval = setInterval(() => {
      updateDisplayedTime();
    }, 1000);  
  }
}

function stopTimer() {
  if (timeData.currentlyRunning) {
    timeData.currentlyRunning = false;
    console.log("Stopped time: ", timeData.formattedTime);
    timeData.stopTime = Date.now();
    clearInterval(timeData.runningClockInterval);
    startPolling();
  }
  if (port) port.postMessage({ time: timeData.formattedTime });
}

function resetTimer() {
  console.log("Time reset");
  startPolling();
  clearInterval(timeData.runningClockInterval);
  timeData = {
    startTime: 0,
    currTime: 0,
    stopTime: 0,
    totalPausedDuration: 0,
    runningClockInterval: null,
    formattedTime: '00 00 00',
    currentlyRunning: false
  };

  if (port) {
    port.postMessage({ 
      time: "00 00 00", 
      currentlyRunning: timeData.currentlyRunning 
    });
  }
}

function getTime() {
  return timeData.formattedTime;
}

function setTime(time) {
  timeData.formattedTime = time;
  return getTime();
}

function saveTime() {
  chrome.windows.create({
    url: './filesys.html',
    type: 'popup', // Can be 'normal', 'popup', 'panel', 'app', or 'devtools'
    width: 400,
    height: 400
  });
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${padZero(hours)} ${padZero(minutes)} ${padZero(sec)}`;
}


