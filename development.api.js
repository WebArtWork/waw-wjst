const fs = require("fs");
const path = require("path");
const sass = require("sass");
const chokidar = require("chokidar");

module.exports = async function (waw) {
  await waw.wait(1000);

  let wjst = {};
  if (fs.existsSync(path.join(process.cwd(), "wjst.json"))) {
    wjst = JSON.parse(fs.readFileSync(path.join(process.cwd(), "wjst.json")));
  } else return;
  waw.now = Date.now();
  waw.serve(process.cwd(), {
    prefix: wjst.prefix,
  });
  fs.mkdirSync(path.join(process.cwd(), "pages"), {
    recursive: true,
  });
  waw.app.get("/reset", function (req, res) {
    res.json(waw.now || "");
  });
  const compileScss = async (root, file, name) => {
    if (file.endsWith(".scss") && fs.existsSync(path.join(root, file))) {
      const result = await sass.compile(path.join(root, file), {
        style: "compressed",
      });
      fs.writeFile(
        path.join(process.cwd(), "css", name),
        result.css,
        "utf8",
        (err) => {
          if (err) throw err;
          waw.now = Date.now();
        }
      );
    }
  };
  compileScss(path.join(process.cwd(), "css"), "index.scss", "index.css");
  /*
   *	Pages Management
   */
  let pages = waw.getDirectories(path.join(process.cwd(), "pages"));
  const serve = function (page) {
    let url = "/" + ((page.name != "index" && page.name) || "");
    waw.app.get(url, function (req, res) {
      page.config.translate = (slug) => {
        return slug.split(".").slice(1).join(".");
      };
      if (Array.isArray(template.functions)) {
        for (const func of template.functions) {
          page.config[func] = (param) => {
            return param;
          };
        }
      }
      let html = waw._derer.renderFile(page.dist, page.config);
      let refresh = `<script>var id, reset = ()=>{ fetch('/reset').then(response => response.json()).then(resp => { if(!id) id = resp; else if(id != resp){ return location.reload(); }; setTimeout(reset, 1000); });};reset();</script>`;
      html = html.replace("</body>", refresh + "</body>");
      res.send(html);
    });
    waw.build(process.cwd(), page.name);
    const pagesRoot = path.join(process.cwd(), "pages", page.name);
    compileScss(pagesRoot, "index.scss", page.name + ".css");
    chokidar
      .watch(page.root, {
        recursive: true,
      })
      .on("all", (action, file) => {
        compileScss(pagesRoot, file, page.name + ".css");
        waw.afterWhile(
          this,
          () => {
            waw.build(process.cwd(), page.name);
            waw.now = Date.now();
          },
          100
        );
      });
  };

  for (let i = pages.length - 1; i >= 0; i--) {
    let root = pages[i];
    pages[i] = pages[i].split(path.sep).pop();
    let name = pages[i];
    const pagesPageJsonRoot = path.join(
      process.cwd(),
      "pages",
      name,
      "page.json"
    );
    if (fs.existsSync(pagesPageJsonRoot)) {
      pages[i] = {
        config: JSON.parse(JSON.stringify(wjst)),
        dist: process.cwd() + "/dist/" + name + ".html",
        root: root,
        name: name,
      };
      let page = JSON.parse(fs.readFileSync(pagesPageJsonRoot));
      for (let each in page) {
        pages[i].config[each] = page[each];
      }
      pages[i].config.page = `/pages/${name}/${name}.html`;
      serve(pages[i]);
    } else {
      pages.splice(i, 1);
    }
  }
  let loc = false;
  const reset = function (action, file) {
    if (loc) return;
    waw.afterWhile(
      this,
      () => {
        for (var i = 0; i < pages.length; i++) {
          waw.build(process.cwd(), pages[i].name);
        }
        waw.now = Date.now();
        loc = true;
        setTimeout(() => {
          loc = false;
        }, 2000);
      },
      100
    );
  };
  chokidar
    .watch(process.cwd() + "/index.html", {
      recursive: true,
    })
    .on("all", reset);
  chokidar
    .watch(process.cwd() + "/base.html", {
      recursive: true,
    })
    .on("all", reset);
  chokidar
    .watch(process.cwd() + "/wjst.json", {
      recursive: true,
    })
    .on("all", reset);
  chokidar
    .watch(
      process.cwd() + "/js",
      {
        recursive: true,
      },
      reset
    )
    .on("all", reset);
  chokidar
    .watch(process.cwd() + "/css", {
      recursive: true,
    })
    .on("all", (action, file) => {
      if (file.endsWith(".scss")) {
        compileScss(process.cwd() + "/css", "index.scss", "index.css");
      } else {
        reset();
      }
    });
  chokidar
    .watch(process.cwd() + "/img", {
      recursive: true,
    })
    .on("all", reset);
  /*
   *	Proxy Management
   */
  const http = waw.config.api
    ? waw.http(waw.config.api, waw.config.apiPort || 443)
    : null;
  waw.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/") && waw.config.api) {
      http.headers = req.headers;
      if (req.method === "GET") {
        http.get(req.originalUrl, (data) => {
          if (typeof data === "object") {
            res.setHeader("Content-Type", "application/json");
            res.json(data);
          } else {
            res.setHeader("Content-Type", "application/javascript");
            res.send(data);
          }
        });
      } else {
        http[req.method.toLowerCase()](req.originalUrl, req.body, (data) => {
          if (typeof data === "object") {
            res.setHeader("Content-Type", "application/json");
            res.json(data);
          } else {
            res.setHeader("Content-Type", "application/javascript");
            res.send(data);
          }
        });
      }
    } else {
      next();
    }
  });
  /* End of */
};
