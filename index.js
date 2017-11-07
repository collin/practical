const fs = require('fs')
const peg = require('pegjs')

const grammar = fs.readFileSync('./grammar.pegjs').toString()
const parser = peg.generate(grammar)

function visit (ast) {
  switch (ast.type) {

  }
}

module.exports = dollar
