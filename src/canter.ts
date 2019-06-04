import {
  Statement,
  Expression,
  FunctionExpression,
  newExpression,
  identifier,
  memberExpression,
  callExpression,
  exportNamedDeclaration,
  variableDeclaration,
  variableDeclarator,
  importDeclaration,
  importSpecifier,
  stringLiteral
} from "@babel/types";
import { cascade } from "./cascade";

export function canter(body: Statement[], names: Set<string>): Statement[] {
  const { statements, suites } = body.reduce(
    (
      memo: { statements: Statement[]; suites: Expression[] },
      statement: Statement
    ) => {
      if (
        statement.type === "ExpressionStatement" &&
        statement.expression.type === "CallExpression" &&
        statement.expression.callee.type === "Identifier" &&
        names.has(statement.expression.callee.name)
      ) {
        const [description, thunk]: [Expression, FunctionExpression] = statement
          .expression.arguments as [Expression, FunctionExpression];

        memo.suites.push(
          cascade(
            newExpression(identifier("Suite"), [description]),
            thunk.body.body,
            names
          )
        );
      } else {
        memo.statements.push(statement);
      }
      return memo;
    },
    { statements: [], suites: [] }
  );

  return statements.concat(
    importDeclaration(
      [importSpecifier(identifier("Suite"), identifier("Suite"))],
      stringLiteral("@topl/stable")
    ),
    exportNamedDeclaration(
      variableDeclaration("const", [
        variableDeclarator(
          identifier("$suite$"),
          callExpression(
            memberExpression(identifier("Suite"), identifier("of")),
            suites
          )
        )
      ]),
      []
    )
  );
}
