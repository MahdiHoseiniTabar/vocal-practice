// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: true },
	srcDir: "src/",
	app: {
		baseURL: "/singing-practice/",
		buildAssetsDir: "/_nuxt/", // Ensures correct asset paths
	},

	// Nuxt 3 uses Nitro for output; this ensures static files go to .output/public
	nitro: {
		output: {
			publicDir: ".output/public",
		},
	},
});
