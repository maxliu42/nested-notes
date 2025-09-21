import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { setDepthsForLines, getLineDepth, setLineDepthEffect } from "./depthField";
import { insertNewline } from "@codemirror/commands";

function getSelectedLineNumbers(view: EditorView): number[] {
    const { state } = view;
    const lineNumbers = new Set<number>();
    for (const range of state.selection.ranges) {
        const fromLine = state.doc.lineAt(range.from).number;
        const toLine = state.doc.lineAt(range.to).number;
        for (let ln = fromLine; ln <= toLine; ln++) lineNumbers.add(ln);
    }
    if (lineNumbers.size === 0) lineNumbers.add(state.doc.lineAt(state.selection.main.head).number);
    return Array.from(lineNumbers).sort((a, b) => a - b);
}

export function indentSelection(view: EditorView): boolean {
    const lines = getSelectedLineNumbers(view);
    const effects = setDepthsForLines(view.state, lines, (d) => d + 1);
    if (effects.length === 0) return true;
    view.dispatch({ effects });
    return true;
}

export function dedentSelection(view: EditorView): boolean {
    const lines = getSelectedLineNumbers(view);
    const effects = setDepthsForLines(view.state, lines, (d) => d - 1);
    if (effects.length === 0) return true;
    view.dispatch({ effects });
    return true;
}

// Enter semantics fix: when the caret is at column 0, create a new line
// above with the SAME depth as the original caret line (not the line above).
export function insertNewlineWithDepth(view: EditorView): boolean {
    const { state } = view;
    const sel = state.selection.main;
    if (!sel.empty) {
        return insertNewline(view); // default behavior on non-collapsed selections
    }
    const line = state.doc.lineAt(sel.head);
    const isAtLineStart = sel.head === line.from;
    if (!isAtLineStart) {
        return insertNewline(view); // default split behavior inside the line
    }

    const currentLineNumber = line.number;
    const currentDepth = getLineDepth(state, currentLineNumber);

    // Insert a newline at the caret position and then explicitly set
    // the depth of the INSERTED line (which becomes currentLineNumber)
    // to match the original caret line depth.
    view.dispatch({
        changes: { from: sel.head, to: sel.head, insert: "\n" },
        selection: EditorSelection.cursor(sel.head + 1),
        effects: setLineDepthEffect.of({ line: currentLineNumber, depth: currentDepth }),
    });
    return true;
}
