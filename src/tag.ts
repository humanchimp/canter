import generate from "@babel/generator";
import {
  CallExpression,
  callExpression,
  memberExpression,
  identifier,
  objectExpression,
  objectProperty,
  stringLiteral,
  Expression
} from "@babel/types";

export function tagCode(
  op: CallExpression,
  expression: Expression
): CallExpression {
  return callExpression(memberExpression(op, identifier("info")), [
    objectExpression([
      objectProperty(identifier("type"), stringLiteral("SourceCode")),
      objectProperty(identifier("code"), stringLiteral(generate(expression).code)),
    ])
  ]);
}
