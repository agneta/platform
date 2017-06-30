var chalk = require('chalk');

module.exports = {
  success: function(text){
    console.log(chalk.green('✓'), chalk.green(text));
  },
  info: function(text){
    console.log(chalk.blue('•'), chalk.blue(text));
  },
  warn: function(text){
    console.log(chalk.yellow('!'), chalk.yellow(text));
  }
};
