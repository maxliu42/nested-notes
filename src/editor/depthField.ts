import { StateEffect, StateField } from "@codemirror/state";
import { EditorState, Transaction } from "@codemirror/state";

export const setLineDepthEffect = StateEffect.define<{ line: number; depth: number }>();
export const setAllDepthsEffect = StateEffect.define<{ depths: number[] }>();

export const INDENT_WIDTH_PX = 24;

function clampDepth(depth: number): number {
    return depth < 0 ? 0 : depth | 0;
}

function remapDepths(oldDepths: number[], tr: Transaction): number[] {
    const oldDoc = tr.startState.doc;
    const newDoc = tr.state.doc;
    const newDepths: (number | undefined)[] = new Array(newDoc.lines);

    // Map each old line start position forward into the new doc and keep its depth.
    for (let lineNo = 1; lineNo <= oldDoc.lines; lineNo++) {
        const oldFrom = oldDoc.line(lineNo).from;
        const mappedPos = tr.changes.mapPos(oldFrom, 1);
        const newLineNo = newDoc.lineAt(mappedPos).number;
        if (newDepths[newLineNo - 1] === undefined) {
            newDepths[newLineNo - 1] = oldDepths[lineNo - 1];
        }
    }

    // Fill any new/inserted lines with the previous line's depth (or 0 at doc start).
    for (let i = 0; i < newDepths.length; i++) {
        if (newDepths[i] === undefined) {
            newDepths[i] = i > 0 ? (newDepths[i - 1] as number) : 0;
        }
    }

    return newDepths as number[];
}

export const depthField = StateField.define<number[]>({
    create(state: EditorState): number[] {
        const lines = state.doc.lines;
        return new Array(lines).fill(0);
    },
    update(value: number[], tr: Transaction): number[] {
        let next = value;

        if (tr.docChanged) {
            next = remapDepths(value, tr);
        } else {
            next = next.slice();
        }

        for (const e of tr.effects) {
            if (e.is(setAllDepthsEffect)) {
                next = e.value.depths.slice();
            } else if (e.is(setLineDepthEffect)) {
                const idx = e.value.line - 1;
                if (idx >= 0 && idx < next.length) {
                    next[idx] = clampDepth(e.value.depth);
                }
            }
        }

        return next;
    },
});

export function getLineDepth(state: EditorState, lineNumber: number): number {
    const depths = state.field(depthField);
    const idx = lineNumber - 1;
    if (idx < 0 || idx >= depths.length) return 0;
    return depths[idx];
}

export function getDepths(state: EditorState): number[] {
    return state.field(depthField);
}

export function setDepthsForLines(
    state: EditorState,
    lineNumbers: number[],
    compute: (prevDepth: number) => number
): StateEffect<{ line: number; depth: number }>[] {
    const depths = state.field(depthField);
    const effects: StateEffect<{ line: number; depth: number }>[] = [];
    for (const ln of lineNumbers) {
        const prev = depths[ln - 1] ?? 0;
        const next = clampDepth(compute(prev));
        if (next !== prev) {
            effects.push(setLineDepthEffect.of({ line: ln, depth: next }));
        }
    }
    return effects;
}
