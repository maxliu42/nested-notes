import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { getDepths, INDENT_WIDTH_PX } from "./depthField";

// Pastel palette for indent guides (softer hues)
const GUIDE_COLORS = [
    "#fecaca", // red-200
    "#fed7aa", // orange-200
    "#fef08a", // yellow-200
    "#bbf7d0", // green-200
    "#a5f3fc", // cyan-200
    "#c7d2fe", // indigo-200
    "#e9d5ff", // purple-200
    "#fbcfe8", // pink-200
];

// depth 0 bar (page edge) uses first palette color (red pastel)
const BASE_BAR_COLOR = GUIDE_COLORS[0];

function styleForDepth(depth: number): string {
    // Visual grammar: bars define the active left boundary; text sits right next to the deepest bar.
    const bar = 2; // bar width in px
    const textPad = 2; // tiny space between deepest bar and text (px)
    const step = INDENT_WIDTH_PX; // distance between bar columns per depth

    // Always include the depth-0 bar at the very left edge
    const layers: string[] = [
        `linear-gradient(90deg, ${BASE_BAR_COLOR}, ${BASE_BAR_COLOR}) no-repeat 0 0 / ${bar}px 100%`,
    ];

    // Depth bars 1..depth
    for (let i = 1; i <= depth; i++) {
        const color = GUIDE_COLORS[(i - 1) % GUIDE_COLORS.length];
        const x = i * step;
        layers.push(`linear-gradient(90deg, ${color}, ${color}) no-repeat ${x}px 0 / ${bar}px 100%`);
    }

    // Deepest bar right edge is at depth * step + bar
    const padding = depth * step + bar + textPad;
    return `padding-left: ${padding}px; background: ${layers.join(", ")};`;
}

export const noteDecorations = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = this.build(view);
        }
        update(update: ViewUpdate): void {
            if (update.docChanged || update.selectionSet || update.viewportChanged || update.transactions.length > 0) {
                this.decorations = this.build(update.view);
            }
        }
        build(view: EditorView): DecorationSet {
            const depths = getDepths(view.state);
            const builder: Range<Decoration>[] = [];
            const totalLines = view.state.doc.lines;
            for (let ln = 1; ln <= totalLines; ln++) {
                const depth = depths[ln - 1] ?? 0;
                const style = styleForDepth(depth);
                const line = view.state.doc.line(ln);
                builder.push(Decoration.line({ attributes: { style } }).range(line.from));
            }
            return Decoration.set(builder, true);
        }
    },
    { decorations: (v) => v.decorations }
);
// small helper type import
import type { Range } from "@codemirror/state";
