start = expression*

expression = value / operator / identifier

operator = assignment

assignment = assignTo:identifier _ "=" _ assignValue:expression
  {
    return {
      type: 'assignment',
      assignTo,
      assignValue,
    }
  }

value = number / string / boolean

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
