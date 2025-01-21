    let audioContext;
    let microphone;
    let audioProcessor;
    let stream;

    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const statusText = document.getElementById('status');

    // Start Audio Capture
    async function startAudio() {
      try {
        // Zugriff auf das Mikrofon mit spezifischen Einstellungen
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000, // Höhere Sample-Rate für bessere Qualität
            channelCount: 1,  // Mono-Input
            echoCancellation: false, // Bessere Rohdaten
            noiseSuppression: false, // Kein Rauschfilter
            autoGainControl: false  // Keine automatische Lautstärkeanpassung
          }
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000 // Gleiche Sample-Rate wie das Mikrofon
        });

        microphone = audioContext.createMediaStreamSource(stream);

        // Audio-Prozessor mit kleinerer Puffergröße für Echtzeit
        audioProcessor = audioContext.createScriptProcessor(512, 1, 1);
        audioProcessor.onaudioprocess = (audioEvent) => {
          const inputData = audioEvent.inputBuffer.getChannelData(0);
          const outputData = audioEvent.outputBuffer.getChannelData(0);

          // Direkte Kopie der Eingangsdaten in die Ausgangsdaten
          for (let i = 0; i < inputData.length; i++) {
            outputData[i] = inputData[i];
          }
        };

        // Verbinden der Audio-Knoten
        microphone.connect(audioProcessor);
        audioProcessor.connect(audioContext.destination);

        // UI-Updates
        statusText.textContent = "Status: Aufnahme läuft";
        startButton.disabled = true;
        stopButton.disabled = false;
      } catch (error) {
        console.error('Fehler beim Zugriff auf das Mikrofon:', error);
        alert('Bitte erlaube den Zugriff auf das Mikrofon und versuche es erneut.');
      }
    }

    // Stop Audio Capture
    function stopAudio() {
      if (microphone) microphone.disconnect();
      if (audioProcessor) audioProcessor.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();

      // UI-Updates
      statusText.textContent = "Status: Aufnahme gestoppt";
      startButton.disabled = false;
      stopButton.disabled = true;
    }

    // Event-Listener für Buttons
    startButton.addEventListener('click', startAudio);
    stopButton.addEventListener('click', stopAudio);