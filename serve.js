const fs = require('fs');
const path = require('path');
module.exports = function(waw){
	let template = {};
	if (fs.existsSync(process.cwd()+'/template.json')) {
		template = JSON.parse(fs.readFileSync(process.cwd()+'/template.json'));
	}else return;
	waw.serve(process.cwd(), {prefix: template.prefix});
	fs.mkdirSync(process.cwd()+'/pages', { recursive: true });
	fs.mkdirSync(process.cwd()+'/dist', { recursive: true });
	waw.app.get('/reset', function(req, res){ res.send(waw.now); });
	/*
	*	Pages Management
	*/
		let pages = waw.getDirectories(process.cwd()+'/pages');
		const serve = function(page){
			let url = '/' + (page.name!='index'&&page.name||'');
			waw.app.get(url, function(req, res){
				res.send(waw._derer.renderFile(page.dist, page.config));
			});
			waw.build(page.root);
			fs.watch(page.root, {
				recursive: true
			}, (curr, prev) => {
				waw.build(page.root);
				waw.now = Date.now();
			});
		}
		for (let i = pages.length-1; i >= 0; i--) {
			let root = pages[i];
			pages[i] = pages[i].split(path.sep).pop();
			let name = pages[i];
			if (fs.existsSync(process.cwd()+'/pages/'+name+'/page.json')) {
				pages[i] = {
					config: JSON.parse(JSON.stringify(template)),
					dist: process.cwd()+'/dist/'+name+'.html',
					root: root,
					name: name
				};
				let page = JSON.parse(fs.readFileSync(process.cwd()+'/pages/'+name+'/page.json'));
				for(let each in page){
					pages[i].config[each] = page[each];
				}
				serve(pages[i]);
			}else{
				pages.splice(i, 1);
			}
		}
		const reset = function(){
			for (var i = 0; i < pages.length; i++) {
				waw.build(pages[i].root);
			}
			waw.now = Date.now();
		}
		fs.watch(process.cwd()+'/index.html', {
			recursive: true
		}, reset);
		fs.watch(process.cwd()+'/template.json', {
			recursive: true
		}, reset);
		fs.watch(process.cwd()+'/js', {
			recursive: true
		}, reset);
		fs.watch(process.cwd()+'/css', {
			recursive: true
		}, reset);
		fs.watch(process.cwd()+'/img', {
			recursive: true
		}, reset);
	/* End of */
}