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
