// app/builder/page.jsx
import Editor from '../../components/Canvas';
export default function CanvasPage() {
    // fetch user portfolios (call /api/portfolios)
    return (
        <div>
            Here we will build the drag and drop properties
            <h1 className="text-2xl font-semibold">Portfolio Builder</h1>
            <p className="text-sm text-slate-600">
                Drag, resize and edit shapes and text. This layout will be saved as JSON and used for your public portfolio page.
            </p>
            <Editor />
        </div>
    );
}
