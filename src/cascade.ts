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
  identifier,
  ArrayExpression
} from "@babel/types";
import { deferred } from "./names";

type Table = ArrayExpression;

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
    parameters(
      id,
      expression.arguments as [Expression, Table | Thunk, Thunk?],
      names
    )
  );
}

export function parameters(
  id: Identifier,
  args: [Expression, Table | Thunk, Thunk?],
  names: Set<string>
): [Expression, (Table | Thunk)?, Thunk?] {
  if (deferred.has(id.name)) {
    return args;
  }

  let [description, table, thunk] = args;

  if (thunk === undefined) {
    [thunk, table] = [table as Thunk, thunk];
  }

  return [
    description,
    table,
    thunk && closureCapture(thunk as FunctionExpression, names)
  ].filter(Boolean) as [Expression, (Table | Thunk)?, Thunk?];
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
