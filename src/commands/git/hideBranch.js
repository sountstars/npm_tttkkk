const inquirer = require("inquirer"); // 通用交互式命令行用户界面的集合
const L = require("../../utils/log");
const utlis = require('../../utils/utils');

const isStartMap = {
    yes: 'giao',
    no: '不giao'
}

// 询问
const askVersionAndUse = () => {
    const questions = [
    {
        name: "branch",
        type: "input",
        message: "请输入要隐藏的分支名字(多个请用##分隔):"
    },
    {
        type: "list",
        name: "isStart",
        message: "请确保当前所在分支不是待操作分支，是否开始?",
        choices: Object.values(isStartMap),
    }
    ];
    return inquirer.prompt(questions);
};


const hideBranch = async () => {
    const {branch, isStart} = await askVersionAndUse();
    if(isStart === isStartMap.no) {
        return;
    }
    if(!branch) {
        L.error('输入分支名字失败！')
        return
    }
    const branchArr = branch.split('##').filter(item => item)
    let execStr = ''
    branchArr.forEach(item => {
        execStr += `
        git checkout ${item}
        
        git pull origin ${item}
        
        git branch -m  ${item}    hide/${item}
        
        git push --delete origin ${item}
        
        git push origin hide/${item}
        
        git branch --set-upstream-to origin/hide/${item}
        \n\n\n
        `
      })
      const {err, stdout} = await utlis.result(execStr)
      if(err) {
          L.error('出错了！', err);
      }
      L.info('操作成功!')
}


module.exports = hideBranch