console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

import { FIREBASE_APP, FIREBASE_AUTH,  } from './firebaseConfig.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const OFFSCREEN_DOCUMENT_PATH = './offscreen.html';
let creatingOffscreenDocument;
let creating = null;

async function hasDocument() {
  const matchedClients = await clients.matchAll();
  return matchedClients.some(
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)
  );
}

async function setupOffscreenDocument(path) {
  if (!(await hasDocument())) {
    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
        url: path,
        reasons: [
            chrome.offscreen.Reason.DOM_SCRAPING
        ],
        justification: 'authentication'
      });
      await creating;
      creating = null;
    }
  }
}

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
        justification: 'testing' // details for using the API
    });
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

function getAuth() {
  return new Promise(async (resolve, reject) => {
    const auth = await chrome.runtime.sendMessage({
      type: 'firebase-auth',
      target: 'offscreen'
    });
    auth?.name !== 'FirebaseError' ? resolve(auth) : reject(auth);
  })
}

async function firebaseAuth() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const auth = await getAuth()
    .then((FIREBASE_AUTH) => {
      console.log('User Authenticated', auth);
      return auth;
    })
    .catch(err => {
      if (err.code === 'auth/operation-not-allowed') {
        console.error('You must enable an OAuth provider in the Firebase' +
                      ' console in order to use signInWithPopup. This sample' +
                      ' uses Google by default.');
      } else {
        console.error(err);
        return err;
      }
    })
    .finally(closeOffscreenDocument)

  return auth;
}

const urlToCheck = chrome.runtime.getURL('index.html');
let timerPort = null;
let authPort = null;
let filesysPort = null;

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
    if (!pollingIntervalId) startPolling();
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
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
        currentlyRunning: timeData.currentlyRunning
      });
    }

    // need different way to start polling
    /* if (!pollingIntervalId) startPolling(); */

    timerPort.onMessage.addListener(handleTimerMessage);
    timerPort.onDisconnect.addListener(handleTimerDisconnect);
  }

  if (connectedPort.name == "filesys") {
    console.log("filesysPort connected");
    filesysPort = connectedPort;

    
    // maybe on connect, send back entire file system
    // like maybe do that with auth
    

    filesysPort.onMessage.addListener(handleFilesysMessage);
    filesysPort.onDisconnect.addListener(handleFilesysDisconnect);
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
  } else if (msg.action === "signInWithGoogle") {
    firebaseAuth(); 
  } 
}

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
  } else if (msg.action === "saveTime") {
    // in progress
  } else if (msg.action === "countDown") {
    startCountdown(msg.seconds);
  } else if (msg.action === "countUp") {
    startCountUp(msg.seconds);
  }
}

function handleFilesysMessage(msg) {
  
}

function handleFilesysDisconnect() {
  console.log('Filesys port disconnected');
  filesysPort = null;
}

function handleTimerDisconnect() {
  console.log('Timer port disconnected');
  if (!pollingIntervalId) startPolling();
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
      console.log("user is signed in", user);
      authPort.postMessage({ action: 'setUser', status: 200, accessToken: user.accessToken });
    }
    else { 
      console.log("user is not signed in");
    }
  });
}

async function registerUser(email, password) {
  console.log("attempting to register user");
  try {
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    console.log("User is now registered");

    if (authPort) {
      authPort.postMessage({
        action: 'registerUserResponse',
        status: 201,
        accessToken: userCredential.user.accessToken
      });
    }
  } catch (error) {
    console.log(error);
    let errorMessage;

    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address!';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Email alreay in use';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password must be at least 6 characters';
        break;
      default:
        errorMessage = 'Error signing in, please wait a few minutes.';
    }

    if (authPort) {
      authPort.postMessage({
        action: 'registerUserResponse',
        status: 400,
        error: errorMessage
      });
    }
  }
}

async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    console.log("User signed in");

    if (authPort) {
      authPort.postMessage({
        action: 'signInUserResponse',
        status: 200,
        accessToken: userCredential.user.accessToken
      });
    }
  } catch (error) {
    console.log(error);
    let errorMessage;

    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address!';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credential!';
        break;
      default:
        errorMessage = 'Error signing in, please wait a few minutes.';
    }

    if (authPort) {
      authPort.postMessage({
        action: 'signInUserResponse',
        status: 401,
        error: errorMessage
      });
    }
  }
}

async function signOutUser() {
  console.log("Attempting to sign out user");
  try {
    await signOut(FIREBASE_AUTH);
    console.log('User signed out');

    if (authPort) {
      authPort.postMessage({ action: 'signOut' });
    }
  } catch (error) {
    console.error('Error signing out:', error.message);
  }
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
    console.log(remainingTimeInSeconds);
    console.log(`Count down: ${timeData.hours} ${timeData.minutes} ${timeData.seconds}`);
    
    if (remainingTimeInSeconds === 0) {
      playSound();
      console.log("finished ", timeData.formattedTime);
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
    console.log(`Count up: ${timeData.hours} ${timeData.minutes} ${timeData.seconds}`);
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

  console.log("Count down initilization: ", timeData.countDownFromInSeconds);
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

  console.log("Count up initilization: ", timeData.countUpFromInSeconds);
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
    console.log("Stopped time: ", timeData.formattedTime);
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
  console.log("Time reset");
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

function saveTime() {
  
}
