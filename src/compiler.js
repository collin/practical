const parser = require('./parser')
const stripIndent = require('strip-indent')

function visit (ast, state = {}) {
  if (Array.isArray(ast)) {
    return ast.map((_ast) => visit(_ast, state))
  }
  else if (ast.type) {
    switch (ast.type) {
      case 'integer':
        return ast.value
      case 'boolean':
        return ast.value
      case 'identifier':
        return ast.value
      case 'assignment':
        return `const ${visit(ast.assignTo)} = ${visit(ast.assignValue)}`
      case 'invocation':
        return `(await ${visit(ast.invokedValue)}())`
      case 'function':
        let parts = []
        parts.push(`async (${visit(ast.argList, state)}) => {`)
        if (ast.body.length) {
          parts.push(visit(ast.body, state))
          parts.push('}')
        }
        else {
          parts[0] += '}'
        }
        return parts
      default:
        throw new Error(stripIndent(`
          Unknown AST node type \`${ast.type}\`
          ${JSON.stringify(ast, true, 2)}
        `))
    }
  }
}

function indent (expressions, indentation = '') {
  let out = []
  expressions.forEach(expression => {
    if (Array.isArray(expression)) {
      if (expression.length) {
        let nextIndent = Array.isArray(expression[0]) ? indentation : '  ' + indentation
        out.push( indent(expression, nextIndent) )
      }
    }
    else {
      out.push(indentation + expression)
    }
  })
  if (out.length) {
    return out.join('\n')
  }
  else {
    return ''
  }
}

module.exports = function (source) {
  const ast = parser.parse(source)
  return indent([
    '(async function main () {',
    visit(ast),
    '}())',
  ])
}
