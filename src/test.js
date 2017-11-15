const fs = require('fs')
const peg = require('pegjs')
const { assert } = require('chai')
const compiler = require('./compiler')
const stripIndent = require('strip-indent')
const redent = require('redent')

let grammar
let parser

before(() => {
  console.clear()
  console.log('================= PRACTICAL =================')
})

beforeEach(() => {
  grammar = fs.readFileSync('./src/grammar.pegjs').toString()
  parser = peg.generate(grammar)
})

function assertParses(source, ...ast) {
  assert.deepEqual(parser.parse(source), ast)
}

function printAST (source) {
  console.log(
    JSON.stringify(parser.parse(source), true, 2)
  )
}

describe('practical parser', () => {
  it('parses nothing', () => {
    assertParses('')
  })

  describe('modules', () => {
    it('parses importing default', () => {
      assertParses(`import foo from "./pathname"`, {
        type: 'import',
        assignTo: {
          type: 'identifier',
          value: 'foo',
        },
        importFrom: {
          type: 'string',
          value: './pathname'
        },
      })
    })

    it('parses exports', () => {
    })
  })

  describe('object literal', () => {
    it('parses blank objects', () => {
      assertParses(`{}`, {
        type: 'object',
        entries: [],
      })
    })

    it('parses condensed object syntax', () => {
      assertParses(`{ foo }`, {
        type: 'object',
        entries: [{
          key: {
            type: 'identifier',
            value: 'foo',
          },
          value: {
            type: 'identifier',
            value: 'foo',
          },
        }]
      })
    })

    it('parses simple objects', () => {
      assertParses(`{ foo: "bar" }`, {
        type: 'object',
        entries: [{
          key: {
            type: 'identifier',
            value: 'foo',
          },
          value: {
            type: 'string',
            value: 'bar',
          },
        }],
      })
    })
  })

  describe('array literal', () => {
    it('parses blank arrays', () => {
      assertParses('[]', {
        type: 'array',
        items: [],
      })
    })

    it('parses arrays with items', () => {
      assertParses(`
        [1, "hello"]
      `, {
        type: 'array',
        items: [
          { type: 'integer', value: 1 },
          { type: 'string', value: 'hello' },
        ]
      })
    })

    it('parses arrays across lines', () => {
      assertParses(`
        [
          1,
          "hello",
        ]
      `, {
        type: 'array',
        items: [
          { type: 'integer', value: 1 },
          { type: 'string', value: 'hello' },
        ]
      })
    })
  })

  it('parses multiple expressions', () => {
    assertParses(`
      foo = 123
      bar = 456
      baz = bat
    `, {
      assignTo: {
        type: 'identifier',
        value: 'foo',
      },
      assignValue: {
        type: 'integer',
        value: 123,
      },
      type: 'assignment',
    },
    {
      assignTo: {
        type: 'identifier',
        value: 'bar',
      },
      assignValue: {
        type: 'integer',
        value: 456,
      },
      type: 'assignment',
    },
    {
      assignTo: {
        type: 'identifier',
        value: 'baz',
      },
      assignValue: {
        type: 'identifier',
        value: 'bat',
      },
      type: 'assignment',
    })
  })

  describe('operators', () => {
    describe('assignment', () => {
      it('parses assignment', () => {
        assertParses('foo = true', {
          type: 'assignment',
          assignTo: {
            type: 'identifier',
            value: 'foo',
          },
          assignValue: {
            type: 'boolean',
            value: true,
          },
        })
      })

      describe('destructured', () => {
        it('parses destructured array assignment', () => {
          assertParses('[foo, bar] = baz', {
            type: 'destructured_assignment',
            assignTo: {
              type: 'destructure',
              identifiers: [{
                type: 'identifier',
                value: 'foo',
              }, {
                type: 'identifier',
                value: 'bar',
              }]
            },
            assignValue: {
              type: 'identifier',
              value: 'baz',
            },
          })
        })

        it('parses destructured object assignment', () => {
          assertParses('{ foo, bar } = baz', {
            type: 'destructured_assignment',
            assignTo: {
              type: 'destructure',
              identifiers: [{
                type: 'identifier',
                value: 'foo',
              }, {
                type: 'identifier',
                value: 'bar',
              }]
            },
            assignValue: {
              type: 'identifier',
              value: 'baz',
            },
          })
        })
      })
    })
  })

  describe('identifier', () => {
    it('parses identifiers', () => {
      assertParses('foo', {
        type: 'identifier',
        value: 'foo',
      })
    })
  })

  describe('arrow function', () => {
    it('parses inline arrow functions', () => {
      assertParses('() => {}', {
        type: 'function',
        argList: [],
        body: [],
      })
    })

    it('parses single argument functions', () => {
      assertParses('(arg1) => {}', {
        type: 'function',
        argList: [{
          type: 'arg',
          expressions: [{
            type: 'identifier',
            value: 'arg1',
          }]
        }],
        body: []
      })
    })

    it('parses args', () => {
      assertParses('(arg1, arg2) => {}', {
        type: 'function',
        argList: [{
          type: 'arg',
          expressions: [{
            type: 'identifier',
            value: 'arg1',
          }]
        },{
          type: 'arg',
          expressions: [{
            type: 'identifier',
            value: 'arg2',
          }]
        }],
        body: []
      })
    })

    it('parses assignment in args list', () => {
      assertParses('(arg1 = 44, arg2=bar) => {}', {
        type: 'function',
        argList: [{
          type: 'arg',
          expressions: [{
            type: 'assignment',
            assignTo: {
              type: 'identifier',
              value: 'arg1',
            },
            assignValue: {
              type: 'integer',
              value: 44,
            },
          }]
        },{
          type: 'arg',
          expressions: [{
            type: 'assignment',
            assignTo: {
              type: 'identifier',
              value: 'arg2',
            },
            assignValue: {
              type: 'identifier',
              value: 'bar',
            },
          }]
        }],
        body: []
      })
    })
  })

  describe('values', () => {
    it('parses double quoted string literals', () => {
      assertParses('"string literal"', {
        type: 'string',
        value: 'string literal',
      })
    })

    it('parses integers', () => {
      assertParses('44', {
        type: 'integer',
        value: 44,
      })
    })

    it('parses floats', () => {
      assertParses('10.5', {
        type: 'float',
        value: 10.5,
      })
    })

    it('parses true', () => {
      assertParses('true', {
        type: 'boolean',
        value: true,
      })
    })

    it('parses false', () => {
      assertParses('false', {
        type: 'boolean',
        value: false,
      })
    })
  })

  describe('invocation', () => {
    it('invokes values', () => {
      assertParses('foo()', {
        type: 'invocation',
        argsList: [],
        invokedValue: [{
          type: 'identifier',
          value: 'foo',
        }],
      })
    })

    it('invokes with an argument', () => {
      assertParses('foo(3)', {
        type: 'invocation',
        argsList: [{
          type: 'integer',
          value: 3,
        }],
        invokedValue: [{
          type: 'identifier',
          value: 'foo',
        }],
      })
    })

    it('invokes with many arguments', () => {
      assertParses('foo(3, bar(), bazbat)', {
        type: 'invocation',
        argsList: [{
          type: 'integer',
          value: 3,
        },{
          type: 'invocation',
          argsList: [],
          invokedValue: [{
            type: 'identifier',
            value: 'bar'
          }]
        },{
          type: 'identifier',
          value: 'bazbat',
        }],
        invokedValue: [{
          type: 'identifier',
          value: 'foo',
        }],
      })
    })
  })
})

function chomp (string) {
  return string.replace(/^\n/, '').replace(/\n$/, '')
}


function assertCompiles (source, output) {
  source = chomp(source)
  compiled = compiler(stripIndent(source))
  const redented = redent(output, 2).replace(/ *$/, '')
  assert.equal(
    compiled,
    `(async function main () {${redented}}())`
  )
}

describe.only('compiler', () => {
  it('compiles nothing', () => {
    assertCompiles('', '\n')
  })

  it('compiles integers', () => {
    assertCompiles('123', `
      123
    `)
  })

  it('compiles function invocation', () => {
    assertCompiles(`
      foo = () => {}
      bar = foo()
    `, `
      const foo = async () => {}
      const bar = (await foo())
    `)
  })

  it('compiles assignment expressions', () => {
    assertCompiles('foo = true', `
      const foo = true
    `)
  })

  it('compiles integers in a function', () => {
    assertCompiles(`
      () => {
        333
        777
      }
    `, `
      async () => {
        333
        777
      }
    `)
  })

  it('compiles functions async', () => {
    assertCompiles(`
      () => {}
    `,`
      async () => {}
    `)
  })
})
