const fs = require('fs');
module.exports = function(waw){
	waw.build = function(root){
		if (!fs.existsSync(root+'/index.html')) {
			return console.log('Missing index.html in template root folder');
		}
		let code = fs.readFileSync(root+'/index.html', 'utf8');
		if (fs.existsSync(root+'/index.css')) {
			code = code.replace('<!-- CSS -->', fs.readFileSync(root+'/index.css', 'utf8'));
		}else code = code.replace('<!-- CSS -->', '');
		if (fs.existsSync(root+'/index.html')) {
			code = code.replace('<!-- HTML -->', fs.readFileSync(root+'/index.html', 'utf8'));
		}else code = code.replace('<!-- HTML -->', '');
		if (fs.existsSync(root+'/index.js')) {
			code = code.replace('<!-- JS -->', fs.readFileSync(root+'/index.js', 'utf8'));
		}else code = code.replace('<!-- JS -->', '');
		fs.writeFileSync(root.replace('pages', 'dist')+'.html', code, 'utf8');
	}
}