import { Editor } from "./editor/Editor";
import "./editor.css";

function App() {
    return (
        <div className="app-container">
            <div className="editor-shell">
                <h1>Nested Notes</h1>
                <Editor />
            </div>
        </div>
    );
}

export default App;
