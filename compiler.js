const parser = require('./parser')

function visit (ast, state = {}) {
  if (Array.isArray(ast)) {
    return ast.map(visit).join('')
  }
  else {

  }
}

module.exports = function (source) {
  const ast = parser.parse(source)

  return (
`(async function main () {
  ${visit(ast)}
}())`
  )
}
