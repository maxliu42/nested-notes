import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    KEY_TAB_COMMAND,
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
    $isRootNode,
    createCommand,
    LexicalCommand,
} from "lexical";
import { useEffect } from "react";
import { $createNoteNode, NoteNode, $isNoteNode } from "../nodes/NoteNode";

export const MOVE_UP_COMMAND: LexicalCommand<void> = createCommand();
export const MOVE_DOWN_COMMAND: LexicalCommand<void> = createCommand();

function handleMoveUp(): boolean {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
    }

    const paragraph = selection.anchor.getNode().getTopLevelElement();
    if (!(paragraph instanceof ParagraphNode)) {
        return false;
    }

    if (paragraph.getPreviousSibling() !== null) {
        return false;
    }

    const noteNode = paragraph.getParent();
    if (!$isNoteNode(noteNode)) {
        return false;
    }

    const newParagraph = $createParagraphNode();
    noteNode.insertBefore(newParagraph);
    newParagraph.select();

    return true;
}

function handleMoveDown(): boolean {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
    }

    const paragraph = selection.anchor.getNode().getTopLevelElement();
    if (!(paragraph instanceof ParagraphNode)) {
        return false;
    }

    if (paragraph.getNextSibling() !== null) {
        return false;
    }

    const noteNode = paragraph.getParent();
    if (!$isNoteNode(noteNode)) {
        return false;
    }

    const newParagraph = $createParagraphNode();
    noteNode.insertAfter(newParagraph);
    newParagraph.select();

    return true;
}

export function NotePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([NoteNode])) {
            throw new Error("NotePlugin: NoteNode not registered on editor");
        }

        const unregisterUp = editor.registerCommand(
            KEY_ARROW_UP_COMMAND,
            (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    event.preventDefault();
                    return handleMoveUp();
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        const unregisterDown = editor.registerCommand(
            KEY_ARROW_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    event.preventDefault();
                    return handleMoveDown();
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        const unregisterMoveUp = editor.registerCommand(MOVE_UP_COMMAND, () => handleMoveUp(), COMMAND_PRIORITY_LOW);

        const unregisterMoveDown = editor.registerCommand(
            MOVE_DOWN_COMMAND,
            () => handleMoveDown(),
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
            unregisterUp();
            unregisterDown();
            unregisterMoveUp();
            unregisterMoveDown();
            unregisterBackspace();
            unregisterEnter();
            unregisterTab();
        };
    }, [editor]);

    return null;
}
