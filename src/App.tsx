import React from "react";
import { createEditor } from "./editor/view";
import { indentSelection, dedentSelection } from "./editor/commands";
import { exportToFile, importFromFile } from "./editor/fileio";

export function App(): JSX.Element {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const viewRef = React.useRef<import("@codemirror/view").EditorView | null>(null);

    React.useEffect(() => {
        if (containerRef.current && !viewRef.current) {
            viewRef.current = createEditor(containerRef.current);
        }
        return () => {
            viewRef.current?.destroy();
            viewRef.current = null;
        };
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <div className="max-w-4xl mx-auto p-4">
                <header className="flex items-center justify-between py-3">
                    <h1 className="font-semibold tracking-tight text-xl">Nested Notes</h1>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-2 py-1 text-sm rounded border"
                            onClick={() => viewRef.current && indentSelection(viewRef.current)}
                        >
                            Indent
                        </button>
                        <button
                            className="px-2 py-1 text-sm rounded border"
                            onClick={() => viewRef.current && dedentSelection(viewRef.current)}
                        >
                            Dedent
                        </button>
                        <div className="w-px h-5 bg-neutral-300" />
                        <button
                            className="px-2 py-1 text-sm rounded border"
                            onClick={() => viewRef.current && exportToFile(viewRef.current)}
                        >
                            Export
                        </button>
                        <button
                            className="px-2 py-1 text-sm rounded border"
                            onClick={() => viewRef.current && importFromFile(viewRef.current)}
                        >
                            Import
                        </button>
                    </div>
                </header>
                <main>
                    <div ref={containerRef} id="editor-root" className="rounded" />
                </main>
            </div>
        </div>
    );
}
