import { EditorState } from "@codemirror/state";
import { EditorView, highlightActiveLine } from "@codemirror/view";
import { depthField } from "./depthField";
import { noteDecorations } from "./decorations";
import { editorKeymap } from "./keymap";
import { clipboardHandlers } from "./clipboard";

const appTheme = EditorView.theme({
    ".cm-editor": {
        fontSize: "16px",
        lineHeight: 1.6,
    },
    ".cm-editor.cm-focused": {
        outline: "none",
    },
    ".cm-scroller": {
        fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
});

export function createEditor(parent: HTMLElement): EditorView {
    const startState = EditorState.create({
        doc: "",
        extensions: [
            depthField,
            noteDecorations,
            highlightActiveLine(),
            editorKeymap(),
            clipboardHandlers(),
            EditorView.lineWrapping,
            EditorView.contentAttributes.of({
                spellcheck: "false",
                autocorrect: "off",
                autocapitalize: "off",
                autocomplete: "off",
            }),
            appTheme,
        ],
    });

    const view = new EditorView({ state: startState, parent });
    return view;
}
