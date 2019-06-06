import { NodePath, Visitor } from "@babel/traverse";
import {
  Identifier,
  BlockStatement,
  VariableDeclaration,
  FunctionDeclaration,
  program,
  Program
} from "@babel/types";
import { stacking, deferred } from "./names";
import { canter } from "./canter";

const stableDsl = [...stacking, ...deferred];

export default function(filename: string = null, names: Set<string> = new Set(stableDsl)) {
  const junk = `_$canter$`;

  function mangleShadowedNameVisitor(name: string): Visitor {
    return {
      Identifier(path: NodePath<Identifier>) {
        if (path.node.name === name) {
          path.node.name = mangleName(name);
        }
      }
    };
  }

  function mangleName(name: string): string {
    return `${name}${junk}`;
  }

  let done: boolean = false;

  return {
    visitor: {
      Program(path: NodePath<Program>) {
        if (done === false) {
          path.replaceWith(program(canter(path.node.body, names, filename)));
          done = true;
        }
      },

      BlockStatement: {
        enter(path: NodePath<BlockStatement>) {
          const introducers = path.node.body.filter(
            node =>
              node.type === "VariableDeclaration" ||
              node.type === "FunctionDeclaration"
          ) as (VariableDeclaration | FunctionDeclaration)[];

          for (const introducer of introducers) {
            if (introducer.type === "VariableDeclaration") {
              for (const declaration of introducer.declarations) {
                if (
                  declaration.id.type === "Identifier" &&
                  names.has(declaration.id.name)
                ) {
                  path.traverse(mangleShadowedNameVisitor(declaration.id.name));
                }
              }
            }
            if (introducer.type === "FunctionDeclaration") {
              if (names.has(introducer.id.name)) {
                path.traverse(mangleShadowedNameVisitor(introducer.id.name));
              }
            }
          }
        }
      },

      Identifier: {
        exit(path: NodePath<Identifier>) {
          if (path.node.name.endsWith(junk)) {
            path.node.name = path.node.name.slice(
              0,
              path.node.name.length - junk.length
            );
          }
        }
      }
    }
  };
}
