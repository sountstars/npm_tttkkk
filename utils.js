const exec = require("child_process").exec;


// 格式化时间
const getDate = (date = new Date()) => {
  const Y = date.getFullYear();
  const M = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  const h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  const s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

const result = function (command) {
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

module.exports = {
  getDate,
  result,
};
