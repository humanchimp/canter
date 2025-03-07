import { expect } from "chai";
import babel from "@babel/core";
import generate from "@babel/generator";
import plugin from "../src/plugin";

it("eyeball fixture", () => {
  console.log(compile("describe('hi')"));
  console.log(compile("describe('hi', () => {})"));
  console.log(compile("describeEach('row', [1,1,2,3,5], () => {})"));
  console.log(compile("xdescribeEach('yo', [1,2,3])"));
  console.log(compile("describe('nest', () => it('should work'))"));
  console.log(compile(`describeEach(
    "larger arities",
    [
      function binary(a, b) {},
      function ternary(a, b, c) {},
      function quaternary(a, b, c, d) {},
      function veternary(h, o, r, s, e) {},
    ],
    testCase => {
      it("should throw an error about too many arugments", () => {
        expect(() => {
          wrapTestCase(testCase);
        }).to.throw(/too many arguments/);
      });
    },
  );`));
});

it("compiles the dsl into library calls", () => {
  expect(
    compile(`
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

describe("a messy endeavor", () => {
  it("is, cleaning a stable");
});

`)
  ).to.contain("export const $suite$ = options => new $hihoSuite$(null, options)");
});

it("can receive the filename as its optional second parameter", () => {
  expect(
    compile(
      `
describe("neat ideas", () => {
  it("should do stuff");
})
`,
      "file.js"
    )
  ).to.contain(
    `export const $suite$ = options => new $hihoSuite$("file.js", options)`
  );
});

it("tolerates shadowing", () => {
  expect(
    compile(`
{
  function describe() {}

  describe("this won't get transpiled; it's not the magical global", () => {
    it("neither will this");
  })
}`)
  ).not.to.contain("new $hihoSuite$");
});

function compile(input: string, filename?: string): string {
  const ast = babel.parse(input);
  const { visitor } = plugin(filename);

  babel.traverse(ast, visitor);

  return generate(ast).code;
}
