import {
  Expression,
  Statement,
  ExpressionStatement,
  CallExpression,
  callExpression,
  memberExpression,
  Identifier,
  FunctionExpression,
  ArrowFunctionExpression,
  arrowFunctionExpression,
  identifier
} from "@babel/types";
import { deferred } from "./names";

type Thunk = FunctionExpression | ArrowFunctionExpression;

export function cascade(
  object: Expression,
  statements: Statement[],
  names: Set<string>
) {
  return statements
    .filter(statement => statement.type === "ExpressionStatement")
    .map((statement: ExpressionStatement) => statement.expression)
    .filter(
      expression =>
        expression.type === "CallExpression" &&
        expression.callee.type === "Identifier" &&
        names.has(expression.callee.name)
    )
    .reduce(
      (memo: Expression | CallExpression, expression: CallExpression) =>
        operator(memo, expression, names),
      object
    );
}

export function operator(
  object: Expression,
  expression: CallExpression,
  names: Set<string>
): CallExpression {
  const id = expression.callee as Identifier;

  return callExpression(
    memberExpression(object, id),
    parameters(id, expression.arguments as [Expression, Thunk], names)
  );
}

export function parameters(
  id: Identifier,
  args: [Expression, Thunk],
  names: Set<string>
): [Expression, Thunk?] {
  if (deferred.has(id.name)) {
    return args;
  }
  const [description, thunk] = args;

  return thunk
    ? [description, closureCapture(thunk as FunctionExpression, names)]
    : [description];
}

export function closureCapture(
  thunk: FunctionExpression,
  names: Set<string>
): ArrowFunctionExpression {
  return arrowFunctionExpression(
    [identifier("$suite$")],
    cascade(identifier("$suite$"), thunk.body.body, names)
  );
}
