import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    KEY_TAB_COMMAND,
    COMMAND_PRIORITY_LOW,
    $getSelection,
    $isRangeSelection,
    ParagraphNode,
    $createParagraphNode,
} from "lexical";
import { useEffect } from "react";
import { $createNoteNode, NoteNode, $isNoteNode } from "../nodes/NoteNode";

export function TabNavigationPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([NoteNode])) {
            throw new Error("TabNavigationPlugin: NoteNode not registered on editor");
        }

        const unregisterTab = editor.registerCommand(
            KEY_TAB_COMMAND,
            (event) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                const node = selection.anchor.getNode();
                const paragraph = node.getTopLevelElement();

                if (event.shiftKey) {
                    // Handle Shift+Tab to outdent
                    const parentNote = paragraph?.getParent();
                    if (
                        parentNote instanceof NoteNode &&
                        paragraph instanceof ParagraphNode &&
                        paragraph.isEmpty() &&
                        paragraph.getPreviousSibling() === null
                    ) {
                        event.preventDefault();
                        const newParagraph = $createParagraphNode();
                        parentNote.replace(newParagraph);
                        newParagraph.select();
                        return true;
                    }
                } else {
                    // Handle Tab to indent
                    if (paragraph instanceof ParagraphNode && paragraph.isEmpty()) {
                        event.preventDefault();
                        const noteNode = $createNoteNode();
                        paragraph.replace(noteNode);
                        const newParagraph = $createParagraphNode();
                        noteNode.append(newParagraph);
                        newParagraph.select();
                        return true;
                    }
                }

                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        return () => {
            unregisterTab();
        };
    }, [editor]);

    return null;
}
