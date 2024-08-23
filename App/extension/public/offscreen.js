let audio = null;

chrome.runtime.onMessage.addListener(msg => {
    if ('play' in msg) playAudio(msg.play);
    if ('stop' in msg) stopAudio();
});

function playAudio({ source, volume }) {

  if (audio) {
    audio.pause(); 
    audio.currentTime = 0; 
  }

  audio = new Audio(source);
  audio.volume = volume;
  audio.play();
}

function stopAudio() {
  if (audio) {
    audio.pause(); 
    audio.currentTime = 0; 
  }
}
