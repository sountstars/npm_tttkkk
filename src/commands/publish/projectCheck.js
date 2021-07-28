const path = require("path");
const setting = require("../../setting.json");
const L = require("../../utils/log");
const { versionCompare } = require("../../utils/utils");
const language = require("../diffLanguage/index");

/***
 * 项目校验
 * @return ${Boolean} 是否校验通过
 */
const projectCheck = () => {
  const package = require(path.resolve("./package.json"));
  if (package.name === "web-3.0") {
    return [language(), packageCheckNode_modules(package), web30Check(package)];
  }
  return () => {
    L.error("出问题了，你可能存在以下情况：\n");
    L.error("   1. 请确认命令执行路径是否在项目根目录下 \n");
    L.error("   2. 请确认tky-bin是否更新为最新 \n");
    L.error("   3. 请确认当前项目tky-bin是否支持 \n");
  };
};

const web30Check = package => {
  const isOldVersion =
    versionCompare(setting.publish["web-3.0"].version, package.version) === 1;
  if (isOldVersion) {
    L.error("老版本项目请使用项目里的npm run publish");
    return false;
  }
  L.success(`当前项目版本为:${package.version}`);
  return true;
};

// 将package.json里的版本和node_modules里的进行匹配
const packageCheckNode_modules = package => {
  const npmList = Object.entries(package.dependencies);
  let bool = true;
  const result = npmList
    .map(item => {
      const [name, version] = item;
      let obj = { name, version };
      let instellPackage = null;
      try {
        instellPackage = require(path.resolve(
          `./node_modules/${name}/package.json`
        ));
      } catch (error) {}
      obj.err = null;
      if (!instellPackage) {
        obj.err = "没有安装该依赖";
        bool = false;
        return obj;
      }

      const temp = versionCompare(
        version.replace("^", ""),
        instellPackage.version.replace("^", "")
      );
      obj = {
        ...obj,
        installVersion: instellPackage.version
      };
      switch (temp) {
        // 0: 代表一样大
        case 0:
          obj.err = null;
          break;
        // 1: 代表版本号package.json里设置的值大于安装版本的， 说明安装的版本老了
        case 1:
          obj.err = "安装的版本较旧";
          bool = false;
          break;
        // 2: 代表版本号package.json里设置的值小于安装版本的， 说明安装的版本比配置的新
        case 2:
          if (!/^\^/.test(version)) {
            obj.err = null;
          } else {
            obj.err = "安装的版本过新";
            bool = false;
          }
          break;
      }
      return obj;
    })
    .filter(item => item.err);
  console.log(result);
  return bool;
};

module.exports = projectCheck;
