import { EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getDepths, setAllDepthsEffect } from "./depthField";

function serializeSelection(state: EditorState, text: string): string {
    // This function relies on text already matching the selection from CM.
    // We only need to reformat for full-line selections; partial selections keep raw text.
    const { main } = state.selection;
    const fromLine = state.doc.lineAt(main.from).number;
    const toLine = state.doc.lineAt(main.to).number;
    const coversWholeLines = main.from === state.doc.line(fromLine).from && main.to === state.doc.line(toLine).to;
    if (!coversWholeLines) return text;
    const depths = getDepths(state);
    const lines: string[] = [];
    for (let ln = fromLine; ln <= toLine; ln++) {
        const d = depths[ln - 1] ?? 0;
        const content = state.doc.line(ln).text;
        lines.push(`${">".repeat(d)}${content.length ? " " : ""}${content}`);
    }
    return lines.join("\n");
}

export function clipboardHandlers() {
    return EditorView.domEventHandlers({
        copy(event, view) {
            const sel = view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to);
            const payload = serializeSelection(view.state, sel);
            event.clipboardData?.setData("text/plain", payload);
            event.preventDefault();
        },
        cut(event, view) {
            const sel = view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to);
            const payload = serializeSelection(view.state, sel);
            event.clipboardData?.setData("text/plain", payload);
            event.preventDefault();
            view.dispatch({
                changes: view.state.changeByRange((range) => ({ changes: { from: range.from, to: range.to } })),
            });
        },
        paste(event, view) {
            const text = event.clipboardData?.getData("text/plain");
            if (text == null) return false;
            const { state } = view;
            const baseDepth = getDepths(state)[state.doc.lineAt(state.selection.main.head).number - 1] ?? 0;
            const tr = state.update({
                changes: { from: state.selection.main.from, to: state.selection.main.to, insert: text },
            });
            const after = tr.state;
            const newDepths = getDepths(after).slice();
            // For each inserted region, set depths to baseDepth
            tr.changes.iterChanges((_fA, _tA, fromB, toB) => {
                const startLine = after.doc.lineAt(fromB).number;
                const endLine = after.doc.lineAt(toB).number;
                for (let ln = startLine; ln <= endLine; ln++) newDepths[ln - 1] = baseDepth;
            });
            const tr2 = after.update({ effects: setAllDepthsEffect.of({ depths: newDepths }) });
            view.dispatch(tr, tr2);
            event.preventDefault();
            return true;
        },
    });
}
