import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";
// import { pluginZod } from "@kubb/plugin-zod";

const importPath = "@/shared/api/axios-client";

export default defineConfig(() => {
  return {
    root: ".",
    input: {
      path: "./src/shared/api/openapi.json",
    },
    output: {
      path: "./src/shared/api",
    },
    plugins: [
      pluginOas(),

      pluginTs({
        output: { path: "models" },
        enumType: "enum",
        dateType: "date",
        unknownType: "unknown",
        optionalType: "questionToken",
        group: { type: "tag", name: ({ group }) => group.toLowerCase() },
      }),

      pluginReactQuery({
        output: {
          path: "hooks",
        },
        group: {
          type: "tag",
          name: ({ group }) => group.toLowerCase(),
        },
        client: { importPath, dataReturnType: "data" },
        // parser: "zod",
        paramsType: "object",
        mutation: {
          methods: ["post", "put", "delete", "patch"],
        },
        suspense: false,
        query: {
          methods: ["get"],
          importPath: "@tanstack/react-query",
        },
      }),

      // pluginZod({
      //   output: { path: "zod" },
      //   group: { type: "tag", name: ({ group }) => group.toLowerCase() },
      //   dateType: "date",
      //   unknownType: "unknown",
      //   inferred: true,
      // }),
    ],
  };
});
