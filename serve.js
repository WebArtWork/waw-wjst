const fs = require('fs');
const path = require('path');
const sep = path.sep;
const sass = require('sass');
module.exports = function(waw) {
    let template = {};
    if (fs.existsSync(path.join(process.cwd(), 'template.json'))) {
        template = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'template.json')));
    } else return;
    waw.now = Date.now();
    waw.serve(process.cwd(), {
        prefix: template.prefix
    });
    fs.mkdirSync(process.cwd() + '/pages', {
        recursive: true
    });
    waw.app.get('/reset', function(req, res) {
        res.json(waw.now || '');
    });
    const compileScss = (root, file, name) => {
        if (file.endsWith('.scss') && fs.existsSync(path.join(root, file))) {
            sass.render({
                file: root + sep + file,
				outputStyle: 'compressed'
            }, function(err, result) {
				if(err || !result) return;
                fs.writeFile(path.join(process.cwd(), 'css', name), result.css, 'utf8', err => {
                    if (err) throw err;
                    waw.now = Date.now();
                });
            });
        }
    }
    compileScss(process.cwd() + '/css', 'index.scss', 'index.css');
    /*
     *	Pages Management
     */
    let pages = waw.getDirectories(process.cwd() + '/pages');
    const serve = function(page) {
        let url = '/' + (page.name != 'index' && page.name || '');
        waw.app.get(url, function(req, res) {
            let html = waw._derer.renderFile(page.dist, page.config);
            let refresh = `<script>var id, reset = ()=>{ fetch('/reset').then(response => response.json()).then(resp => { if(!id) id = resp; else if(id != resp){ return location.reload(); }; setTimeout(reset, 1000); });};reset();</script>`;
            html = html.replace('</body>', refresh + '</body>')
            res.send(html);
        });
        waw.build(process.cwd(), page.name);
        compileScss(process.cwd() + '/pages/' + page.name, 'index.scss', page.name+'.css');
        fs.watch(page.root, {
            recursive: true
        }, (action, file) => {
            compileScss(process.cwd() + '/pages/' + page.name, file, page.name+'.css');
            waw.afterWhile(this, () => {
                waw.build(process.cwd(), page.name);
                waw.now = Date.now();
            }, 100);
        });
    }
    for (let i = pages.length - 1; i >= 0; i--) {
        let root = pages[i];
        pages[i] = pages[i].split(path.sep).pop();
        let name = pages[i];
        if (fs.existsSync(process.cwd() + '/pages/' + name + '/page.json')) {
            pages[i] = {
                config: JSON.parse(JSON.stringify(template)),
                dist: process.cwd() + '/dist/' + name + '.html',
                root: root,
                name: name
            };
            let page = JSON.parse(fs.readFileSync(process.cwd() + '/pages/' + name + '/page.json'));
            for (let each in page) {
                pages[i].config[each] = page[each];
            }
            serve(pages[i]);
        } else {
            pages.splice(i, 1);
        }
    }
    const reset = function(action, file) {
        waw.afterWhile(this, () => {
            for (var i = 0; i < pages.length; i++) {
                waw.build(process.cwd(), pages[i].name);
            }
            waw.now = Date.now();
        }, 100);
    }
    fs.watch(process.cwd() + '/index.html', {
        recursive: true
    }, reset);
    fs.watch(process.cwd() + '/template.json', {
        recursive: true
    }, reset);
    fs.watch(process.cwd() + '/js', {
        recursive: true
    }, reset);
    fs.watch(process.cwd() + '/css', {
        recursive: true
    }, (action, file) => {
        if(file.endsWith('.scss')){
            compileScss(process.cwd() + '/css', 'index.scss', 'index.css');
        } else {
            reset();
        }
    });
    fs.watch(process.cwd() + '/img', {
        recursive: true
    }, reset);
    /* End of */
}
