<template>
	<div>
		<!-- <h1>Singing Practice App - Listening Keyboard</h1> -->
		<MusicalStaff :currentNote="currentNotePlayed" />
		<Keyboard @note-played="handleNotePlayed" />
	</div>
</template>

<script setup>
import { ref } from "vue";
import Keyboard from "~/components/Keyboard.vue";
import MusicalStaff from "~/components/MusicalStaff.vue"; // Import the new component

const currentNotePlayed = ref(null); // Reactive state to hold the last played note

// Event handler for notes played from the keyboard
const handleNotePlayed = (note) => {
	currentNotePlayed.value = note; // Update the note displayed on the staff
	console.log("Note played from keyboard:", note);
};
</script>   

<style>
/* Import Playfair Display from Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap"); /* Using regular and bold weights */

/* Global styles for the entire page (NO SCOPED here!) */
html,
body {
	/* This is the crucial fix: Prevents horizontal scrolling of the entire page */
	overflow-x: hidden;
	/* Ensure the body takes up at least the full viewport height */
	min-height: 100vh;
	margin: 0; /* Remove default browser margin */
	padding: 0; /* Remove default browser padding */
	box-sizing: border-box; /* Include padding/border in element's total width/height */
}

body {
	font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	background: linear-gradient(to bottom right, #e0e0e0, #f0f0f0);
	display: flex;
	flex-direction: column;
	align-items: center; /* Center content horizontally */
	justify-content: flex-start; /* Align content to the top */
	padding-top: 50px; /* Add some space from the top of the viewport */
	color: #333;
}

h1 {
	color: #34495e;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
}
</style>
