import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";

function isOpeningQuote(context: { before: string; after: string }): boolean {
    // Opening if start of line or preceded by whitespace/([{"'–—
    return /(^|[\s\(\[{\u2013\u2014])$/.test(context.before);
}

export function smartPunctuation() {
    let lastConversionPos: number | null = null;

    const input = EditorView.inputHandler.of((view, from, to, text) => {
        // Only handle simple text insertions (no newlines, one range)
        if (view.state.selection.ranges.length !== 1) return false;
        if (text.length === 0) return false;
        if (text.indexOf("\n") >= 0) return false;

        const sel = view.state.selection.main;
        const pos = sel.from;
        const line = view.state.doc.lineAt(pos);
        const beforeText = view.state.sliceDoc(line.from, pos);
        const afterText = view.state.sliceDoc(pos, line.to);

        // Build a preview of what would be inserted
        let replacement: string | null = null;

        // Dashes: --- -> em, -- -> en (handle upgrade from en to em)
        if (text === "-") {
            if (beforeText.endsWith("–")) {
                replacement = "—";
                const start = pos - 1;
                view.dispatch({
                    changes: { from: start, to: to, insert: replacement },
                    selection: EditorSelection.cursor(start + replacement.length),
                });
                lastConversionPos = start + replacement.length;
                return true;
            }
            if (beforeText.endsWith("--")) {
                replacement = "—";
                const start = pos - 2;
                view.dispatch({
                    changes: { from: start, to: to, insert: replacement },
                    selection: EditorSelection.cursor(start + replacement.length),
                });
                lastConversionPos = start + replacement.length;
                return true;
            }
            if (beforeText.endsWith("-")) {
                replacement = "–";
                const start = pos - 1;
                view.dispatch({
                    changes: { from: start, to: to, insert: replacement },
                    selection: EditorSelection.cursor(start + replacement.length),
                });
                lastConversionPos = start + replacement.length;
                return true;
            }
        }

        // Ellipsis: ... -> …
        if (text === "." && beforeText.endsWith("..")) {
            replacement = "…";
            const start = pos - 2;
            view.dispatch({
                changes: { from: start, to: to, insert: replacement },
                selection: EditorSelection.cursor(start + replacement.length),
            });
            lastConversionPos = start + replacement.length;
            return true;
        }

        // Curly quotes and apostrophes
        if (text === '"') {
            const opening = isOpeningQuote({ before: beforeText, after: afterText });
            replacement = opening ? "“" : "”";
            const start = from;
            view.dispatch({
                changes: { from: start, to: to, insert: replacement },
                selection: EditorSelection.cursor(start + replacement.length),
            });
            lastConversionPos = start + replacement.length;
            return true;
        }
        if (text === "'") {
            const opening = isOpeningQuote({ before: beforeText, after: afterText });
            replacement = opening ? "‘" : "’";
            const start = from;
            view.dispatch({
                changes: { from: start, to: to, insert: replacement },
                selection: EditorSelection.cursor(start + replacement.length),
            });
            lastConversionPos = start + replacement.length;
            return true;
        }

        // Not a conversion — cancel immediate-undo window
        lastConversionPos = null;
        return false;
    });

    const keydown = EditorView.domEventHandlers({
        keydown(event, view) {
            if (event.key !== "Backspace") {
                lastConversionPos = null;
                return false;
            }
            const sel = view.state.selection.main;
            if (!sel.empty) return false;
            const pos = sel.from;
            if (pos === 0) return false;
            if (lastConversionPos == null || pos !== lastConversionPos) return false;
            const prev = view.state.sliceDoc(pos - 1, pos);
            let replacement: string | null = null;
            let start = pos - 1;
            if (prev === "—") replacement = "---";
            else if (prev === "–") replacement = "--";
            else if (prev === "…") replacement = "...";
            else if (prev === "“" || prev === "”") replacement = '"';
            else if (prev === "‘" || prev === "’") replacement = "'";
            if (replacement == null) return false;
            view.dispatch({
                changes: { from: start, to: pos, insert: replacement },
                selection: EditorSelection.cursor(start + replacement.length),
            });
            event.preventDefault();
            lastConversionPos = null;
            return true;
        },
    });

    return [input, keydown];
}
