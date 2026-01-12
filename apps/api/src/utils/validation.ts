import * as acorn from "acorn";
import jsx from "acorn-jsx";
import type { Node } from "estree";

const Parser = acorn.Parser.extend(jsx());

export interface ValidationResult {
  passed: boolean;
  report: string;
}

export function validateCode(code: string, fileName: string): ValidationResult {
  const issues: string[] = [];

  try {
    // Basic AST parsing to check for syntax errors and malicious patterns
    const ast = Parser.parse(code, {
      sourceType: "module",
      ecmaVersion: "latest",
      locations: true,
    }) as unknown as Node;

    // Simple recursive walker to find problematic nodes
    const walk = (node: Node) => {
      // 1. Check for eval()
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "eval"
      ) {
        issues.push(`[${fileName}:${String(node.loc?.start.line ?? "?")}] Use of eval() is prohibited.`);
      }

      // 2. Check for new Function()
      if (
        node.type === "NewExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "Function"
      ) {
        issues.push(`[${fileName}:${String(node.loc?.start.line ?? "?")}] Use of new Function() is prohibited.`);
      }

      // 3. Check for dangerouslySetInnerHTML (JSX attribute)
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
      const nodeAsAny = node as any;
      if (
        nodeAsAny.type === "JSXAttribute" &&
        nodeAsAny.name?.name === "dangerouslySetInnerHTML"
      ) {
        issues.push(`[${fileName}:${String(node.loc?.start.line ?? "?")}] Use of dangerouslySetInnerHTML is prohibited.`);
      }

      // 4. Audit Imports
      if (node.type === "ImportDeclaration") {
        const source = node.source.value;
        if (typeof source === "string" && (source.startsWith("/") || source.startsWith("http"))) {
          issues.push(`[${fileName}:${String(node.loc?.start.line ?? "?")}] Untrusted import source: ${source}`);
        }
      }

      // Walk children
      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === "object") {
          if (Array.isArray(child)) {
            child.forEach((c) => {
              if (c && typeof c.type === "string") walk(c as Node);
            });
          } else if (typeof child.type === "string") {
            walk(child as Node);
          }
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    };

    walk(ast);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      report: `Syntax Error in ${fileName}: ${message}`,
    };
  }

  if (issues.length > 0) {
    return {
      passed: false,
      report: issues.join("\n"),
    };
  }

  return {
    passed: true,
    report: "AST scan passed. No obvious security issues found.",
  };
}