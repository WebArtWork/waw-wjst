module.exports = function(waw){
	waw.fs.mkdirSync(process.cwd()+'/css', { recursive: true });
	waw.fs.mkdirSync(process.cwd()+'/js', { recursive: true });
	waw.fs.mkdirSync(process.cwd()+'/assets', { recursive: true });
	waw.fs.mkdirSync(process.cwd()+'/pages', { recursive: true });
	waw.fs.mkdirSync(process.cwd()+'/build', { recursive: true });
	let pages = waw.getDirectories(process.cwd()+'/pages');
	const serve = function(page){
		let url = '/' + (page.name!='index'&&page.name||'');
	    waw.app.get(url, function(req, res){
	    	res.sendFile(page.__root.replace('pages', 'build'));
	    });
	}
	for (let i = pages.length-1; i >= 0; i--) {
		let __root = pages[i];
		pages[i] = pages[i].split(waw.path.sep).pop();
		let name = pages[i];
		if (waw.fs.existsSync(process.cwd()+'/pages/'+name+'/page.json')) {
			pages[i] = JSON.parse(waw.fs.readFileSync(process.cwd()+'/pages/'+name+'/page.json'));
			pages[i].__root = __root;
			pages[i].__root = process.cwd()+'/build/'+name+'.html';
			if(!pages[i].name) pages[i].name = name;
			serve(pages[i]);
		}else{
			pages.splice(i, 1);
		}
	}
}