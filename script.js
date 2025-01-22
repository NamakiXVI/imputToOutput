let audioContext;
let microphone;
let stream;
let audioProcessor;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const statusText = document.getElementById('status');

async function startAudio() {
  try {
    if (!audioContext) {
      // AudioContext nur einmal erstellen
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: "interactive", // Latenz optimieren
        sampleRate: 48000 // Standard-Sample-Rate
      });
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

    // Audioquelle erstellen
    microphone = audioContext.createMediaStreamSource(stream);

    // ScriptProcessor verwenden, um Daten direkt zu verarbeiten
    audioProcessor = audioContext.createScriptProcessor(256, 1, 1); // Kleine Puffergröße (256)
    audioProcessor.onaudioprocess = (audioEvent) => {
      const inputData = audioEvent.inputBuffer.getChannelData(0);
      const outputData = audioEvent.outputBuffer.getChannelData(0);
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i]; // Kopiert die Daten direkt
      }
    };

    // Verbindung herstellen
    microphone.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    // Status und Buttons aktualisieren
    statusText.textContent = "Status: Aufnahme läuft (du solltest dich hören)";
    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Fehler beim Zugriff auf das Mikrofon:", error);
    alert("Ihr sollt Mikro anmachen 🙄");
  }
}

function stopAudio() {
  // Verbindung und Ressourcen freigeben
  if (microphone) microphone.disconnect();
  if (audioProcessor) audioProcessor.disconnect();
  if (stream) stream.getTracks().forEach(track => track.stop());

  // Status und Buttons aktualisieren
  statusText.textContent = "Status: Aufnahme gestoppt";
  startButton.disabled = false;
  stopButton.disabled = true;
}

startButton.addEventListener("click", startAudio);
stopButton.addEventListener("click", stopAudio);