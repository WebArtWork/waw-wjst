var fs = require('fs');
var path = require('path');
module.exports = function(waw){
	fs.mkdirSync(process.cwd()+'/css', { recursive: true });
	fs.mkdirSync(process.cwd()+'/js', { recursive: true });
	fs.mkdirSync(process.cwd()+'/assets', { recursive: true });
	fs.mkdirSync(process.cwd()+'/pages', { recursive: true });
	fs.mkdirSync(process.cwd()+'/build', { recursive: true });
	let pages = waw.getDirectories(process.cwd()+'/pages');
	const build = function(page){
		waw.afterWhile(function(){
			if (!fs.existsSync(process.cwd()+'/index.html')) {
				return console.log('Missing index.html in template root folder');
			}
			let code = fs.readFileSync(process.cwd()+'/index.html', 'utf8');
			if (fs.existsSync(page.__root+'/index.css')) {
				code = code.split('<!-- CSS -->').join(fs.readFileSync(page.__root+'/index.css', 'utf8'));
			}
			if (fs.existsSync(page.__root+'/index.html')) {
				code = code.split('<!-- HTML -->').join(fs.readFileSync(page.__root+'/index.html', 'utf8'));
			}
			if (fs.existsSync(page.__root+'/index.js')) {
				code = code.split('<!-- JS -->').join(fs.readFileSync(page.__root+'/index.js', 'utf8'));
			}
			fs.writeFileSync(page.__build, code, 'utf8');
		});
	}
	const serve = function(page){
		let url = '/' + (page.__name!='index'&&page.__name||'');
		waw.app.get(url, function(req, res){
			res.send(waw._derer.renderFile(page.__build, page));
		});
		fs.watch(page.__root, {
			recursive: true
		}, (curr, prev) => {
			build(page);
		});
	}
	for (let i = pages.length-1; i >= 0; i--) {
		let __root = pages[i];
		pages[i] = pages[i].split(path.sep).pop();
		let name = pages[i];
		if (fs.existsSync(process.cwd()+'/pages/'+name+'/page.json')) {
			pages[i] = {};
			let template = JSON.parse(fs.readFileSync(process.cwd()+'/template.json'));
			for(let each in template){
				pages[i][each] = template[each];
			}
			let page = JSON.parse(fs.readFileSync(process.cwd()+'/pages/'+name+'/page.json'));
			for(let each in page){
				pages[i][each] = page[each];
			}
			pages[i].__root = __root;
			pages[i].__build = process.cwd()+'/build/'+name+'.html';
			pages[i].__name = name;
			serve(pages[i]);
		}else{
			pages.splice(i, 1);
		}
	}
}