import { addClassNamesToElement } from "@lexical/utils";
import {
    $applyNodeReplacement,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from "lexical";

export type SerializedNoteNode = Spread<
    {
        type: "note";
        version: 1;
    },
    SerializedElementNode
>;

export class NoteNode extends ElementNode {
    static getType(): string {
        return "note";
    }

    static clone(node: NoteNode): NoteNode {
        return new NoteNode(node.__key);
    }

    constructor(key?: NodeKey) {
        super(key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "note-block";
        return dom;
    }

    updateDOM(prevNode: NoteNode, dom: HTMLElement, config: EditorConfig): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedNoteNode): NoteNode {
        const node = $createNoteNode();
        return node;
    }

    exportJSON(): SerializedNoteNode {
        return {
            ...super.exportJSON(),
            type: "note",
            version: 1,
        };
    }

    isShadowRoot(): boolean {
        return true;
    }
}

export function $createNoteNode(): NoteNode {
    return $applyNodeReplacement(new NoteNode());
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
    return node instanceof NoteNode;
}
