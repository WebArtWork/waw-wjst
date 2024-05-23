const fs = require("fs");
const path = require("path");
const scripts = require("./index");
const new_page = function (waw) {
	waw.argv.shift();
	if (!waw.argv.length) {
		console.log("Provide Name");
		process.exit(0);
	}
	let name = waw.argv[0].toLowerCase();
	let Name = name.slice(0, 1).toUpperCase() + name.slice(1);
	let location = path.join(process.cwd(), "pages", name);

	if (fs.existsSync(location)) {
		console.log("Page already exists");
		process.exit(0);
	}
	fs.mkdirSync(location, { recursive: true });

	let code = fs.readFileSync(__dirname + "/page/index.html", "utf8");
	code = code.split("CNAME").join(Name);
	code = code.split("NAME").join(name);
	fs.writeFileSync(path.join(location, name + ".html"), code, "utf8");

	code = fs.readFileSync(__dirname + "/page/page.json", "utf8");
	code = code.split("CNAME").join(Name);
	code = code.split("NAME").join(name);
	fs.writeFileSync(path.join(location, "page.json"), code, "utf8");

	console.log("Page has been created");
	process.exit(1);
};
module.exports.page = new_page;
module.exports.p = new_page;

const build = async function (waw) {
	if (!fs.existsSync(process.cwd(), "template.json")) {
		console.log(
			"Looks like this is not waw template project, I cannot build it"
		);
		process.exit(1);
	}
	const wjst = require(path.join(waw._modules.sem.__root, "wjst"));
	const sem = require(path.join(waw._modules.sem.__root, "index"));
	const core = require(path.join(waw._modules.core.__root, "index"));
	core(waw);
	sem(waw);
	wjst(waw);
	scripts(waw);
	if (!fs.existsSync(process.cwd(), "base.html")) {
		console.log(
			"Looks like you don't base.html, please rename index.html into base.html"
		);
		process.exit(1);
	}
	const folders = waw.getDirectories(path.join(process.cwd(), "pages"));
	const templateJson = waw.readJson(
		path.join(process.cwd(), "template.json")
	);
	for (const folder of folders) {
		const page = path.basename(folder);
		waw.build(process.cwd(), page);
		const json = {
			...templateJson,
			...waw.readJson(
				path.join(process.cwd(), "pages", page, "page.json")
			),
			...(waw.config.build || {})
		};
		fs.writeFileSync(
			path.join(process.cwd(), page + '.html'),
			waw.wjst.compileFile(
				path.join(process.cwd(), "dist", page + ".html")
			)(json),
			"utf8"
		);
	}
	console.log("Template is builded");
	process.exit(1);
};
module.exports.build = build;
module.exports.b = build;
