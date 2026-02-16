let currentPart = null;
let currentSynth = null;
let currentMidi = null;

/* ============================= */
/* MIDI LADEN UND PLAY */
/* ============================= */
async function loadMidi(url) {
    // Alte Part/Synth sauber stoppen
    stop();

    // AudioContext aktivieren (Browser-Sicherheit)
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }

    // MIDI-Datei laden
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    currentMidi = new Midi(arrayBuffer);

    // PolySynth erstellen
    currentSynth = new Tone.PolySynth(Tone.Synth).toDestination();

    // Alle Tracks zusammenführen in eine Notenliste
    let notes = [];
    currentMidi.tracks.forEach(track => {
        track.notes.forEach(n => {
            notes.push({
                time: n.time,
                name: n.name,
                duration: n.duration,
                velocity: n.velocity
            });
        });
    });

    // Part erstellen
    currentPart = new Tone.Part((time, note) => {
        currentSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
    }, notes);

    currentPart.start(0);

    // Transport vorbereiten
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    // Direkt abspielen
    play();
}

/* ============================= */
/* PLAY / STOP */
/* ============================= */
async function play() {
    if (!currentPart) return;

    if (Tone.context.state !== 'running') {
        await Tone.start(); // AudioContext aktivieren
    }

    Tone.Transport.start();
}

function stop() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    if (currentPart) {
        currentPart.dispose();
        currentPart = null;
    }
    if (currentSynth) {
        currentSynth.dispose();
        currentSynth = null;
    }
    currentMidi = null;
}
