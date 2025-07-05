import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    COMMAND_PRIORITY_LOW,
    $getSelection,
    $isRangeSelection,
    ParagraphNode,
    $createParagraphNode,
    KEY_ENTER_COMMAND,
    $isNodeSelection,
    KEY_BACKSPACE_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ARROW_DOWN_COMMAND,
} from "lexical";
import { useEffect } from "react";
import { $isNoteNode } from "../nodes/NoteNode";
import { CREATE_PARAGRAPH_ABOVE_COMMAND, CREATE_PARAGRAPH_BELOW_COMMAND } from "./BlockCreationPlugin";

export function NoteBlockNavigationPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterArrowUp = editor.registerCommand(
            KEY_ARROW_UP_COMMAND,
            (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    event.preventDefault();
                    return editor.dispatchCommand(CREATE_PARAGRAPH_ABOVE_COMMAND, undefined);
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        const unregisterArrowDown = editor.registerCommand(
            KEY_ARROW_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    event.preventDefault();
                    return editor.dispatchCommand(CREATE_PARAGRAPH_BELOW_COMMAND, undefined);
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        const unregisterBackspace = editor.registerCommand(
            KEY_BACKSPACE_COMMAND,
            (event) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection) && selection.isCollapsed()) {
                    const node = selection.anchor.getNode();
                    const paragraph = node.getTopLevelElement();
                    if (paragraph instanceof ParagraphNode && paragraph.isEmpty()) {
                        const prevSibling = paragraph.getPreviousSibling();
                        if ($isNoteNode(prevSibling)) {
                            event.preventDefault();
                            paragraph.remove();
                            prevSibling.select();
                            return true;
                        }
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        const unregisterEnter = editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event) => {
                const selection = $getSelection();
                if ($isNodeSelection(selection)) {
                    const selectedNode = selection.getNodes()[0];
                    if ($isNoteNode(selectedNode)) {
                        event?.preventDefault();
                        const newParagraph = $createParagraphNode();
                        selectedNode.insertAfter(newParagraph);
                        newParagraph.select();
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        return () => {
            unregisterArrowUp();
            unregisterArrowDown();
            unregisterBackspace();
            unregisterEnter();
        };
    }, [editor]);

    return null;
}
