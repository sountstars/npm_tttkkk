const path = require("path");
const fs = require("fs");
const copy = require("copy");

const { qa } = require("../../utils/utils");
const L = require("../../utils/log");
const { pushTag } = require("../git/pushTag");
const tkSetting = require("../../setting.json");
const projectCheck = require("./projectCheck");

// 获取当前项目的webpack 和 webpackConfig
const getWebpack = () => {
  // node_modules中读取webpack
  L.info("正在从node_modules中读取webpack...");
  let webpack = null;
  try {
    webpack = require(path.resolve("./node_modules/webpack/lib/webpack.js"));
    const webpackPackage = require(path.resolve(
      "./node_modules/webpack/package.json"
    ));
    L.success(
      `读取webpack成功, 当前项目中是使用的webpack版本为${webpackPackage.version}`
    );
  } catch (error) {
    L.error(error);
  }
  if (!webpack) {
    L.error("webpack读取失败");
    return {
      err: "webpack读取失败"
    };
  }

  // 读取webpack配置文件
  let webpackConfig = null;
  L.info("正在读取webpack配置文件...");
  try {
    webpackConfig = require(path.resolve("./config/webpack/webpack.prod"));
    L.success("webpack配置文件读取成功, 路径为: ./config/webpack/webpack.prod");
  } catch (error) {
    L.error("webpack配置读取失败! ===>\n", error);
    L.error("如果当前是在4.4.2之前的项目，请直接使用项目里的npm run publish");
  }

  if (webpackConfig) {
    return { webpack, webpackConfig, err: null };
  }

  return {
    err:
      "没有读取到webpack配置文件，如果配置文件路径有变动，请重新为维护tky插件"
  };
};

const readyMap = {
  Y: "是的",
  N: "不确定"
};

// 询问版本号和发包环境
const askVersionAndEnv = () => {
  const questions = [
    {
      name: "version",
      type: "input",
      message: "请输入版本号:"
    },
    {
      type: "list",
      name: "env",
      message: "请选择打包环境：",
      choices: ["demo", "global和testing"]
    }
  ];
  return qa(questions);
};

// 询问当前提交代码是否没有问题
const askReady = () => {
  const questions = [
    {
      type: "list",
      name: "Ready1",
      message: "JSSDK替换到最新的了吗?",
      choices: Object.values(readyMap)
    },
    {
      type: "list",
      name: "ready2",
      message: "该合并的分支都合并了吗?",
      choices: Object.values(readyMap)
    },
    {
      type: "list",
      name: "ready3",
      message: "当前分支正确吗?",
      choices: Object.values(readyMap)
    },
    {
      type: "list",
      name: "ready4",
      message: "公共静态文件有更新吗，有的话上传了吗?",
      choices: Object.values(readyMap)
    },
    {
      type: "list",
      name: "ready6",
      message: "现在开始打包?",
      choices: Object.values(readyMap)
    }
  ];
  const ready5 = {
    type: "list",
    name: "ready5",
    message: "请选择苹果",
    choices: ["香蕉", "苹果"]
  };
  questions.splice(Math.floor(Math.random() * 4) + 1, 0, ready5);
  return qa(questions);
};

// webpack打包
const webpackFn = (version, use) => {
  const { webpack = null, webpackConfig = null, err = null } = getWebpack();
  if (err) {
    return { webpackErr: err };
  }
  L.info("开始webpack打包...");
  return new Promise((res, rej) => {
    webpack(webpackConfig, (err, stats) => {
      if (!err) {
        L.success("webpack打包成功！");
      } else {
        L.error("webpack打包失败！", err);
      }
      res({ webpackErr: err, stats });
    });
  });
};

// 复制Source文件
const copySourceMap = version => {
  L.info("开始复制sourceMap文件...");
  const toPath = tkSetting.cource_map.baseLocal;
  return new Promise((r, j) => {
    copy(
      path.resolve("./dist/**/*.map"),
      `${toPath}${version}_map`,
      (err, files) => {
        if (!err) {
          L.success("sourceMap文件复制成功!");
        } else {
          L.error("sourceMap文件复制失败!", err);
        }
        r({ copySourceMapErr: err, files });
      }
    );
  });
};

// 改包名字
const rename = version => {
  L.info("开始修改包名...");
  return new Promise((r, j) => {
    fs.rename(path.resolve("./dist/"), path.resolve(`./${version}/`), err => {
      if (!err) {
        L.success("sourceMap文件复制成功!");
      } else {
        L.error("sourceMap文件复制失败!", err);
      }
      r({ renameErr: err });
    });
  });
};

/**
 * 0. 项目校验
 * 1. 询问版本号 发布环境
 * 2. 询问用途测试还是上线
 * 3. 如果是上线 问准备好了吗(sdk、分支、代码最新、静态资源更改已将上传)
 * 4. 准备好了,如果是上公网或者testing 就先打tag
 * 5. 开始webpack打包
 * 6. 复制source-map文件以备后续调试用
 * 7. 把打好包的名字改成版本号
 * 8. 本次修改的日志要不要
 */
const publish = async () => {
  if (projectCheck().some(v => v === false)) {
    L.error("处理报错信息后，再次进行打包");
    return;
  }

  const { version, env } = await askVersionAndEnv();
  let use = env === "global和testing" ? "上线" : "测试";

  L.info("正在注入全局变量...");
  const sourceMapServePath = `${tkSetting.cource_map.baseServer}/${version}_map`;
  global.buildParams = {
    version,
    env,
    sourceMapServePath
  };
  L.info("全局变量注入成功！", JSON.stringify(global.buildParams));

  if (env === "global和testing") {
    const { ready1, ready2, ready3, ready4, ready5, ready6 } = await askReady();
    L.info("ready5", ready5);
    if (ready5 !== "苹果") {
      L.error("别点那么块，看清楚在选，从新来吧～");
      return;
    }

    if ([ready1, ready2, ready3, ready4, ready6].includes(readyMap.N)) {
      L.error("咋回事，不上心嗷！小老弟～");
      return;
    }
    await pushTag(version);
  }

  const { webpackErr } = await webpackFn(version, use);
  if (webpackErr) {
    throw webpackErr;
  }

  const { copySourceMapErr } = await copySourceMap(version);
  if (copySourceMapErr) {
    throw copySourceMapErr;
  }

  const { renameErr } = await rename(version);
  if (renameErr) {
    throw renameErr;
  }
};

module.exports = { publish };
