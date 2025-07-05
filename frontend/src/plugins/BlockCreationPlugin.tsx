import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    COMMAND_PRIORITY_LOW,
    $getSelection,
    $isRangeSelection,
    ParagraphNode,
    $createParagraphNode,
    createCommand,
    LexicalCommand,
} from "lexical";
import { useEffect } from "react";
import { $isNoteNode } from "../nodes/NoteNode";

export const CREATE_PARAGRAPH_ABOVE_COMMAND: LexicalCommand<void> = createCommand();
export const CREATE_PARAGRAPH_BELOW_COMMAND: LexicalCommand<void> = createCommand();

type ParagraphPosition = "above" | "below";

function handleCreateParagraph(position: ParagraphPosition): boolean {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
    }

    const paragraph = selection.anchor.getNode().getTopLevelElement();
    if (!(paragraph instanceof ParagraphNode)) {
        return false;
    }

    // Check if we're at the boundary (first/last sibling)
    const isAtBoundary =
        position === "above" ? paragraph.getPreviousSibling() === null : paragraph.getNextSibling() === null;

    if (!isAtBoundary) {
        return false;
    }

    const noteNode = paragraph.getParent();
    if (!$isNoteNode(noteNode)) {
        return false;
    }

    const newParagraph = $createParagraphNode();

    if (position === "above") {
        noteNode.insertBefore(newParagraph);
    } else {
        noteNode.insertAfter(newParagraph);
    }

    newParagraph.select();
    return true;
}

export function BlockCreationPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterCreateParaAbove = editor.registerCommand(
            CREATE_PARAGRAPH_ABOVE_COMMAND,
            () => handleCreateParagraph("above"),
            COMMAND_PRIORITY_LOW
        );

        const unregisterCreateParaBelow = editor.registerCommand(
            CREATE_PARAGRAPH_BELOW_COMMAND,
            () => handleCreateParagraph("below"),
            COMMAND_PRIORITY_LOW
        );

        return () => {
            unregisterCreateParaAbove();
            unregisterCreateParaBelow();
        };
    }, [editor]);

    return null;
}
