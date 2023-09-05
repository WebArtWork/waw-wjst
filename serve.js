const fs = require("fs");
const path = require("path");
const sass = require("sass");
const chokidar = require('chokidar');

module.exports = function (waw) {
	let template = {};
	if (fs.existsSync(path.join(process.cwd(), "template.json"))) {
		template = JSON.parse(
			fs.readFileSync(path.join(process.cwd(), "template.json"))
		);
	} else return;
	waw.now = Date.now();
	waw.serve(process.cwd(), {
		prefix: template.prefix,
	});
	fs.mkdirSync(process.cwd() + "/pages", {
		recursive: true,
	});
	waw.app.get("/reset", function (req, res) {
		res.json(waw.now || "");
	});
	const compileScss = (root, file, name) => {
		if (
			file.endsWith(".scss") &&
			fs.existsSync(path.join(root, file))
		) {
			sass.render(
				{
					file: path.join(root, file),
					outputStyle: "compressed",
				},
				function (err, result) {
					if (err) {
						throw err;
					}
					if (result) {
						fs.writeFile(
							path.join(process.cwd(), "css", name),
							result.css,
							"utf8",
							(err) => {
								if (err) throw err;
								waw.now = Date.now();
							}
						);
					}
				}
			);
		}
	};
	compileScss(process.cwd() + "/css", "index.scss", "index.css");
	/*
	 *	Pages Management
	 */
	let pages = waw.getDirectories(process.cwd() + "/pages");
	const serve = function (page) {
		let url = "/" + ((page.name != "index" && page.name) || "");
		waw.app.get(url, function (req, res) {
			page.config.translate = (slug) => {
				return slug.split('.').slice(1).join('.');
			}
			let html = waw._derer.renderFile(page.dist, page.config);
			let refresh = `<script>var id, reset = ()=>{ fetch('/reset').then(response => response.json()).then(resp => { if(!id) id = resp; else if(id != resp){ return location.reload(); }; setTimeout(reset, 1000); });};reset();</script>`;
			html = html.replace("</body>", refresh + "</body>");
			res.send(html);
		});
		waw.build(process.cwd(), page.name);
		compileScss(
			process.cwd() + "/pages/" + page.name,
			"index.scss",
			page.name + ".css"
		);
		chokidar.watch(
			page.root,
			{
				recursive: true,
			}
		).on('all', (action, file) => {
			compileScss(
				process.cwd() + "/pages/" + page.name,
				file,
				page.name + ".css"
			);
			waw.afterWhile(
				this,
				() => {
					waw.build(process.cwd(), page.name);
					waw.now = Date.now();
				},
				100
			);
		});
	};
	for (let i = pages.length - 1; i >= 0; i--) {
		let root = pages[i];
		pages[i] = pages[i].split(path.sep).pop();
		let name = pages[i];
		if (fs.existsSync(process.cwd() + "/pages/" + name + "/page.json")) {
			pages[i] = {
				config: JSON.parse(JSON.stringify(template)),
				dist: process.cwd() + "/dist/" + name + ".html",
				root: root,
				name: name,
			};
			let page = JSON.parse(
				fs.readFileSync(process.cwd() + "/pages/" + name + "/page.json")
			);
			for (let each in page) {
				pages[i].config[each] = page[each];
			}
			serve(pages[i]);
		} else {
			pages.splice(i, 1);
		}
	}
	let loc = false;
	const reset = function (action, file) {
		if (loc) return;
		waw.afterWhile(
			this,
			() => {
				for (var i = 0; i < pages.length; i++) {
					waw.build(process.cwd(), pages[i].name);
				}
				waw.now = Date.now();
				loc = true;
				setTimeout(() => {
					loc = false;
				}, 2000);
			},
			100
		);
	};
	chokidar.watch(
		process.cwd() + "/index.html",
		{
			recursive: true,
		}
	).on('all', reset);
	chokidar.watch(
		process.cwd() + "/template.json",
		{
			recursive: true,
		},
	).on('all', reset);
	chokidar.watch(
		process.cwd() + "/js",
		{
			recursive: true,
		},
		reset
	).on('all', reset);
	chokidar.watch(
		process.cwd() + "/css",
		{
			recursive: true,
		},
	).on('all', (action, file) => {
		if (file.endsWith(".scss")) {
			compileScss(process.cwd() + "/css", "index.scss", "index.css");
		} else {
			reset();
		}
	});
	chokidar.watch(
		process.cwd() + "/img",
		{
			recursive: true,
		},
	).on('all', reset);
         /*
	 *	Proxy Management
	 */
	const http = waw.http('http://localhost', '8080');
	waw.use((req, res, next) => {
		if (req.originalUrl.startsWith('/api/')) {
			if (req.method === 'GET') {
				http.get(req.originalUrl, data => {
					if (typeof data === 'object') {
						res.setHeader('Content-Type', 'application/json');
						res.json(data);
					} else {
						res.setHeader('Content-Type', 'application/javascript');
						res.send(data);
					}
				});
			} else {
				http[req.method.toLowerCase()](req.originalUrl, req.body, data => {
					if (typeof data === 'object') {
						res.setHeader('Content-Type', 'application/json');
						res.json(data);
					} else {
						res.setHeader('Content-Type', 'application/javascript');
						res.send(data);
					}
				});
			}
		} else {
			next();
		}
	});
	/* End of */
	
};
