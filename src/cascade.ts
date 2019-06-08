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
  ArrayExpression,
  expressionStatement
} from "@babel/types";
import { deferred } from "./names";
import { tagLoc } from "./tag";

type Table = ArrayExpression;

type Thunk = FunctionExpression | ArrowFunctionExpression;

export function cascade(
  object: Expression,
  statements: Statement[] = [],
  names: Set<string>,
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
        tagLoc(operator(memo, expression, names), expression.loc),
      object
    );
}

export function operator(
  object: Expression,
  expression: CallExpression,
  names: Set<string>,
): CallExpression {
  const id = expression.callee as Identifier;

  return callExpression(
    memberExpression(object, id),
    parameters(
      id,
      expression.arguments as [Expression, Table | Thunk, Thunk?],
      names,
    )
  );
}

export function parameters(
  id: Identifier,
  args: [Expression, Table | Thunk, Thunk?],
  names: Set<string>,
): [Expression, (Table | Thunk)?, Thunk?] {
  if (deferred.has(id.name)) {
    return args;
  }

  let [description, table, thunk] = args;

  if (table && table.type !== "ArrayExpression") {
    [thunk, table] = [table as Thunk, thunk];
  }

  return [
    description,
    table,
    thunk &&
      ("BlockStatement" !== thunk.body.type || thunk.body.body.length > 0) &&
      closureCapture(thunk, names)
  ].filter(Boolean) as [Expression, (Table | Thunk)?, Thunk?];
}

export function closureCapture(
  thunk: Thunk,
  names: Set<string>,
): ArrowFunctionExpression {
  return arrowFunctionExpression(
    [identifier("$suite$")],
    cascade(
      identifier("$suite$"),
      thunk.body.type === "BlockStatement"
        ? thunk.body.body
        : [expressionStatement(thunk.body)],
      names,
    )
  );
}
