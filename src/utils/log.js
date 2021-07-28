
const chalk = require('chalk');

const L = {
    info(...args) {
        return console.log(...args);
    },
    warn(...args) {
        return console.log(chalk.yellow(...args));
    },
    error(...args) {
        return console.log(chalk.red(...args));
    },
    success(...args) {
        return console.log(chalk.green(...args));
    },
}

module.exports = L