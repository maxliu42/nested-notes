import { NoteNode } from "../nodes/NoteNode";

export const initialJsonState = JSON.stringify({
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

export const editorTheme = {
    note: "note-block",
};

export function editorOnError(error: Error) {
    console.error(error);
}

export const editorConfig = {
    namespace: "NestedNotes",
    theme: editorTheme,
    onError: editorOnError,
    nodes: [NoteNode],
};
