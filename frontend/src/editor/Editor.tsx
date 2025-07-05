import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import type { LexicalEditor, EditorState } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";

import { editorConfig, initialJsonState } from "./editorConfig";
import { TabNavigationPlugin } from "../plugins/TabNavigationPlugin";
import {
    BlockCreationPlugin,
    CREATE_PARAGRAPH_ABOVE_COMMAND,
    CREATE_PARAGRAPH_BELOW_COMMAND,
} from "../plugins/BlockCreationPlugin";
import { NoteBlockNavigationPlugin } from "../plugins/NoteBlockNavigationPlugin";
import "../editor.css";

function Toolbar() {
    const [editor] = useLexicalComposerContext();

    return (
        <div className="editor-toolbar">
            <button onClick={() => editor.dispatchCommand(CREATE_PARAGRAPH_ABOVE_COMMAND, undefined)}>Shift Up</button>
            <button onClick={() => editor.dispatchCommand(CREATE_PARAGRAPH_BELOW_COMMAND, undefined)}>
                Shift Down
            </button>
        </div>
    );
}

export function Editor() {
    const [editorState, setEditorState] = useState(initialJsonState);

    const initialConfig = {
        ...editorConfig,
        editorState: editorState,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <Toolbar />
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-content" />}
                    placeholder={<div className="editor-placeholder">Start typing your notes...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <TabNavigationPlugin />
                <BlockCreationPlugin />
                <NoteBlockNavigationPlugin />
                <OnChangePlugin
                    onChange={(editorState: EditorState, editor: LexicalEditor) => {
                        setEditorState(JSON.stringify(editorState.toJSON()));
                    }}
                />
            </div>
        </LexicalComposer>
    );
}
