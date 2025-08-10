const fs = require("fs");
const path = require("path");
const scripts = require("./index.api");

const getWjstJson = (waw) => {
  let wjstJson = waw.readJson(path.join(process.cwd(), "wjst.json"));

  if (waw.config.fetch) {
    for (const docs in waw.config.fetch) {
      try {
        wjstJson = {
          ...wjstJson,
          ...waw.readJson(path.join(process.cwd(), docs + ".json")),
        };
      } catch (error) {
        console.error(`using fetch for ${docs}: ${error}`);
      }
    }
  }

  return wjstJson;
};

const new_page = function (waw) {
  waw.argv.shift();
  if (!waw.argv.length) {
    console.log("Provide Name");
    process.exit(0);
  }
  let name = waw.argv[0].toLowerCase();
  let Name = name.slice(0, 1).toUpperCase() + name.slice(1);
  let location = path.join(process.cwd(), "pages", name);

  if (fs.existsSync(location)) {
    console.log("Page already exists");
    process.exit(0);
  }
  fs.mkdirSync(location, { recursive: true });

  let code = fs.readFileSync(__dirname + "/page/index.html", "utf8");
  code = code.split("CNAME").join(Name);
  code = code.split("NAME").join(name);
  fs.writeFileSync(path.join(location, name + ".html"), code, "utf8");

  code = fs.readFileSync(__dirname + "/page/page.json", "utf8");
  code = code.split("CNAME").join(Name);
  code = code.split("NAME").join(name);
  fs.writeFileSync(path.join(location, "page.json"), code, "utf8");

  console.log("Page has been created");
  process.exit();
};
module.exports.page = new_page;
module.exports.p = new_page;

async function generate_documents(waw, exit = true) {
  if (waw.config.generate) {
    if (exit) {
      const wjst = require(path.join(waw._modules.sem.__root, "wjst"));
      const sem = require(path.join(waw._modules.sem.__root, "index"));
      const core = require(path.join(waw._modules.core.__root, "index"));
      core(waw);
      sem(waw);
      wjst(waw);
      scripts(waw);
    }

    for (const _url in waw.config.generate) {
      let url = _url.split("/");

      let file = url.pop();

      const folder = url.length ? url.join("/") : "";

      if (folder) {
        const folderPath = path.join(process.cwd(), folder);

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
      }

      const json = getWjstJson(waw);

      const page = waw.config.generate[_url];

      waw.build(process.cwd(), page);

      if (file.startsWith(":")) {
        file = file.split(":")[1].split(".");

        if (file.length === 2 && Array.isArray(json[file[0]])) {
          for (const doc of json[file[0]]) {
            fs.writeFileSync(
              path.join(process.cwd(), folder, doc[file[1]] + ".html"),
              waw.wjst.compileFile(
                path.join(process.cwd(), "dist", page + ".html")
              )({
                ...json,
                ...doc,
              }),
              "utf8"
            );
          }
        } else if (exit) {
          console.error("Bad configuration for url " + _url);

          process.exit();
        }
      } else {
        fs.writeFileSync(
          path.join(process.cwd(), folder, page + ".html"),
          waw.wjst.compileFile(
            path.join(process.cwd(), "dist", page + ".html")
          )(json),
          "utf8"
        );
      }
    }

    console.log("Your files been generated");
  } else {
    console.log("You don't have any generate configuration");
  }
  if (exit) {
    process.exit();
  }
}

module.exports.generate = generate_documents;
module.exports.g = generate_documents;

async function fetchInfo(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const fetch_documents = async function (waw, exit = true) {
  if (!waw.config.fetch) {
    if (exit) {
      console.warn("There is no configuration to fetch content");

      process.exit();
    } else {
      return;
    }
  }

  for (const info in waw.config.fetch) {
    const json = {};

    json[info] = await fetchInfo(waw.config.fetch[info]);

    fs.writeFileSync(
      path.join(process.cwd(), info + ".json"),
      JSON.stringify(json, null, 4)
    );
  }

  if (exit) {
    console.log("Information has been fetched");

    process.exit();
  }
};
module.exports.fetch = fetch_documents;
module.exports.f = fetch_documents;

const build = async function (waw) {
  if (!fs.existsSync(process.cwd(), "wjst.json")) {
    console.log("Looks like this is not waw wjst project, I cannot build it");
    process.exit(1);
  }

  const wjst = require(path.join(waw._modules.sem.__root, "wjst"));
  const sem = require(path.join(waw._modules.sem.__root, "index"));
  const core = require(path.join(waw._modules.core.__root, "index"));
  core(waw);
  sem(waw);
  wjst(waw);
  scripts(waw);
  if (!fs.existsSync(process.cwd(), "base.html")) {
    console.log(
      "Looks like you don't base.html, please rename index.html into base.html"
    );
    process.exit(1);
  }

  await fetch_documents(waw, false);

  const wjstJson = getWjstJson(waw);

  const folders = waw.getDirectories(path.join(process.cwd(), "pages"));
  for (const folder of folders) {
    const page = path.basename(folder);
    waw.build(process.cwd(), page);
    const json = {
      ...wjstJson,
      ...waw.readJson(path.join(process.cwd(), "pages", page, "page.json")),
      page: `/pages/${page}/${page}.html`,
      ...(waw.config.build || {}),
    };
    fs.writeFileSync(
      path.join(process.cwd(), page + ".html"),
      waw.wjst.compileFile(path.join(process.cwd(), "dist", page + ".html"))(
        json
      ),
      "utf8"
    );
  }

  if (waw.config.build && waw.config.build.page) {
    if (
      typeof waw.config.build.page === "object" &&
      !Array.isArray(waw.config.build.page)
    ) {
      waw.config.build.page = [waw.config.build.page];
    }

    for (const page of waw.config.build.page) {
      if (!page.json || !page.name || (!page.folder && !page.url)) {
        continue;
      }

      const localJson =
        typeof page.json === "string"
          ? JSON.parse(
              await fs.readFileSync(
                path.join(process.cwd(), page.json + ".json"),
                "utf8"
              )
            )
          : page.json;

      if (page.folder) {
        const folder = path.join(process.cwd(), page.folder);

        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }

        for (const doc of localJson[page.json]) {
          const json = {
            ...wjstJson,
            ...waw.readJson(
              path.join(process.cwd(), "pages", page.name, "page.json")
            ),
            ...(waw.config.build || {}),
            ...doc,
          };
          fs.writeFileSync(
            path.join(folder, (doc.nameUrl || doc._id) + ".html"),
            waw.wjst.compileFile(
              path.join(process.cwd(), "dist", page.name + ".html")
            )(json),
            "utf8"
          );
        }
      } else if (page.url) {
        const json = {
          ...wjstJson,
          ...waw.readJson(
            path.join(process.cwd(), "pages", page.name, "page.json")
          ),
          ...(waw.config.build || {}),
          ...localJson,
        };
        fs.writeFileSync(
          path.join(process.cwd(), page.url + ".html"),
          waw.wjst.compileFile(
            path.join(process.cwd(), "dist", page.name + ".html")
          )(json),
          "utf8"
        );
      }
    }
  }

  await generate_documents(waw, false);

  console.log("Template is builded");
  process.exit();
};
module.exports.build = build;
module.exports.b = build;

const _remove = (fileOrFolder) => {
  fileOrFolder = path.join(process.cwd(), fileOrFolder);

  if (fs.existsSync(fileOrFolder)) {
    const stat = fs.lstatSync(fileOrFolder);

    if (stat.isDirectory()) {
      fs.rmSync(fileOrFolder, { recursive: true });
    } else {
      fs.rmSync(fileOrFolder);
    }
  }
};
const remove = async function (waw) {
  _remove("pages");

  _remove("dist");

  _remove("base.html");

  if (waw.config.remove) {
    for (let fileOrFolder of waw.config.remove) {
      _remove(fileOrFolder);
    }
  }

  console.log("Files and folders been removed");

  process.exit();
};
module.exports.remove = remove;
module.exports.r = remove;
