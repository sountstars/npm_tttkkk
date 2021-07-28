const fs = require("fs");
const path = require("path");
const setting = require('../../setting.json')
const { qa } = require("../../utils/utils");


// 询问版本号和发包环境
const askReadyMapConfig = () => {
    const questions = [
      {
        name: "baseLocal",
        type: "input",
        message: "请输入sourcemap包存储路径:",
        default: setting.cource_map.baseLocal
      },
    ];
    return qa(questions);
  };

const setMapConfig = async () => {
    const {baseLocal} = await askReadyMapConfig()
    setting.cource_map.baseLocal = baseLocal;
    fs.writeFile(path.resolve(__dirname, '../setting.json'), JSON.stringify(setting), (err) => {
        if (err) {
            throw err;
        }
        console.log("修改成功！");
    });

}

module.exports = setMapConfig