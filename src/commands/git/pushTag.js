const { qa, getDate, result } = require("../../utils/utils");
const L = require('../../utils/log')

// git tag的注释
const askTagTitle = (title) => {
  const questions = [
    {
      name: "tagTitle",
      type: "input",
      message: "请输入tag标题:",
      default: title || "",
    },
  ];
  return qa(questions);
};

// git tag的注释
const askTagText = () => {
  const questions = [
    {
      name: "tagTest",
      type: "input",
      message: "请输入一句话来描述你的tag:",
    },
  ];
  return qa(questions);
};

const pushTag = async (title) => {
  const { tagTitle } = await askTagTitle(title);
  const { tagTest } = await askTagText(title);
  L.info("开始打tag...");
  const { err, stdout } = await result(
    `git tag -a ${tagTitle} -m "${tagTest}(${getDate()})" && git push origin ${tagTitle}`
  );
  if (!err) {
    L.success("打tag成功！");
  } else {
    L.error("打tag失败！", err);
  }
};

module.exports = pushTag;
