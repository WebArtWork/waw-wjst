const fs = require('fs');
const path = require('path');
const make_path = function(argv){
	return {path, name, Name};
}
const new_page = function(params){
	if(!params.argv.length){
		console.log('Provide Name');
		process.exit(0);
	}
	let name = params.argv[0].toLowerCase();
	let Name = name.slice(0, 1).toUpperCase() + name.slice(1);
	let location = process.cwd()+'/pages/'+name;
	if (fs.existsSync(location)) {
		console.log('Page already exists');
		process.exit(0);
	}
	fs.mkdirSync(location, { recursive: true });
	let pages = params.getDirectories(process.cwd()+'/pages');
	for (var i = 0; i < pages.length; i++) {
		pages[i] = pages[i].split(path.sep).pop();
	}
	let code = fs.readFileSync(__dirname+'/page/index.css', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	fs.writeFileSync(location+'/index.css', code, 'utf8');
	code = fs.readFileSync(__dirname+'/page/index.html', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	for (var i = 0; i < pages.length; i++) {
		code = '<a href="/'+pages[i]+'">'+pages[i]+'</a>\n' + code;
	}
	fs.writeFileSync(location+'/index.html', code, 'utf8');
	code = fs.readFileSync(__dirname+'/page/index.js', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	fs.writeFileSync(location+'/index.js', code, 'utf8');
	code = fs.readFileSync(__dirname+'/page/page.json', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	fs.writeFileSync(location+'/page.json', code, 'utf8');

	code = fs.readFileSync(__dirname+'/page/build.html', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	for (var i = 0; i < pages.length; i++) {
		code = '<a href="/'+pages[i]+'">'+pages[i]+'</a>\n' + code;
	}
	fs.writeFileSync(process.cwd()+'/dist/'+name+'.html', code, 'utf8');
	console.log('Page has been created');
	process.exit(1);
}
module.exports.page = new_page;
module.exports.p = new_page;