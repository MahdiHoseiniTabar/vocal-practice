<template>
	<div class="keyboard-container">
		<div v-if="!pianoSamplesLoaded && !isLoadingPianoSamples" class="controls">
			<span class="error-message">
				Piano samples failed to load or are unavailable.
			</span>
		</div>

		<div class="keyboard-wrapper">
			<div class="keyboard">
				<div
					v-for="note in notes"
					:key="note.id"
					class="key white-key"
					@click="playNote(note)"
					:class="{
						'key-disabled': !pianoSamplesLoaded || isLoadingPianoSamples,
						[getOctaveColorClass(note.octave)]: true,
					}"
					:ref="
						(el) => {
							if (note.id === 'c3') c3KeyRef = el;
						}
					"
				>
					<span class="note-label">
						{{ note.label }}
					</span>
					<span class="note-octave">{{ note.octave }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineEmits, nextTick } from "vue"; // Added defineEmits
const base = useRuntimeConfig().app.baseURL;
const emit = defineEmits(["notePlayed"]); // Declare the custom event

// --- Musical Note Data (Diatonic Scale - White Keys Only) ---
const baseMusicalNotes = [
	{ solfege: "Do", name: "c", midiOffset: 0 },
	{ solfege: "Re", name: "d", midiOffset: 2 },
	{ solfege: "Mi", name: "e", midiOffset: 4 },
	{ solfege: "Fa", name: "f", midiOffset: 5 },
	{ solfege: "Sol", name: "g", midiOffset: 7 },
	{ solfege: "La", name: "a", midiOffset: 9 },
	{ solfege: "Si", name: "b", midiOffset: 11 },
];

const octaves = [2, 3, 4, 5]; // Desired octaves C2 to B5 (inclusive)

// --- Reactive State ---
const notes = ref([]);
const audioContext = ref(null);
const oscillators = ref({}); // Keep oscillators ref here, although not used for piano sounds, as it's from previous logic.

// --- Piano Sample Specific State ---
const pianoBuffers = ref({});
const isLoadingPianoSamples = ref(false);
const pianoSamplesLoaded = ref(false);

const audioFileMap = {};
octaves.forEach((octaveNum) => {
	baseMusicalNotes.forEach((baseNote) => {
		const fullNoteId = baseNote.name + octaveNum;
		audioFileMap[fullNoteId] = `${base}audio/piano/${fullNoteId}.ogg`;
	});
});

// --- Octave Color Mapping for UI ---
const octaveColorMap = {
	2: "octave-color-2",
	3: "octave-color-3",
	4: "octave-color-4",
	5: "octave-color-5",
};
const c3KeyRef = ref(null);

const getOctaveColorClass = (octave) => {
	return octaveColorMap[octave] || "";
};

// --- Initialization: Generate all notes for the keyboard ---
onMounted(() => {
	octaves.forEach((octaveNum) => {
		baseMusicalNotes.forEach((baseNote) => {
			notes.value.push({
				id: baseNote.name + octaveNum,
				baseName: baseNote.name,
				octave: octaveNum,
				label: baseNote.solfege,
				midiOffset: baseNote.midiOffset,
			});
		});
	});

	audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
	loadPianoSamples(); // Load piano samples immediately on mount

	// Scroll to C3 key after the DOM has been updated
	nextTick(() => {
		if (c3KeyRef.value) {
			c3KeyRef.value.scrollIntoView({
				behavior: "smooth", // Optional: smooth scrolling animation
				inline: "start", // Aligns the start of the element with the start of the scrollable area
				block: "nearest", // Ensures the element is in view within its parent's block dimension
			});
		}
	});
});

const loadPianoSamples = async () => {
	if (
		!audioContext.value ||
		pianoSamplesLoaded.value ||
		isLoadingPianoSamples.value
	) {
		return;
	}

	isLoadingPianoSamples.value = true;
	pianoSamplesLoaded.value = false;

	const promises = Object.entries(audioFileMap).map(
		async ([fullNoteId, fileName]) => {
			try {
				const response = await fetch(fileName);
				if (!response.ok) {
					throw new Error(
						`HTTP error! status: ${response.status} for ${fileName}`
					);
				}
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer = await audioContext.value.decodeAudioData(
					arrayBuffer
				);
				pianoBuffers.value[fullNoteId] = audioBuffer;
			} catch (error) {
				console.error(
					`Error loading piano sample for ${fullNoteId} (${fileName}):`,
					error
				);
				throw new Error(`Failed to load piano samples.`);
			}
		}
	);

	try {
		await Promise.all(promises);
		pianoSamplesLoaded.value = true;
		console.log("All piano samples loaded successfully!");
	} catch (error) {
		console.error("One or more piano samples failed to load:", error.message);
		pianoSamplesLoaded.value = false; // Corrected: was pianoSamples.value
		pianoBuffers.value = {};
	} finally {
		isLoadingPianoSamples.value = false;
	}
};

const generateSound = (note) => {
	if (!audioContext.value) return;

	const buffer = pianoBuffers.value[note.id];
	if (!buffer) {
		console.warn(`Piano buffer not loaded for note: ${note.id}.`);
		if (!isLoadingPianoSamples.value) {
			loadPianoSamples();
		}
		return;
	}

	const source = audioContext.value.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.value.destination);
	source.start(0);
};

const playNote = (note) => {
	if (!pianoSamplesLoaded.value || isLoadingPianoSamples.value) {
		console.log("Piano samples not ready yet.");
		return;
	}
	console.log(
		`Playing note: ${note.label}${note.octave} with sound type: Piano`
	);
	generateSound(note);
	emit("notePlayed", note); // Emit the note object to the parent
};

// --- Lifecycle Hooks ---
onBeforeUnmount(() => {
	if (audioContext.value) {
		audioContext.value.close();
	}
});
</script>

<style scoped>
/* Overall container for responsiveness and centering */
.keyboard-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	padding: 30px 5px;
	width: 100%;
	box-sizing: border-box;
}

/* Controls styling */
.controls {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	gap: 15px;
	background-color: #ffffff;
	border-radius: 12px;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	padding: 20px 30px;
	margin-bottom: 30px;
}

.controls label strong {
	color: #34495e; /* Stronger color for "Piano" text */
	font-weight: 700;
}

.controls label {
	font-weight: 600;
	color: #555;
}

/* No select element, so remove select styles */
/*
.controls select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1.05em;
    background-color: #fefefe;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
}

.controls select:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
}
*/

.loading-message {
	padding: 5px 10px;
	border-radius: 5px;
	font-size: 0.85em;
	background-color: #e0f2f7;
	color: #0288d1;
}

.error-message {
	padding: 5px 10px;
	border-radius: 5px;
	font-size: 0.85em;
	background-color: #ffebee;
	color: #d32f2f;
}

/* Keyboard specific styling */
.keyboard-wrapper {
	max-width: calc(
		100vw - (20px)
	); /* Constrain to viewport width minus container padding */
	width: 100%;
	overflow-x: auto; /* Enables horizontal scrolling for the keyboard content */
	-webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */

	border: 1px solid #ddd;
	border-radius: 8px;
	background-color: #c1c7f8;
	box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
	padding-top: 20px;
	padding-bottom: 20px;
}

.keyboard {
	display: flex;
	justify-content: flex-start;
	position: relative;
	min-width: 1200px; /* Ensures scrolling on smaller screens */
	user-select: none;
}

/* Base key styles (white keys) */
.key {
	width: clamp(40px, 6.5vw, 60px); /* Responsive width */
	height: clamp(140px, 20vw, 220px); /* Responsive height */
	position: relative;
	cursor: pointer;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	transition: transform 0.05s ease-out, box-shadow 0.05s ease-out,
		background-color 0.1s ease-out;
	box-sizing: border-box;
	flex-shrink: 0; /* Ensures keys don't shrink smaller than their defined width */

	background-color: #ffffff; /* White key background */
	border: 1px solid #a0a0a0; /* Border for white keys */
	border-width: 1px 1px 2px 1px; /* Thicker bottom border for depth */
	border-radius: 0 0 4px 4px; /* Only bottom corners rounded */
	margin-right: 2px; /* Small gap between white keys */
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: center;
	padding-bottom: 10px;
	z-index: 0;
}

/* Active (pressed) state */
.key:active:not(.key-disabled) {
	transform: translateY(2px);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	background-color: #f8f8f8; /* White keys lighten */
	border-color: #888;
}

/* Disabled state */
.key-disabled {
	background-color: #e9e9e9;
	cursor: not-allowed;
	opacity: 0.7;
	pointer-events: none;
	box-shadow: none;
}

/* Note label and octave styling */
.note-label {
	font-family: "Playfair Display", serif;
	font-size: 1.1em;
	font-weight: bold;
	line-height: 1;
	color: #333; /* Default label color */
}

.note-octave {
	font-size: 0.7em;
	font-weight: normal;
	line-height: 1;
	color: #666; /* Default octave color */
	margin-top: 10px;
}

/* Octave Color Classes (matching previous design, applied to labels) */
.octave-color-2 .note-label,
.octave-color-2 .note-octave {
	color: #5cb85c;
}
.octave-color-3 .note-label,
.octave-color-3 .note-octave {
	color: #dc3545;
}
.octave-color-4 .note-label,
.octave-color-4 .note-octave {
	color: #2e92e9;
}
.octave-color-5 .note-label,
.octave-color-5 .note-octave {
	color: #8017b8;
}
</style>
