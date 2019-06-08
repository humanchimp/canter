import {
  CallExpression,
  callExpression,
  SourceLocation,
  memberExpression,
  identifier,
  objectExpression,
  objectProperty,
  numericLiteral,
  ObjectExpression,
  stringLiteral,
  arrayExpression
} from "@babel/types";

export function infos({ loc }: { loc: SourceLocation }): ObjectExpression {
  return objectExpression([
    objectProperty(identifier("infos"), arrayExpression([
      objectExpression([
        objectProperty(identifier("type"), stringLiteral("SourceLocation")),
        objectProperty(identifier("start"), sourcePosition(loc.start)),
        objectProperty(identifier("end"), sourcePosition(loc.end))
      ])
    ]))
  ])
}

export function sourcePosition(position: {
  line: number;
  column: number;
}): ObjectExpression {
  return objectExpression([
    objectProperty(identifier("line"), numericLiteral(position.line)),
    objectProperty(identifier("column"), numericLiteral(position.column))
  ]);
}
