const fs = require("fs");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html);
const { window } = dom;
// Set globals expected by axe
global.window = window;
global.document = window.document;
global.Node = window.Node;
global.NodeList = window.NodeList;
global.Element = window.Element;
const axe = require("axe-core");

axe
  .run(window.document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
  })
  .then((results) => {
    fs.writeFileSync("axe-report.json", JSON.stringify(results, null, 2));
    console.log("Violations:", results.violations.length);
  })
  .catch((err) => {
    console.error(err);
  });
