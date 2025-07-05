import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import type { LexicalEditor, EditorState } from "lexical";
import { NoteNode } from "./nodes/NoteNode";
import "./editor.css";
import { MOVE_DOWN_COMMAND, MOVE_UP_COMMAND, NotePlugin } from "./plugins/NotePlugin";
import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const initialJsonState = JSON.stringify({
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "NOTE 1 - FUN DAY",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Wow this was a fun day! We went to the theme park. [blah blah blah] Roller coasters are so scary. In fact, I should write about this.",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
            {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "NOTE 1.1 - ROLLER COASTERS ARE SO SCARY",
                                type: "text",
                                version: 1,
                            },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                    },
                ],
                direction: null,
                format: "",
                indent: 0,
                type: "note",
                version: 1,
            },
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Anyway that was the day.",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
});

const theme = {
    note: "note-block",
};

function onError(error: Error) {
    console.error(error);
}

function Toolbar() {
    const [editor] = useLexicalComposerContext();

    const buttonStyle = {
        padding: "8px 12px",
        margin: "0 5px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        background: "#f0f0f0",
        cursor: "pointer",
    };

    return (
        <div style={{ marginBottom: "10px" }}>
            <button style={buttonStyle} onClick={() => editor.dispatchCommand(MOVE_UP_COMMAND, undefined)}>
                Shift Up
            </button>
            <button style={buttonStyle} onClick={() => editor.dispatchCommand(MOVE_DOWN_COMMAND, undefined)}>
                Shift Down
            </button>
        </div>
    );
}

function Editor() {
    const [editorState, setEditorState] = useState(initialJsonState);

    const initialConfig = {
        editorState: editorState,
        namespace: "MyEditor",
        theme,
        onError,
        nodes: [NoteNode],
    };

    const editorStyle = {
        border: "1px solid #ccc",
        minHeight: "200px",
        padding: "10px",
        borderRadius: "5px",
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div style={{ position: "relative" }}>
                <Toolbar />
                <RichTextPlugin
                    contentEditable={<ContentEditable style={editorStyle} />}
                    placeholder={
                        <div style={{ position: "absolute", top: "10px", left: "10px", color: "#aaa" }}>
                            Enter some text...
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <NotePlugin />
                <OnChangePlugin
                    onChange={(editorState: EditorState, editor: LexicalEditor) => {
                        setEditorState(JSON.stringify(editorState.toJSON()));
                    }}
                />
            </div>
        </LexicalComposer>
    );
}

function App() {
    const appStyle = {
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
    };

    const editorContainerStyle = {
        width: "800px",
    };

    return (
        <div style={appStyle}>
            <div style={editorContainerStyle}>
                <h1>Recursive Notes</h1>
                <Editor />
            </div>
        </div>
    );
}

export default App;
