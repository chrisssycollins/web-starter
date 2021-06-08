module.exports = (ctx) => ({
	plugins: {
		'autoprefixer': {},
		// Only run CSSNano in production
		cssnano: ctx.env === "production" ? {
			preset: "default"
		} : false
	},
})