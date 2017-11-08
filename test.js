const fs = require('fs')
const peg = require('pegjs')
const { assert } = require('chai')
const compiler = require('./compiler')

let grammar
let parser

beforeEach(() => {
  grammar = fs.readFileSync('./grammar.pegjs').toString()
  parser = peg.generate(grammar)
})

function assertParses(selector, ...ast) {
  assert.deepEqual(parser.parse(selector), ast)
}

describe('practical parser', () => {
  it('parses nothing', () => {
    assertParses('')
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
})

function assertCompiles (source, output) {
  assert.equal(
    compiler(source),
`(async function main () {
  ${output}
}())`
  )
}

describe('compiler', () => {
  it('compiles nothing', () => {
    assertCompiles('', '')
  })
})
