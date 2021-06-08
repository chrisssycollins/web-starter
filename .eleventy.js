const { DateTime } = require("luxon");
const { minify } = require("terser");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("source/static");

	// Collections
	// tagList: Returns an array of all tags used
	eleventyConfig.addCollection("tagList", function (collectionApi) {
		let tagSet = new Set();
		collectionApi.getAll().forEach(item => {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		});

		return [...tagSet];
	});

	// posts: Returns a collection of markdown posts sorted by date value
	eleventyConfig.addCollection("posts", function (collectionApi) {
		return collectionApi.getFilteredByGlob("source/posts/**/*.md").sort(function (a, b) {
			return a.date - b.date;
		});
	});
	
	// Returns date as local string
	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
	});

	// Minify CSS code
	eleventyConfig.addFilter("cssmin", function (code) {
		return new CleanCSS({}).minify(code).styles;
	});

	// Minify Javascript code
	eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (code, callback) {
		try {
			const minified = await minify(code);
			callback(null, minified.code);
		} catch (err) {
			console.error("Terser error: ", err);
			// Fail gracefully.
			callback(null, code);
		}
	});

	// Deslugify string, useful for pretty printing tags
	eleventyConfig.addFilter("deslugify", function (str) {
		const result = str.replace(/\-/g, " ");
		return result.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	});

	// Minify HTML output during production builds
	eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
		if (outputPath && outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true
			});
			return minified;
		}

		return content;
	});

	return {
		dir: {
			input: "source/",
			output: "build",
			includes: "_includes",
			layouts: "_layouts"
		},
		templateFormats: ["html", "md", "njk"],
		htmlTemplateEngine: "njk",
		passthroughFileCopy: true
	};
};