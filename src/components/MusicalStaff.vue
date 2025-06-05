<template>
	<div class="musical-staff-container">
		<svg :width="svgWidth" :height="svgHeight" class="musical-staff-svg">
			<line
				v-for="n in 5"
				:key="'line-' + n"
				:x1="STAFF_X_OFFSET"
				:y1="getStaffLineY(n)"
				:x2="svgWidth - STAFF_X_OFFSET"
				:y2="getStaffLineY(n)"
				stroke="black"
				:stroke-width="STAFF_LINE_THICKNESS"
			/>

			<path
				:d="gClefPath"
				fill="black"
				:transform="`translate(${STAFF_X_OFFSET - 5}, ${
					getStaffLineY(2) - 40
				}) scale(0.12)`"
				class="g-clef"
			/>

			<g v-if="currentNote" class="note-on-staff">
				<template
					v-for="(lineY, index) in getLedgerLinesY(getMidiNumber(currentNote))"
					:key="'ledger-' + index"
				>
					<line
						:x1="NOTE_X_POSITION - NOTE_LEDGER_LINE_LENGTH / 2"
						:y1="lineY"
						:x2="NOTE_X_POSITION + NOTE_LEDGER_LINE_LENGTH / 2"
						:y2="lineY"
						stroke="black"
						:stroke-width="STAFF_LINE_THICKNESS"
					/>
				</template>

				<ellipse
					:cx="NOTE_X_POSITION"
					:cy="getNoteY(getMidiNumber(currentNote))"
					:rx="NOTE_HEAD_RX"
					:ry="NOTE_HEAD_RY"
					fill="black"
				/>
				<line
					v-if="getStemDirection(getMidiNumber(currentNote)) === 'up'"
					:x1="NOTE_X_POSITION + NOTE_HEAD_RX"
					:y1="getNoteY(getMidiNumber(currentNote))"
					:x2="NOTE_X_POSITION + NOTE_HEAD_RX"
					:y2="getNoteY(getMidiNumber(currentNote)) - NOTE_STEM_LENGTH"
					stroke="black"
					:stroke-width="NOTE_STEM_THICKNESS"
				/>
				<line
					v-else
					:x1="NOTE_X_POSITION - NOTE_HEAD_RX"
					:y1="getNoteY(getMidiNumber(currentNote))"
					:x2="NOTE_X_POSITION - NOTE_HEAD_RX"
					:y2="getNoteY(getMidiNumber(currentNote)) + NOTE_STEM_LENGTH"
					stroke="black"
					:stroke-width="NOTE_STEM_THICKNESS"
				/>
			</g>
		</svg>
	</div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
	currentNote: {
		type: Object, // Expects { id, baseName, octave, label, midiOffset }
		default: null,
	},
});

// --- SVG & Staff Layout Constants ---
const svgWidth = 400;
const svgHeight = 350;
const STAFF_LINE_SPACING = 18; // Keep at 18 for good visual separation
const STAFF_LINE_THICKNESS = 1;
const STAFF_X_OFFSET = 50;

// Note drawing constants (unchanged)
const NOTE_X_POSITION = STAFF_X_OFFSET + 150;
const NOTE_HEAD_RX = 8;
const NOTE_HEAD_RY = 6;
const NOTE_STEM_LENGTH = 35;
const NOTE_STEM_THICKNESS = 1.2;
const NOTE_LEDGER_LINE_LENGTH = 30;

// The core vertical unit for staff positions: distance for one line-to-space or space-to-line step
const staff_step_unit = STAFF_LINE_SPACING / 2; // This is 9px

// --- MIDI Note Reference Constants (All defined here) ---
const C2_MIDI = 36; // C in Octave 2
const D2_MIDI = 38;
const E2_MIDI = 40;
const F2_MIDI = 41;
const G2_MIDI = 43;
const A2_MIDI = 45;
const B2_MIDI = 47;
const C3_MIDI = 48;
const D3_MIDI = 50;
const E3_MIDI = 52;
const F3_MIDI = 53;
const G3_MIDI = 55;
const A3_MIDI = 57;
const B3_MIDI = 59;
const C4_MIDI = 60; // C in Octave 4 (Middle C)
const D4_MIDI = 62;
const E4_MIDI = 64; // E on first line (bottom of treble clef)
const F4_MIDI = 65;
const G4_MIDI = 67; // G on second line (G-clef swirl)
const A4_MIDI = 69;
const B4_MIDI = 71; // B on third line (middle line)
const C5_MIDI = 72;
const D5_MIDI = 74;
const E5_MIDI = 76;
const F5_MIDI = 77; // F on fifth line (top line)
const G5_MIDI = 79;
const A5_MIDI = 81; // A above staff (first ledger line)
const B5_MIDI = 83;
const C6_MIDI = 84;
const E6_MIDI = 88;
const G6_MIDI = 91;
const B6_MIDI = 95;
const C7_MIDI = 96;
const D7_MIDI = 98;
const E7_MIDI = 100;
const F7_MIDI = 101;
const G7_MIDI = 103;
const A7_MIDI = 105;
const B7_MIDI = 107;
const C8_MIDI = 108; // Highest C on piano

// --- Staff Line Y-position Helper ---
// Defines the Y-coordinate for the 1st staff line (topmost F5 line).
const Y_F5_LINE_FIXED = 100; // A fixed Y position for the top staff line within our SVG.

const getStaffLineY = (lineNum) => {
	// Y_F5_LINE_FIXED is for line 1 (topmost).
	// For lines below (lineNum > 1), add multiples of STAFF_LINE_SPACING.
	return Y_F5_LINE_FIXED + (lineNum - 1) * STAFF_LINE_SPACING;
};

// --- Note Positioning Logic ---
// This function maps a MIDI note number to its visual staff position index.
// E4 (MIDI 64) is chosen as a reference point for staff position 0, which is on the 5th line.
const getStaffPositionIndex = (midiNumber) => {
	// This array represents the MIDI numbers of natural notes, ordered by their diatonic steps.
	// Each index corresponds to a staff position (line or space).
	const naturalNoteMidiOrder = [
		C2_MIDI,
		D2_MIDI,
		E2_MIDI,
		F2_MIDI,
		G2_MIDI,
		A2_MIDI,
		B2_MIDI, // Octave 2
		C3_MIDI,
		D3_MIDI,
		E3_MIDI,
		F3_MIDI,
		G3_MIDI,
		A3_MIDI,
		B3_MIDI, // Octave 3
		C4_MIDI,
		D4_MIDI,
		E4_MIDI,
		F4_MIDI,
		G4_MIDI,
		A4_MIDI,
		B4_MIDI, // Octave 4
		C5_MIDI,
		D5_MIDI,
		E5_MIDI,
		F5_MIDI,
		G5_MIDI,
		A5_MIDI,
		B5_MIDI, // Octave 5
	];

	const E4_INDEX = naturalNoteMidiOrder.indexOf(E4_MIDI); // Find E4's index in this ordered list

	const targetIndex = naturalNoteMidiOrder.indexOf(midiNumber);
	if (targetIndex === -1) {
		// This should not happen for natural notes if they are in the list.
		console.warn(`MIDI note ${midiNumber} not found in natural notes mapping.`);
		return 0; // Fallback
	}

	// The difference in indices is the number of staff steps from E4.
	// Positive means higher on the staff (lower Y), negative means lower (higher Y).
	return targetIndex - E4_INDEX;
};

// Maps a MIDI note number to its Y-coordinate on the SVG staff.
const getNoteY = (midiNumber) => {
	const staffPositionIndex = getStaffPositionIndex(midiNumber);
	// Y_E4_LINE_FIXED is the Y for E4 (staff position 0 relative to E4).
	// Higher staff position index (e.g., F4, G4) means lower Y value (visually higher).
	return getStaffLineY(5) - staffPositionIndex * staff_step_unit;
};

// Calculates the full MIDI number from the passed note object
const getMidiNumber = (note) => {
	return (note.octave + 1) * 12 + note.midiOffset;
};

// Determines the stem direction (up or down).
const getStemDirection = (midiNumber) => {
	// Notes at or below B4 (MIDI 71) usually have stems up. Notes above B4 usually have stems down.
	return midiNumber <= B4_MIDI ? "up" : "down";
};

// --- Ledger Lines Logic ---
// Returns an array of Y-coordinates for ledger lines needed for the given note.
const getLedgerLinesY = (midiNumber) => {
	const ledgerLines = [];

	// Logic for ledger lines below the staff
	if (midiNumber < E4_MIDI) {
		// E4 (MIDI 64) is the lowest main staff line
		if (midiNumber <= C4_MIDI) ledgerLines.push(getNoteY(C4_MIDI));
		if (midiNumber <= A3_MIDI) ledgerLines.push(getNoteY(A3_MIDI));
		if (midiNumber <= F3_MIDI) ledgerLines.push(getNoteY(F3_MIDI));
		if (midiNumber <= D3_MIDI) ledgerLines.push(getNoteY(D3_MIDI));
		if (midiNumber <= B2_MIDI) ledgerLines.push(getNoteY(B2_MIDI));
		if (midiNumber <= G2_MIDI) ledgerLines.push(getNoteY(G2_MIDI));
		if (midiNumber <= E2_MIDI) ledgerLines.push(getNoteY(E2_MIDI));
		if (midiNumber <= C2_MIDI) ledgerLines.push(getNoteY(C2_MIDI)); // C2 is our lowest
	}

	// Logic for ledger lines above the staff
	if (midiNumber > F5_MIDI) {
		// F5 (MIDI 77) is the highest main staff line
		if (midiNumber >= A5_MIDI) ledgerLines.push(getNoteY(A5_MIDI));
	}

	return ledgerLines;
};

// G-clef SVG path data - Will be provided later
const gClefPath = ``;
</script>

<style scoped>
/* ... (all existing styles remain unchanged) ... */
.musical-staff-container {
	display: flex; /* Keeping flexbox for potential internal centering or layout */
	flex-direction: column; /* As it was before */
	align-items: center; /* Center content vertically if flex column */
	gap: 20px;
	padding: 20px;
	width: calc(100% - 20px);
	box-sizing: border-box;

	/* --- CRUCIAL FIX FOR HORIZONTAL CENTERING --- */
	margin: 10px auto; /* Sets top/bottom margin to 0, left/right margin to auto */
	max-width: 400px; /* Limits its maximum width */
	/* --- END CRUCIAL FIX --- */

	margin-bottom: 20px; /* Keep the margin to the keyboard below it */
	border: 1px solid #ddd;
	border-radius: 8px;
	background-color: #fff;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	padding: 10px 0;
}

.musical-staff-svg {
	display: block;
	width: 100%;
	height: auto;
}
</style>
