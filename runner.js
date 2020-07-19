const { exec } = require('child_process');
const fs = require('fs');
const exe = function(command, cb=()=>{}){
	if(!command) return cb();
	exec(command, (err, stdout, stderr) => {
		cb({err, stdout, stderr});
	});
}
const make_path = function(argv, folder, double_name){
	if(!argv.length){
		console.log('Provide Name');
		process.exit(0);
	}
	let path_argv = argv.slice();
	let path = path_argv[0];
	if(path_argv[0].indexOf('/')==-1){
		path = folder;
		while(path_argv.length){
			path += '/' + path_argv.shift();
		}
	}
	path = path.toLowerCase();
	let name_argv = argv.slice();
	let name = name_argv[name_argv.length-1];
	if(name.indexOf('/')>-1){
		name = name.split('/');
		name = name[name.length-1];
	}
	name = name.toLowerCase();
	let Name = name.slice(0, 1).toUpperCase() + name.slice(1);
	let base = process.cwd() + '/src/app/'+path;
	if(double_name){
		base += '/'+name;
	}
	return {path, name, Name, base};
}
const new_page = function(params){
	const {name, Name, base, folder} = make_path(params.argv, 'services');
	if (fs.existsSync(base+'.service.ts')) {
		console.log('Service already exists');
		process.exit(0);
	}
	let ts = fs.readFileSync(__dirname+'/service/service.ts', 'utf8');
	ts = ts.split('CNAME').join(Name);
	ts = ts.split('NAME').join(name);
	fs.writeFileSync(base+'.service.ts', ts, 'utf8');
	let index = process.cwd() + '/src/app/services/index.ts';
	if (fs.existsSync(index)) {
		let index_exports = fs.readFileSync(index, 'utf8') || '';
		let code = "export { "+Name+"Service } from './"+name+".service';";
		if(index_exports.indexOf(code)==-1){
			index_exports += (index_exports.length&&"\n"||"")+code;
			fs.writeFileSync(index, index_exports, 'utf8');
		}
	}
	console.log('Service has been created');
	process.exit(1);
}
module.exports.page = new_page;
module.exports.p = new_page;