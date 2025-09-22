import React from "react";
import { createEditor } from "./editor/view";
import { indentSelection, dedentSelection } from "./editor/commands";
import { exportToFile, importFromFile } from "./editor/fileio";
import { serializeDoc, parseDoc } from "./editor/fileio";
import { saveShared, loadShared } from "./lib/share";
import { setAllDepthsEffect } from "./editor/depthField";

export function App(): JSX.Element {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const viewRef = React.useRef<import("@codemirror/view").EditorView | null>(null);

    React.useEffect(() => {
        if (containerRef.current && !viewRef.current) {
            viewRef.current = createEditor(containerRef.current);
        }
        // On load, if there's an id param, fetch content and load it
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) {
            loadShared(id)
                .then((content) => {
                    if (!content || !viewRef.current) return;
                    const parsed = parseDoc(content);
                    const numLines = parsed.doc.split(/\r?\n/).length;
                    const filledDepths = new Array(numLines).fill(0).map((_, i) => parsed.depths[i] ?? 0);
                    viewRef.current.dispatch({
                        changes: { from: 0, to: viewRef.current.state.doc.length, insert: parsed.doc },
                        effects: setAllDepthsEffect.of({ depths: filledDepths }),
                    });
                })
                .catch(() => void 0);
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
                        <button
                            className="px-2 py-1 text-sm rounded border"
                            onClick={async () => {
                                if (!viewRef.current) return;
                                const customId = prompt("Enter custom name (optional, letters/numbers only):");
                                const content = serializeDoc(viewRef.current.state);
                                try {
                                    const id = await saveShared(content, customId || undefined);
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("id", id);
                                    await navigator.clipboard.writeText(url.toString());
                                    alert("Share link copied to clipboard");
                                } catch (e: any) {
                                    if (e.message.includes("duplicate key value violates unique constraint")) {
                                        alert("That custom name is already taken. Please try another.");
                                    } else {
                                        alert("Failed to share");
                                    }
                                }
                            }}
                        >
                            Share
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
