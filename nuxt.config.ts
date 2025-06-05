// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: true },
	srcDir: "src/",
	target: "static", // optional in Nuxt 3, but helps clarify intent
	nitro: {
		preset: "static",
	},
	app: {
		baseURL: "/vocal-practice/", // ✅ MUST match repo name
		cdnURL: "/vocal-practice/", // ✅ MUST match repo name
		buildAssetsDir: "_nuxt/", // ✅ no slash, no duplicate prefix
	},
});
