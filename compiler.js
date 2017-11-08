const fs = require('fs')
const peg = require('pegjs')

function visit (ast, state = {}) {
  if (Array.isArray(ast)) {
    return ast.map(visit).join('')
  }
  else {

  }
}

module.exports = function (source) {
  const grammar = fs.readFileSync('./grammar.pegjs').toString()
  const parser = peg.generate(grammar)
  const ast = parser.parse(source)

  return (
`(async function main () {
  ${visit(ast)}
}())`
  )
}
