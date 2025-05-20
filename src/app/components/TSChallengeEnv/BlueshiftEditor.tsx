"use client";

import React, { useRef } from "react";
import "./style.css";
import Editor, { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import classNames from "classnames";
import Icon from "../Icon/Icon";

interface BlueshiftTSEditorProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
  title?: string;
  className?: string;
  fileName?: string;
}

const processEnvTypes = `
declare namespace NodeJS {
  interface ProcessEnv {
    SECRET: string;
    RPC_ENDPOINT: string;
  }
}
declare var process: {
  env: NodeJS.ProcessEnv;
};
`;

export default function BlueshiftEditor({
  initialCode,
  onCodeChange,
  className,
  fileName
}: BlueshiftTSEditorProps) {
  const editorRefInternal = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({isolatedModules: true});
  }

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    if (editorRefInternal.current) return;

    editorRefInternal.current = editorInstance;
    editorInstance.onDidChangeModelContent(() => {
      onCodeChange(editorInstance.getValue());
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      processEnvTypes,
      "file:///node_modules/@types/node/index.d.ts"
    );

    const addMonacoTypesForModule = async (
      moduleName: string,
      dtsImportPromise: Promise<{ default: string }>,
      monacoTypesPath: string,
      monacoModulePath: string
    ) => {
      try {
        const dtsModule = await dtsImportPromise;
        const dtsContent = dtsModule.default;

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          dtsContent,
          monacoTypesPath
        );

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          `declare module '${moduleName}' { export * from '${monacoTypesPath}'; export { default } from '${monacoTypesPath}'; }`,
          monacoModulePath
        );
      } catch (error) {
        console.error(`Error adding ${moduleName} types:`, error);
      }
    };

    addMonacoTypesForModule(
      "@solana/web3.js",
      import("@solana/web3.js/lib/index.d.ts?raw"),
      "file:///node_modules/@types/@solana/web3.js/index.d.ts",
      "file:///node_modules/@solana/web3.js/index.d.ts"
    );

    addMonacoTypesForModule(
      "@solana/spl-token",
      import("./types/spl-token.d.ts?raw"),
      "file:///node_modules/@types/@solana/spl-token/index.d.ts",
      "file:///node_modules/@solana/spl-token/index.d.ts"
    );

    addMonacoTypesForModule(
      "bs58",
      import("./types/bs58.d.ts?raw"),
      "file:///node_modules/@types/bs58/index.d.ts",
      "file:///node_modules/bs58/index.d.ts"
    );

    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        {
          background: "1A1E26",
          token: "",
        },
        {
          foreground: "6272a4",
          token: "comment",
        },
        {
          foreground: "f1fa8c",
          token: "string",
        },
        {
          foreground: "bd93f9",
          token: "constant.numeric",
        },
        {
          foreground: "bd93f9",
          token: "constant.language",
        },
        {
          foreground: "bd93f9",
          token: "constant.character",
        },
        {
          foreground: "bd93f9",
          token: "constant.other",
        },
        {
          foreground: "ffb86c",
          token: "variable.other.readwrite.instance",
        },
        {
          foreground: "ff79c6",
          token: "constant.character.escaped",
        },
        {
          foreground: "ff79c6",
          token: "constant.character.escape",
        },
        {
          foreground: "ff79c6",
          token: "string source",
        },
        {
          foreground: "ff79c6",
          token: "string source.ruby",
        },
        {
          foreground: "ff79c6",
          token: "keyword",
        },
        {
          foreground: "ff79c6",
          token: "storage",
        },
        {
          foreground: "8be9fd",
          fontStyle: "italic",
          token: "storage.type",
        },
        {
          foreground: "50fa7b",
          fontStyle: "underline",
          token: "entity.name.class",
        },
        {
          foreground: "50fa7b",
          fontStyle: "italic underline",
          token: "entity.other.inherited-class",
        },
        {
          foreground: "50fa7b",
          token: "entity.name.function",
        },
        {
          foreground: "ffb86c",
          fontStyle: "italic",
          token: "variable.parameter",
        },
        {
          foreground: "ff79c6",
          token: "entity.name.tag",
        },
        {
          foreground: "50fa7b",
          token: "entity.other.attribute-name",
        },
        {
          foreground: "8be9fd",
          token: "support.function",
        },
        {
          foreground: "6be5fd",
          token: "support.constant",
        },
        {
          foreground: "66d9ef",
          fontStyle: " italic",
          token: "support.type",
        },
        {
          foreground: "66d9ef",
          fontStyle: " italic",
          token: "support.class",
        },
        {
          foreground: "f8f8f0",
          background: "ff79c6",
          token: "invalid",
        },
        {
          foreground: "f8f8f0",
          background: "bd93f9",
          token: "invalid.deprecated",
        },
        {
          foreground: "cfcfc2",
          token: "meta.structure.dictionary.json string.quoted.double.json",
        },
        {
          foreground: "6272a4",
          token: "meta.diff",
        },
        {
          foreground: "6272a4",
          token: "meta.diff.header",
        },
        {
          foreground: "ff79c6",
          token: "markup.deleted",
        },
        {
          foreground: "50fa7b",
          token: "markup.inserted",
        },
        {
          foreground: "e6db74",
          token: "markup.changed",
        },
        {
          foreground: "bd93f9",
          token: "constant.numeric.line-number.find-in-files - match",
        },
        {
          foreground: "e6db74",
          token: "entity.name.filename",
        },
        {
          foreground: "f83333",
          token: "message.error",
        },
        {
          foreground: "eeeeee",
          token:
            "punctuation.definition.string.begin.json - meta.structure.dictionary.value.json",
        },
        {
          foreground: "eeeeee",
          token:
            "punctuation.definition.string.end.json - meta.structure.dictionary.value.json",
        },
        {
          foreground: "8be9fd",
          token: "meta.structure.dictionary.json string.quoted.double.json",
        },
        {
          foreground: "f1fa8c",
          token:
            "meta.structure.dictionary.value.json string.quoted.double.json",
        },
        {
          foreground: "50fa7b",
          token:
            "meta meta meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ffb86c",
          token:
            "meta meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ff79c6",
          token: "meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "bd93f9",
          token: "meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "50fa7b",
          token: "meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ffb86c",
          token: "meta meta.structure.dictionary.value string",
        },
      ],
      colors: {
        "editor.background": "#1A1E2680",
        "editor.foreground": "#f8f8f2",
        "editor.selectionBackground": "#585E6C",
        "editor.lineHighlightBackground": "#1A1E26",
        "editorCursor.foreground": "#f8f8f0",
        "editorWhitespace.foreground": "#3B3A32",
        "editorIndentGuide.activeBackground": "#9D550FB0",
        "editor.selectionHighlightBorder": "#222218",
      },
    });

    monaco.editor.setTheme("dracula");

    console.log(editorInstance.getValue())
    console.log(fileName)
  };

  return (
    <div className={classNames("w-full h-full relative", className)}>
      <button className="absolute group/refresh bottom-4 z-10 right-8 font-medium flex items-center gap-x-2 text-sm text-tertiary cursor-pointer">
        <Icon
          name="Refresh"
          size={12}
          className="group-hover/refresh:rotate-360 transition-transform"
        />
        <span>Refresh</span>
      </button>
      <Editor
        height="100%"
        width="100%"
        className="bg-transparent min-h-[400px]"
        language="typescript"
        value={initialCode}
        options={{
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          stickyScroll: {
            enabled: false,
          },
          wordWrap: "on", // Optional: for better readability of long lines
          renderLineHighlight: "all", // Highlight the current line
        }}
        path={fileName ? `file:///${fileName}` : undefined}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
