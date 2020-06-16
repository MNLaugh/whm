const commander = require('commander')
const webhook = require('./')

commander
  .storeOptionsAsProperties(false)

commander
  .command('list')
  .description('view webhooks list')
  .action(() => {
    webhook.list().then(console.log).catch(console.error)
  })

commander
  .command('add <name> <url>')
  .description('Add webhook url')
  .option('-d --discord', 'Of Discord webhook')
  .option('-m --macrodroid', 'Of Macrodroid webhook')
  .action((name, url, cmdr) => {
    webhook.add(name, url, cmdr.opts()).then(console.log).catch(console.error)
  })

commander
  .command('del <name> ')
  .description('Add webhook url')
  .action(name => {
    webhook.del(name).then(console.log).catch(console.error)
  })

commander
  .command('info <name>')
  .description('view webhooks list')
  .action(name => {
    webhook.info(name).then(console.log).catch(console.error)
  })

commander
  .command('exec <name> <message>')
  .description('Send data to webhook by name')
  .option('-d --date', 'if you want send date of message')
  .option('-w --who <string>', 'user sender message')
  .action((name, message, cmdr) => {
    webhook.exec(name, message, cmdr.opts()).then(console.log).catch(console.error)
  })

commander
  .version(require('../package.json').version)
  .usage('[command] <options>')

commander.parse(process.argv)
