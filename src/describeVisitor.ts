import { NodePath } from "@babel/traverse";
import { CallExpression } from "@babel/types";

export default function describeVisitor() {
  return {
    CallExpression(path: NodePath<CallExpression>) {
      console.log(path);
    }
  };
}
