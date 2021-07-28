const path = require("path");
const L = require("../../utils/log");
const fs = require("fs");

let txtContent = "";
let languageChineseBase = null;
const languageAry = [];
const languageAryName = [];
const textKind = {};

const language = () => {
  //获取文件夹下文件 chinese为对比基础文件
  const paths = async () => {
    const data = fs.readdirSync("./src/language/default");
    data.length > 0 &&
      data.map((v, i) => {
        if (
          path.resolve(`./src/language/default/${data[i]}`).indexOf(".js") > 0
        ) {
          if (data[i].indexOf("chinese") > 0) {
            languageChineseBase = require(path.resolve(
              `./src/language/default/${data[i]}`
            )).default;
          } else {
            languageAry.push(
              require(path.resolve(`./src/language/default/${data[i]}`)).default
            );
            languageAryName.push(data[i]);
          }
        }
      });
    //diff language
    const diffLanguage = (base, name = "", language = []) => {
      const all = Object.keys(base || {});
      for (let i = 0; i < all.length; i++) {
        const items = all[i];
        const names = `${name}${name && "."}${items}`;
        if (
          Object.prototype.toString.call(base[`${items}`]) === "[object Object]"
        ) {
          language.length > 0 &&
            language.map((v, index) => {
              if (!v[`${items}`] && items) {
                L.error(`${languageAryName[index]}文件${names}没有`);
                if (!textKind[index]) {
                  textKind[index] = [];
                }
                textKind[index].push(
                  `${languageAryName[index]}文件${names}没有\n`
                );
              }
            });
          diffLanguage(
            base[`${items}`],
            names,
            language.map(v => {
              return v[`${items}`] ? v[`${items}`] : {};
            })
          );
        } else {
          if (items) {
            language.length > 0 &&
              language.map((v, indexs) => {
                let keys = Object.keys(v);
                if (!(keys.length > 0 && keys.some(itemv => itemv === items))) {
                  L.error(
                    `${languageAryName[indexs]}文件${names}没有,对应中文值为"${
                      base[`${items}`]
                    }"`
                  );
                  if (!textKind[indexs]) {
                    textKind[indexs] = [];
                  }
                  textKind[indexs].push(
                    `${languageAryName[indexs]}文件${names}没有,对应中文值为"${
                      base[`${items}`]
                    }"\n`
                  );
                }
              });
          }
        }
      }
    };
    diffLanguage(languageChineseBase, "", languageAry);
    // collating kind the language
    const sort = () => {
      let str = "";
      let arr = Object.values(textKind);
      arr.length > 0 &&
        arr.map(v => {
          if (v.length > 0) {
            str = str + v.join("");
          }
        });
      txtContent = str;
      return str;
    };
    //cearte txt
    fs.writeFileSync(`${path.resolve(`./`)}/` + "diffLanguage.txt", sort());
    L.success(
      `diff language成功，txt文件生成,生成地址${path.resolve(
        `./`
      )}/diffLanguage.txt`
    );
  };
  paths();
  return txtContent === "";
};

module.exports = language;
