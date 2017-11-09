start = expression*

expression =
  _
  expression:(
    import / export /
    invocation / value / operator / identifier
  )
  _
  { return expression }

import = "import" _ identifier:identifier _ "from" _ string:string
  {
    return {
      type: 'import',
      assignTo: identifier,
      importFrom: string,
    }
  }

export = import

operator = assignment

assignment = assignTo:identifier _ "=" _ assignValue:expression
  {
    return {
      type: 'assignment',
      assignTo,
      assignValue,
    }
  }

invocation =
  identifier:identifier
  "(" _ arg:expression* args:(_ "," _ an_arg:expression { return an_arg })* _ ")"
  {
    return {
      type: 'invocation',
      argsList: [...arg, ...args],
      invokedValue: [identifier],
    }
  }

value = object / function / number / string / boolean


object = "{" _ entry:entry* entries:( _ "," _ an_entry:entry { return an_entry })* _ ","* _ "}"
  {
    return {
      type: 'object',
      entries: [...entry, ...entries],
    }
  }

entry = key:identifier ":" _ value:expression
  {
    return { key, value }
  }

function = "(" _ argList:argList _ ")" _ "=>" _ "{" _ body:expression* _ "}"
  {
    return {
      type: 'function',
      argList: argList,
      body: body,
    }
  }

argList = arg:arg* args:(_ "," _ an_arg:arg { return an_arg })*
  {
    if (arg) {
      return [...arg, ...args]
    }
    else {
      return []
    }
  }

arg = expressions:( assignment / identifier )
  {
    return {
      type: 'arg',
      expressions: [expressions]
    }
  }

boolean = true / false

true = "true"
  {
    return {
      type: 'boolean',
      value: true,
    }
  }

false = "false"
  {
    return {
      type: 'boolean',
      value: false,
    }
  }

number = float / integer

integer = [0-9]+
  {
    return {
      type: 'integer',
      value: parseInt(text(), 10)
    }
  }

float = [0-9]+ "." [0-9]+
  {
    return {
      type: 'float',
      value: parseFloat(text(), 10)
    }
  }

string = '"' chars:string_character+ '"'
  {
    return {
      type: 'string',
      value: chars.join(''),
    }
  }

string_character = !('"') source_character
    { return text() }


source_character = .

identifier = lead:[a-zA-Z] chars:[a-zA-Z\-_0-9]+
  {
    return {
      type: 'identifier',
      value: lead + chars.join('')
    }
  }

_  = [ \t\r\n]*

spaces = [ \t\r\n]+
