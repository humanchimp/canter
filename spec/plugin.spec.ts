import { expect } from "chai";
import babel from "@babel/core";
import generate from "@babel/generator";
import plugin from "../src/plugin";

describe("the template tag capability", () => {
  it("compiles the dsl into library calls", () => {
    console.log(compile(`
import { specimen } from "./yuck";

describe("inception", () => {
  it("yo dawg", () => {
    // not actually a spec
  });

  it("wow this is easy", () => {});

  xit("programming is awesome");

  describe("whoa", () => {
    beforeEach(() => {
      // lalalala
    })

    it("inside", () => {

    });

    it("this is a fantastic idea", () => {

    });
  });
});
`))
  });
});

function compile(input: string): string {
  const ast = babel.parse(input);
  const { visitor } = plugin();

  babel.traverse(ast, visitor);

  return generate(ast).code;
}
