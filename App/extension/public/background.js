console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

import { FIREBASE_APP, FIREBASE_AUTH,  } from './firebaseConfig.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const urlToCheck = chrome.runtime.getURL('index.html');
let timerPort = null;
let authPort = null;

let trackedTabs = new Map();

let pollingIntervalId = null;
const POLL_INTERVAL = 15000; // 15000 needed to keep service worker active

const startPolling = () => {
  pollingIntervalId = setInterval(() => {
    if (timerPort) {
      console.log('pong');
      timerPort.postMessage({ action: 'ping' }); 
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
    console.log("No window is focused.");
    // if (!pollingIntervalId) startPolling();
  } else {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      let isTrackedTabInFocus = false;
      window.tabs.forEach((tab) => {
        if (trackedTabs.has(tab.id)) {
          isTrackedTabInFocus = true;
          console.log(`Tab ${tab.id} is in the focused window.`);
        }
      });
      if (isTrackedTabInFocus) {
        // if (pollingIntervalId) stopPolling();
      } else {
        // if (!pollingIntervalId) startPolling();
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (trackedTabs.has(tabId) && trackedTabs.get(tabId) === urlToCheck) {
    resetTimer();
    trackedTabs.delete(tabId);
    // if (pollingIntervalId) stopPolling();
  }
});

// Connected to port
chrome.runtime.onConnect.addListener((connectedPort) => {
  if (connectedPort.name == "auth") {
    console.log("authPort connected");
    authPort = connectedPort;

    // other way besides useeffect in appjs
    // getUser(); 

    authPort.onMessage.addListener(handleAuthMessage);
    authPort.onDisconnect.addListener(handleAuthDisconnect);
  }
  if (connectedPort.name == "timer") {
    console.log("timerPort connected");
    timerPort = connectedPort;

    if (timerPort) {
      timerPort.postMessage({ 
        time: timeData.formattedTime, 
        currentlyRunning: timeData.currentlyRunning 
      });
    }

    // need different way to start polling
    /* if (!pollingIntervalId) startPolling(); */

    timerPort.onMessage.addListener(handleTimerMessage);
    timerPort.onDisconnect.addListener(handleTimerDisconnect);
  }
});

function handleAuthMessage(msg) {
  if (msg.action === "registerUser") {
    registerUser(msg.email, msg.password);
  } else if (msg.action === "signInUser") {
    signInUser(msg.email, msg.password);
  } else if (msg.action === "getUser") {
    getUser();
  } else if (msg.action === "signOutUser") {
    signOutUser();
  }
}

function handleTimerMessage(msg) {
  if (msg.action === "startTimer") {
    startTimer();
  } else if (msg.action === "stopTimer") {
    stopTimer();
  } else if (msg.action === "resetTimer") {
    resetTimer();
  } else if (msg.action === "getTime") {
    if (timerPort) timerPort.postMessage({ time: timeData.formattedTime });
  } else if (msg.action === "saveTime") {
    // in progress
  } 
}

// do so for authPort and timerPort
function handleTimerDisconnect() {
  console.log('Timer port disconnected');
  // if (pollingIntervalId) stopPolling();
  timerPort = null;
}

function handleAuthDisconnect() {
  console.log('Auth port disconnected');
  authPort = null;
}

function getUser() {
  console.log("attempting to get user");
  onAuthStateChanged(FIREBASE_AUTH, (user) => {
    if (authPort && user) {
      console.log("user is signed in", user.accessToken);
      authPort.postMessage({ action: 'setUser', status: 200, accessToken: user.accessToken });
    }
    else { 
      console.log("user is not signed in");
    }
  });
};

function registerUser(email, password) {
  createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
  .then((userInfo) => {
    console.log("Registered User");
    if (authPort) {
      authPort.postMessage({ action: 'setUser', status: 201, accessToken: userInfo.user.accessToken });
    }
  })
  .catch((error) => {
    console.log(error);
  });
}

function signInUser(email, password, port) {
  signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
  .then((userInfo) => {
    console.log("User signed in");
    console.log(userInfo.user);
    if (authPort) {
      authPort.postMessage({ action: 'signInUserResponse', status: 200, accessToken: userInfo.user.accessToken });
    }
  })
  .catch((error) => {
    console.log(error);
    if (authPort) {
      authPort.postMessage({ action: 'signInUserResponse', status: 401, error: error });
    }
  });
}

function signOutUser() {
  console.log("attempting to sign out user");
  signOut(FIREBASE_AUTH).then(() => {
    console.log('User signed out');
    if (authPort) {
      authPort.postMessage({ action: 'signOut' });
    }
  }).catch((error) => {
    console.error('Error signing out:', error.message);
  });
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

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${padZero(hours)} ${padZero(minutes)} ${padZero(sec)}`;
}

function updateDisplayedTime() {
  console.log("Current time: ", timeData.formattedTime);
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  const elapsed = timeData.currTime - timeData.startTime - timeData.totalPausedDuration;
  timeData.formattedTime = formatTime(elapsed / 1000);
  if (timerPort) timerPort.postMessage({ time: timeData.formattedTime });
}

function startTimer() {
  if (!timeData.currentlyRunning) {
    // if (pollingIntervalId) stopPolling();
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
    console.log("Stopped time: ", timeData.formattedTime);
    timeData.stopTime = Date.now();
    clearInterval(timeData.runningClockInterval);
    // if (!pollingIntervalId) startPolling();
  }
  if (timerPort) timerPort.postMessage({ time: timeData.formattedTime });
}

function resetTimer() {
  console.log("Time reset");
  // if (!pollingIntervalId) startPolling();
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

  if (timerPort) {
    timerPort.postMessage({ 
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
  
}
