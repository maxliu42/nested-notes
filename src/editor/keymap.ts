import { keymap } from "@codemirror/view";
import { defaultKeymap, history, redo, undo } from "@codemirror/commands";
import { indentSelection, dedentSelection, insertNewlineWithDepth, toggleBold, toggleItalic } from "./commands";

export function editorKeymap() {
    return [
        history({ newGroupDelay: 0 }),
        keymap.of([
            { key: "Tab", preventDefault: true, run: indentSelection },
            { key: "Shift-Tab", preventDefault: true, run: dedentSelection },
            // Enter should create a new line at same depth even at column 0
            { key: "Enter", run: insertNewlineWithDepth },
            { key: "Mod-b", preventDefault: true, run: toggleBold },
            { key: "Mod-i", preventDefault: true, run: toggleItalic },
            { key: "Mod-z", run: undo },
            { key: "Mod-Shift-z", run: redo },
            { key: "Mod-y", run: redo },
            ...defaultKeymap,
        ]),
    ];
}
