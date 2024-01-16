const fs = require('fs');
const path = require('path');
const new_page = function(waw){
	waw.argv.shift();
	if(!waw.argv.length){
		console.log('Provide Name');
		process.exit(0);
	}
	let name = waw.argv[0].toLowerCase();
	let Name = name.slice(0, 1).toUpperCase() + name.slice(1);
	let location = path.join(process.cwd(), 'pages', name);
	if (fs.existsSync(location)) {
		console.log('Page already exists');
		process.exit(0);
	}
	fs.mkdirSync(location, { recursive: true });
	fs.mkdirSync(path.join(process.cwd(),'dist'), { recursive: true });
	
	let code = fs.readFileSync(__dirname + '/page/index.html', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	fs.writeFileSync(path.join(location, name+'.html'), code, 'utf8');
	
	code = fs.readFileSync(__dirname+'/page/page.json', 'utf8');
	code = code.split('CNAME').join(Name);
	code = code.split('NAME').join(name);
	fs.writeFileSync(path.join(location,'page.json'), code, 'utf8');
	
	console.log('Page has been created');
	process.exit(1);
}
module.exports.page = new_page;
module.exports.p = new_page;
