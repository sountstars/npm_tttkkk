const { exec } = require("child_process");
const inquirer = require("inquirer"); // 通用交互式命令行用户界面的集合

const getDate = (date = new Date()) => {
  const Y = date.getFullYear();
  const M = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const D = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

const result = (command) => {
    return new Promise((resolve, reject) => {
      exec(command, function (err, stdout, stderr) {
        if (err != null) {
          resolve({err, stdout: null})
        } else if (typeof stderr != "string") {
          resolve({err: new Error(stderr)})
        } else {
          resolve({err: null, stdout});
        }
      });
    });
  };

const qa = (questions) => {
    return inquirer.prompt(questions);
}


/***
 * 版本号比较
 * @param version1 版本号a
 * @param version2 版本号b
 * @return -1: 代表不是合格版本号; 0: 代表一样大; 1: 代表版本号a大于版本号b; 2: 代表版本号b大于版本号a
 */
 const versionCompare = (version1, version2) => {
  const v1 = versionToNum(version1)
  const v2 = versionToNum(version2)
  if(v1 === v2) {
      return 0
  }
  if(v1 > v2) {
      return 1
  }
  if(v1 < v2) {
      return 2
  }
}

/***
* 将版本号转化成数字
* @param ${String} version 版本好 例子'5.13.232'
* @return ${Number}   例子返回 Number(005013232)
*/
const versionToNum = (version) => {
  version = String(version)
  let v = version.split('.');
  v = v.map(item => {
      item = item + ''
      if(item.length === 1) {
          item  = `00${item}`
      }
      if(item.length === 2) {
          item  = `0${item}`
      }
      return item
  })
  const num = Number(v.join(''))
  return num
}


module.exports = {
  getDate,
  result,
  qa,
  versionCompare,
  versionToNum
};
