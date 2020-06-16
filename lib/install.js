const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, '/hooks.json')

fs.writeFileSync(file, JSON.stringify([]))
fs.chmodSync(file, '666')
