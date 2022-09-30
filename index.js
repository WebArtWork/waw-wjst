const fs = require('fs');
const path = require('path');
const sep = path.sep;
module.exports = function(waw){
	waw.derer.setFilter('translate', (phrase) => {
		return phrase;
	});
	let template = {};
	if (fs.existsSync(process.cwd() + sep + 'template.json')) {
		template = JSON.parse(fs.readFileSync(process.cwd() + sep + 'template.json'));
	}
	waw.build = function(root, page){
		fs.mkdirSync(root+sep+'dist', { recursive: true });
		if (!fs.existsSync(root+sep+'index.html')) {
			return console.log('Missing index.html in template root folder');
		}
		let code = fs.readFileSync(root+sep+'index.html', 'utf8');
		if (fs.existsSync(path.join(root, 'pages', page, 'index.scss')) ||
			fs.existsSync(path.join(root, 'pages', page, page+'.scss'))) {
			let cssLink = '<link rel="stylesheet" href="'+template.prefix+'/css/'+page+'.css"></link>';
			code = code.replace('<style><!-- CSS --></style>', cssLink, 'utf8');
		}else if (fs.existsSync(path.join(root, 'pages', page, 'index.css'))) {
			code = code.replace('<!-- CSS -->', fs.readFileSync(path.join(root, 'pages', page, 'index.css'), 'utf8'));
		}else if (fs.existsSync(path.join(root, 'pages', page, page+'.css'))) {
			code = code.replace('<!-- CSS -->', fs.readFileSync(path.join(root, 'pages', page, page+'.css'), 'utf8'));
		}else code = code.replace('<!-- CSS -->', '');

		if (fs.existsSync(path.join(root, 'pages', page, 'index.html'))) {
			code = code.replace('<!-- HTML -->', fs.readFileSync(path.join(root, 'pages', page, 'index.html'), 'utf8'));
		}else if (fs.existsSync(path.join(root, 'pages', page, page+'.html'))) {
			code = code.replace('<!-- HTML -->', fs.readFileSync(path.join(root, 'pages', page, page+'.html'), 'utf8'));
		}else code = code.replace('<!-- HTML -->', '');

		if (fs.existsSync(path.join(root, 'pages', page, 'index.js'))) {
			code = code.replace('<!-- JS -->', fs.readFileSync(path.join(root, 'pages', page, 'index.js'), 'utf8'));
		}else if (fs.existsSync(path.join(root, 'pages', page, page+'.js'))) {
			code = code.replace('<!-- JS -->', fs.readFileSync(path.join(root, 'pages', page, page+'.js'), 'utf8'));
		}else code = code.replace('<!-- JS -->', '');

		fs.writeFileSync(path.join(root, 'dist', page+'.html'), code, 'utf8');
	}
}
