const fs = require('fs')
const peg = require('pegjs')

const grammar = fs.readFileSync('./src/grammar.pegjs').toString()
const parser = peg.generate(grammar)

module.exports = parser
