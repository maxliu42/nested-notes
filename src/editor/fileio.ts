import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getDepths, setAllDepthsEffect } from "./depthField";

function serializeDoc(state: EditorState): string {
    const depths = getDepths(state);
    const lines: string[] = [];
    for (let ln = 1; ln <= state.doc.lines; ln++) {
        const d = depths[ln - 1] ?? 0;
        const text = state.doc.line(ln).text;
        lines.push(`${">".repeat(d)}${text.length ? " " : ""}${text}`);
    }
    return lines.join("\n");
}

function parseDoc(text: string): { doc: string; depths: number[] } {
    const depths: number[] = [];
    const outLines: string[] = [];
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
        const m = line.match(/^(>+)(?:\s*)(.*)$/);
        if (m) {
            depths.push(m[1].length);
            outLines.push(m[2] ?? "");
        } else {
            depths.push(0);
            outLines.push(line);
        }
    }
    return { doc: outLines.join("\n"), depths };
}

export async function exportToFile(view: EditorView): Promise<void> {
    const content = serializeDoc(view.state);
    const blob = new Blob([content], { type: "text/plain" });
    const fileName = "nested-notes.txt";
    const anyNav = window as any;
    if (anyNav.showSaveFilePicker) {
        const handle = await anyNav.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: "Text", accept: { "text/plain": [".txt"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
}

export async function importFromFile(view: EditorView): Promise<void> {
    const anyNav = window as any;
    let text: string | null = null;
    if (anyNav.showOpenFilePicker) {
        const [handle] = await anyNav.showOpenFilePicker({
            types: [{ description: "Text", accept: { "text/plain": [".txt"] } }],
        });
        const file = await handle.getFile();
        text = await file.text();
    } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".txt,text/plain";
        text = await new Promise<string | null>((resolve) => {
            input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return resolve(null);
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsText(file);
            };
            input.click();
        });
    }
    if (text == null) return;
    const parsed = parseDoc(text);
    const tr = view.state.update({ changes: { from: 0, to: view.state.doc.length, insert: parsed.doc } });
    const after = tr.state;
    const depths = parsed.depths;
    // Pad depths to document lines if mismatch
    const filled =
        depths.length === after.doc.lines ? depths : new Array(after.doc.lines).fill(0).map((_, i) => depths[i] ?? 0);
    const tr2 = after.update({ effects: setAllDepthsEffect.of({ depths: filled }) });
    view.dispatch(tr, tr2);
}
