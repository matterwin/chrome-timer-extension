// import { PROVIDER, FIREBASE_AUTH } from './firebaseConfig.js';
//
// const PARENT_FRAME = document.location.ancestorOrigins[0];
//
// function sendResponse(result) {
//   globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
// }
//
// const _URL = 'http://localhost:3000';
// const iframe = document.createElement('iframe');
// iframe.src = _URL;
// document.documentElement.appendChild(iframe);
// chrome.runtime.onMessage.addListener(handleChromeMessages);
//
// function handleChromeMessages(message, sender, sendResponse) {
//   if (message.target !== 'offscreen') {
//     return false;
//   }
//
//   function handleIframeMessage({data}) {
//     try {
//       if (data.startsWith('!_{')) {
//         return;
//       }
//       data = JSON.parse(data);
//       self.removeEventListener('message', handleIframeMessage);
//
//       sendResponse(data);
//     } catch (e) {
//       console.log(`json parse failed - ${e.message}`);
//     }
//   }
//
//   globalThis.addEventListener('message', handleIframeMessage, false);
//
//   iframe.contentWindow.postMessage({"initAuth": true}, new URL(_URL).origin);
//   return true;
// }
//
