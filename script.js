let audioContext;
let microphone;
let source;
let stream;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const statusText = document.getElementById('status');

async function startAudio() {
  try {
    if (!audioContext) {
      // AudioContext nur einmal erstellen
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Mikrofonzugriff anfordern
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 48000,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    // Quelle nur erstellen, wenn sie noch nicht existiert
    if (!source) {
      source = audioContext.createMediaStreamSource(stream);
    }

    // Mikrofon direkt mit Lautsprecher verbinden
    source.connect(audioContext.destination);

    // Status und Buttons aktualisieren
    statusText.textContent = "Status: Aufnahme läuft (du solltest dich hören)";
    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Fehler beim Zugriff auf das Mikrofon:", error);
    alert("Ihr sollt das Mikro anmachen 🙄😒");
  }
}

function stopAudio() {
  // Verbindung zwischen Mikrofon und Lautsprecher trennen
  if (source) {
    source.disconnect(audioContext.destination);
  }

  // Status und Buttons aktualisieren
  statusText.textContent = "Status: Aufnahme gestoppt";
  startButton.disabled = false;
  stopButton.disabled = true;
}

startButton.addEventListener("click", startAudio);
stopButton.addEventListener("click", stopAudio);