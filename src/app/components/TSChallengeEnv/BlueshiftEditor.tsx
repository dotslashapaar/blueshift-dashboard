"use client";

import React, { useEffect, useRef } from "react";
import "./style.css";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useMonaco } from "@/hooks/useMonaco";
import Icon from "../Icon/Icon";

interface BlueshiftTSEditorProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
  title: string;
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
  title,
}: BlueshiftTSEditorProps) {
  const editorRefInternal = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

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
        "editor.background": "#1A1E2650",
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
  }, [monaco, initialCode]);

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRefInternal.current = editorInstance;
    editorInstance.onDidChangeModelContent(() => {
      onCodeChange(editorInstance.getValue());
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full h-full flex flex-col rounded-t-xl lg:rounded-xl overflow-hidden max-h-[35dvh] lg:max-h-[65dvh] border border-border">
        <div className="z-10 w-full py-3 relative px-4 bg-background-card rounded-t-xl flex items-center border-b border-border">
          <div className="flex items-center gap-x-2">
            <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
            <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
            <div className="w-[12px] h-[12px] bg-background-card-foreground rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-secondary absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1.5">
            <Icon name="Challenge" size={12} className="hidden sm:block" />
            <span className="flex-shrink-0">{title}</span>
          </div>
        </div>
        <Editor
          height="100%"
          width="100%"
          className="bg-transparent"
          defaultLanguage="typescript"
          defaultValue={initialCode}
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
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
