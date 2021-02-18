const fs = require('fs');
const path = require('path');
module.exports = function(waw){
	waw.build = function(root, page){
		fs.mkdirSync(root+'/dist', { recursive: true });
		if (!fs.existsSync(root+'/index.html')) {
			return console.log('Missing index.html in template root folder');
		}
		let code = fs.readFileSync(root+'/index.html', 'utf8');
		if (fs.existsSync(path.join(root,'pages',page,'/index.css'))) {
			code = code.replace('<!-- CSS -->', fs.readFileSync(path.join(root,'pages',page,'/index.css'), 'utf8'));
		}else code = code.replace('<!-- CSS -->', '');
		if (fs.existsSync(path.join(root,'pages',page,'/index.html'))) {
			code = code.replace('<!-- HTML -->', fs.readFileSync(path.join(root,'pages',page,'/index.html'), 'utf8'));
		}else code = code.replace('<!-- HTML -->', '');
		if (fs.existsSync(path.join(root,'pages',page,'/index.js'))) {
			code = code.replace('<!-- JS -->', fs.readFileSync(path.join(root,'pages',page,'/index.js'), 'utf8'));
		}else code = code.replace('<!-- JS -->', '');
		fs.writeFileSync(path.join(root,'dist',page+'.html'), code, 'utf8');
	}
}