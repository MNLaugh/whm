const Webhook = module.exports
const Table = require('cli-table')
const color = require('cli-color')
const fs = require('fs')
const path = require('path')
const webhook = require('webhook-discord')
const axios = require('axios')
const file = path.join(process.env.HOME, '/hooks.json')

if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]))

let hooks = require(file)

const blue = color.blueBright.bold
const green = color.greenBright.bold
const red = color.redBright.bold

Webhook.add = async (name, url, opts) => {
  if (!name) throw red(new Error('Webhook name is required, see list with `webhook list`').message)
  if (!url) throw red(new Error('Webhook url is required').message)
  if (has(name)) throw red(new Error('This webhook name already used').message)

  if (!opts.discord && !opts.macrodroid) throw red(new Error('Webhook type is required add option `-d or --discord` for set Discord webhook type or `-m or --macrodroid` for set Macrodroid webhook type').message)

  if (!hooks) hooks = []
  hooks.push({
    id: hooks.length,
    name: name,
    url: url,
    type: (opts.discord) ? 'discord' : 'macrodroid'
  })
  return await new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(hooks), err => {
      if (err) return reject(err)
      return resolve(green('Webhook added with success'))
    })
  })
}

Webhook.del = async (name) => {
  if (!name) throw red(new Error('Webhook name is required, see list with `webhook list`').message)
  const newHooks = []
  hooks.forEach((hook, index) => {
    if (hook.name !== name) newHooks.push(hooks[index])
  })
  return await new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(newHooks), err => {
      if (err) return reject(err)
      return resolve(green('Webhook added with success'))
    })
  })
}

Webhook.exec = async (name, message, opts) => {
  if (!name) throw red(new Error('webhook name is required, see list with `webhook list`').message)
  if (opts.who) {
    if (message.search('{{who}}') !== -1) message = message.replace('{{who}}', opts.who)
    else message = `${message} ${opts.who}`
  }
  if (opts.date) {
    const d = new Date()
    if (message.search('{{date}}') !== -1) message = message.replace('{{date}}', d.toString())
    else message = `${message} \n ${d.toString()}`
  }

  const hook = find(name)
  if (!hook) throw red(new Error(`Webhook ${name} not found`).message)
  if (hook.type === 'discord') return await discord(hook, message)
  else return await macrodroid(hook, message).catch(error => { throw error.message })
}

Webhook.list = async () => {
  if (!hooks || hooks.length < 1) return blue('No hooks found.')
  const table = new Table({
    head: [
      blue('id'),
      blue('name'),
      blue('url'),
      blue('type')
    ],
    colWidths: [7, 20, 30, 10]
  })

  for (var a = 0; a < hooks.length; a++) {
    var hook = hooks[a]
    table.push([green(hook.id), green(hook.name), green(hook.url.substring(0, 25) + '...'), green(hook.type)])
  }

  return table.toString()
}

Webhook.info = async name => {
  if (!has(name)) throw red(new Error(`Webhook ${name} not found`).message)
  const hook = find(name)
  return `${green('Name:')} ${hook.name}\n${green('Url:')} ${hook.url}\n${green('Type:')} ${hook.type}`
}

function find (name) {
  return hooks.find(hook => hook.name === name)
}

function has (name) {
  const found = find(name)
  if (!found || found.length === 0) return false
  else return true
}

async function discord (hook, message) {
  const Hook = new webhook.Webhook(hook.url)
  const msg = new webhook.MessageBuilder()
    .setName(hook.name)
    .setText(message)
  return await Hook.send(msg).catch(error => { throw error })
}

async function macrodroid (hook, message) {
  message = message.replace(' ', '%20')
  const response = await axios.get(`${hook.url}?message=${message}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' } }).catch(error => { throw error })
  return response.data
}
