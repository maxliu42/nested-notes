import { Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

// Hide markdown markers (* and **) on non-active lines. Keep them visible on the active line for editing.
export const hideMarkdownMarkers = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = this.build(view);
        }
        update(update: ViewUpdate): void {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = this.build(update.view);
            }
        }
        build(view: EditorView): DecorationSet {
            const builder: Range<Decoration>[] = [] as unknown as any;
            const activeLine = view.state.doc.lineAt(view.state.selection.main.head).number;

            const strong = /\*\*([^*\n]+)\*\*/g; // naive strong match within a single line
            const em = /\*([^*\n]+)\*/g; // naive emphasis match within a single line
            const strike = /~~([^~\n]+)~~/g; // strikethrough
            const underline = /\+\+([^+\n]+)\+\+/g; // underline via ++ ++

            for (const { from, to } of view.visibleRanges) {
                let line = view.state.doc.lineAt(from);
                while (true) {
                    // Always add style marks for strike/underline
                    {
                        const text = line.text;
                        // strikethrough marks
                        strike.lastIndex = 0;
                        for (let m: RegExpExecArray | null = strike.exec(text); m; m = strike.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            builder.push(
                                Decoration.mark({ attributes: { style: "text-decoration: line-through;" } }).range(
                                    start + 2,
                                    end - 2
                                )
                            );
                        }
                        // underline marks
                        underline.lastIndex = 0;
                        for (let m: RegExpExecArray | null = underline.exec(text); m; m = underline.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            builder.push(
                                Decoration.mark({ attributes: { style: "text-decoration: underline;" } }).range(
                                    start + 2,
                                    end - 2
                                )
                            );
                        }
                    }

                    if (line.number !== activeLine) {
                        const text = line.text;
                        // strong (**text**)
                        strong.lastIndex = 0;
                        for (let m: RegExpExecArray | null = strong.exec(text); m; m = strong.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            // hide first **
                            builder.push(Decoration.replace({}).range(start, start + 2));
                            // hide last **
                            builder.push(Decoration.replace({}).range(end - 2, end));
                        }
                        // emphasis (*text*)
                        em.lastIndex = 0;
                        for (let m: RegExpExecArray | null = em.exec(text); m; m = em.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            builder.push(Decoration.replace({}).range(start, start + 1));
                            builder.push(Decoration.replace({}).range(end - 1, end));
                        }
                        // hide strikethrough markers
                        strike.lastIndex = 0;
                        for (let m: RegExpExecArray | null = strike.exec(text); m; m = strike.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            builder.push(Decoration.replace({}).range(start, start + 2));
                            builder.push(Decoration.replace({}).range(end - 2, end));
                        }
                        // hide underline markers (++text++)
                        underline.lastIndex = 0;
                        for (let m: RegExpExecArray | null = underline.exec(text); m; m = underline.exec(text)) {
                            const start = line.from + (m.index as number);
                            const end = start + m[0].length;
                            builder.push(Decoration.replace({}).range(start, start + 2));
                            builder.push(Decoration.replace({}).range(end - 2, end));
                        }
                    }

                    if (line.to >= to) break;
                    line = view.state.doc.line(line.number + 1);
                }
            }

            return Decoration.set(builder, true);
        }
    },
    { decorations: (v) => v.decorations }
);
