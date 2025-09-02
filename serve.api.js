const path = require("path");
module.exports = function (waw) {
	if (
		!waw.config.wjst ||
		!Array.isArray(waw.config.wjst.templates) ||
		!waw.config.wjst.templates.length
	) {
		return;
	}

	for (const template of waw.config.wjst.templates) {
		const templatePath = path.join(process.cwd(), template.path);

		const page = {};

		for (const url of template.pages.split(" ")) {
			page["/" + (url === "index" ? "" : url)] = (req, res) => {
				res.send(
					waw.render(path.join(templatePath, "dist", "index.html"), {
						...waw.config,
						base: template.prefix + "/",
					})
				);
			};
		}

		waw.api({
			template: {
				path: templatePath,
				prefix: template.prefix,
				pages: template.pages,
			},
			page,
		});
	}
};
