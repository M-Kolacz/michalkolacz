const { config } = require('@epic-web/config/prettier')

/** @type {import("prettier").Config} */
module.exports = {
	...config,
	printWidth: 60,
}
