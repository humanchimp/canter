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
  filename: string | null = null,
  frameworkId: string = "@topl/hiho",
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
      [importSpecifier(identifier("$hihoSuite$"), identifier("Suite"))],
      stringLiteral(frameworkId)
    ),
    ...statements,
    suites.length > 0 &&
      exportNamedDeclaration(
        variableDeclaration("const", [
          variableDeclarator(
            identifier("$suite$"),
            arrowFunctionExpression(
              [identifier("options")],
              cascade(
                newExpression(identifier("$hihoSuite$"), [
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
  ].filter(Boolean);
}
