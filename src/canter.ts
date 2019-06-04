import {
  arrowFunctionExpression,
  Statement,
  newExpression,
  identifier,
  exportNamedDeclaration,
  variableDeclaration,
  variableDeclarator,
  importDeclaration,
  importSpecifier,
  stringLiteral,
  nullLiteral
} from "@babel/types";
import { partition } from "@topl/tack";
import { cascade } from "./cascade";

export function canter(
  body: Statement[],
  names: Set<string>,
  filename: string | null = null
): Statement[] {
  const [suites, statements] = partition(
    statement =>
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "CallExpression" &&
      statement.expression.callee.type === "Identifier" &&
      names.has(statement.expression.callee.name),
    body
  );

  return [
    importDeclaration(
      [importSpecifier(identifier("Suite"), identifier("Suite"))],
      stringLiteral("@topl/stable")
    ),
    ...statements,
    exportNamedDeclaration(
      variableDeclaration("const", [
        variableDeclarator(
          identifier("$suite$"),
          arrowFunctionExpression(
            [identifier("options")],
            cascade(
              newExpression(identifier("Suite"), [
                filename == null ? nullLiteral() : stringLiteral(filename),
                identifier("options")
              ]),
              suites,
              names
            )
          )
        )
      ]),
      []
    )
  ];
}
