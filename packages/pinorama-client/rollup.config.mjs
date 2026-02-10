import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import { dts } from "rollup-plugin-dts"

const inputFile = "src/index.ts"
const outputFileName = "pinorama-client"

export default [
  // Declaration file
  {
    input: inputFile,
    output: [{ file: "dist/types/pinorama-client.d.ts", format: "es" }],
    plugins: [dts()]
  },

  // Browser ESM build
  {
    input: inputFile,
    output: [
      {
        file: `dist/browser/${outputFileName}.esm.js`,
        format: "es",
        sourcemap: true
      }
    ],
    plugins: [
      alias({
        entries: [
          { find: "./platform/node.js", replacement: "./platform/browser.js" }
        ]
      }),
      resolve({ browser: true }),
      commonjs(),
      typescript({ outDir: "dist/browser" }),
      terser()
    ],
    external: ["zod"]
  },

  // // Browser UMD build
  // {
  //   input: inputFile,
  //   output: [
  //     {
  //       file: `dist/browser/${outputFileName}.umd.js`,
  //       format: "umd",
  //       name: "pinorama-client",
  //     },
  //   ],
  //   plugins: [
  //     alias({
  //       entries: [
  //         { find: "./platform/node.js", replacement: "./platform/browser.js" },
  //       ],
  //     }),
  //     resolve({ browser: true }),
  //     commonjs(),
  //     typescript(),
  //   ],
  //   external: ["zod"],
  // },

  // // Browser CJS build
  // {
  //   input: inputFile,
  //   output: [
  //     {
  //       file: `dist/browser/${outputFileName}.cjs.js`,
  //       format: "cjs",
  //     },
  //   ],
  //   plugins: [
  //     alias({
  //       entries: [
  //         { find: "./platform/node.js", replacement: "./platform/browser.js" },
  //       ],
  //     }),
  //     resolve({ browser: true }),
  //     commonjs(),
  //     typescript(),
  //   ],
  //   external: ["zod"],
  // },

  // Node.js ESM bundle
  {
    input: inputFile,
    output: [
      {
        file: `dist/node/${outputFileName}.mjs`,
        format: "es",
        sourcemap: true
      }
    ],
    plugins: [resolve(), commonjs(), typescript({ outDir: "dist/node" })],
    external: ["zod"]
  },

  // Node.js CJS build
  {
    input: inputFile,
    output: [
      {
        file: `dist/node/${outputFileName}.cjs`,
        format: "cjs",
        sourcemap: true
      }
    ],
    plugins: [resolve(), commonjs(), typescript({ outDir: "dist/node" })],
    external: ["zod"]
  }
]
