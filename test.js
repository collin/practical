const fs = require('fs')
const peg = require('pegjs')
const { assert } = require('chai')
const { JSDOM } = require('jsdom')
const dollar = require('.')

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
})
