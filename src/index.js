#!/usr/bin/env node
const { Command } = require("commander"); // include commander in git clone of commander repo
const packageJSON = require("../package.json");
const L = require("./utils/log");
const program = new Command();

program.version(packageJSON.version);

// 打包上线用的
const publish = () => {
  const { publish } = require("./commands/publish/index");
  publish();
};
program
  .command("publish")
  .description("打包上线用的")
  .action(publish);
program
  .command("p")
  .description("打包上线用的(简写)\n ")
  .action(publish);

// 启动sourcemap服务
const mapServer = () => {
  const mapServer = require("./commands/sourceMap/mapServe");
  mapServer();
};
program
  .command("map-server")
  .description("启动sourcemap服务")
  .action(mapServer);
program
  .command("ms")
  .description("启动sourcemap服务(简写)\n ")
  .action(mapServer);

// 修改sourcemap存放位置
const setMapPath = () => {
  L.info(
    "建议项目目录如下: \n├─web-3.0\n│   └── 标准版\n│   └── 标准版>4.5.0\n│   └── xx定制\n│   └── xx定制2\n│   └── sourcemap"
  );
  const setMapConfig = require("./commands/sourceMap/setMapConfig");
  setMapConfig();
};
program
  .command("set-mappath")
  .description("修改sourcemap存放位置")
  .action(setMapPath);
program
  .command("smp")
  .description("修改sourcemap存放位置(简写)\n ")
  .action(setMapPath);

// 对比分支/tag
const diffBranch = () => {
  const diffBranch = require("./commands/git/diffBranch");
  diffBranch();
};
program
  .command("diff-branch")
  .description("对比分支/tag")
  .action(diffBranch);
program
  .command("db")
  .description("对比分支/tag(简写)\n ")
  .action(diffBranch);

// 隐藏分支
const hideBranch = () => {
  const hideBranch = require("./commands/git/hideBranch");
  hideBranch();
};
program
  .command("hide-branch")
  .description("隐藏分支")
  .action(hideBranch);
program
  .command("hb")
  .description("隐藏分支(简写)\n ")
  .action(hideBranch);

// 打tag
const pushTag = () => {
  const pushTag = require("./commands/git/pushTag");
  pushTag();
};
program
  .command("push-tag")
  .description("打tag")
  .action(pushTag);
program
  .command("pt")
  .description("打tag(简写)\n ")
  .action(pushTag);

//对比 language
const diffLanguage = () => {
  const language = require("./commands/diffLanguage/index");
  language();
};
program
  .command("diff-language")
  .description("对比language")
  .action(diffLanguage);
program
  .command("dl")
  .description("对比language\n ")
  .action(diffLanguage);

program.parse(process.argv);
