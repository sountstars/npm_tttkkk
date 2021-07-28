const inquirer = require("inquirer"); // 通用交互式命令行用户界面的集合
const fs = require('fs');
const path = require('path');
const L = require("../../utils/log");
const utlis = require('../../utils/utils');

/**
// 获取两个分/tag之间的所有差异commit 但是只能显示哈希 和 mesage
git cherry -v   test123 test456

// 获取两个分支/tag之间的所有有差异的文件
git diff test123 test456 --stat

// 查看branch1分支有，而branch2中没有的log
git log branch1 ^branch2 --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cd) %C(bold blue)<%an>%Creset'
 */

// 对比方式映射
const diffTypeMap = {
    A: 'branch1比branch2中多的',
    B: 'branch2比branch1中多的',
    C: '小孩子才做选择题,我都要!'
}

// 询问
const askVersionAndUse = () => {
    const questions = [{
      type: "list",
      name: "diffType",
      message: "请选择是要两个分支/tag的差异方式?",
      choices: Object.values(diffTypeMap),
    },
    {
        name: "branch1",
        type: "input",
        message: "branch1/tag1:"
    },
    {
        name: "branch2",
        type: "input",
        message: "branch2/tag2:"
    },
    {
        type: "list",
        name: "isPushFile",
        message: "是否输出为文件?",
        choices: ["N", "Y"],
    }
    ];
    return inquirer.prompt(questions);
};

const runGit = async ({diffType, branch1, branch2}) => {
    let execMessage1 = '';
    let execMessage2 = '';
    let logsStr = '';
    switch(diffType) {
        case diffTypeMap.A:
            execMessage1 = `git log ${branch1} ^${branch2} --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cd) %C(bold blue)<%an>%Creset'`
            break;
        case diffTypeMap.B:
            execMessage2 = `git log ^${branch1} ${branch2} --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cd) %C(bold blue)<%an>%Creset'`
            break;
        case diffTypeMap.C:
            execMessage1 = `git log ${branch1} ^${branch2} --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cd) %C(bold blue)<%an>%Creset'`,
            execMessage2 = `git log ^${branch1} ${branch2} --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cd) %C(bold blue)<%an>%Creset'`
            break;
    }
    if(execMessage1) {
        const {err, stdout} = await utlis.result(execMessage1)
        if(err) {
            console.log('失败!', err)
        }
        logsStr += `\n## ${branch1}比${branch2}多的##: \n${stdout}\n`
    }
    if(execMessage2) {
        const {err, stdout} = await utlis.result(execMessage2)
        if(err) {
            console.log('失败!', err)
        }
        logsStr += `\n## ${branch2}比${branch1}多的##: \n${stdout}\n`
    }
    return logsStr;
}

// 输出文件
const pushFile = ({diffType, branch1, branch2, logs}) => {
    branch1 = branch1.split('/').pop()
    branch2 = branch2.split('/').pop()
    let fileName = ''
    switch(diffType) {
        case diffTypeMap.A:
            fileName = `${branch1}比${branch2}中多的.md`
            break;
        case diffTypeMap.B:
            fileName = `${branch2}比${branch1}中多的.md`
            break;
        case diffTypeMap.C:
            fileName = `${branch1}和${branch2}中差异.md`
            break;
    }
    return new Promise((resolve, reject) => {
        
        fs.writeFile(`${path.resolve()}/${fileName}`, logs, function(err) {
            if(err) {
                resolve({err});
            }
            resolve({err: null});
        });
    })
}


const diffBranch = async () => {
    const {diffType, branch1, branch2, isPushFile} = await askVersionAndUse();

    const logs = await runGit({diffType, branch1, branch2});
    if(!isPushFile) {
        L.info('\n')
        L.info(logs)
        return
    }
    const {err} = await pushFile({diffType, branch1, branch2, logs});
    if(err) console.error('生成文件失败了', err)
}

module.exports = diffBranch;
