import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const stainDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(43, 255, 0, 0.7)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(43, 255, 0, 1)',
        overviewRulerLane: vscode.OverviewRulerLane.Full,
        color: 'black'
    });

    let stainedLines = new Set<number>();

    function updateContext(editor: vscode.TextEditor) {
        const lineNumber = editor.selection.active.line;
        vscode.commands.executeCommand('setContext', 'isLineStained', stainedLines.has(lineNumber));
    }

    function applyStains(editor: vscode.TextEditor) {
        const decorations = [...stainedLines].map(line =>
            editor.document.lineAt(line).range
        );
        editor.setDecorations(stainDecoration, decorations);
    }

    let stainCommand = vscode.commands.registerCommand('extension.stainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        stainedLines.add(lineNumber);
        applyStains(editor);
        updateContext(editor);
    });

    let unstainCommand = vscode.commands.registerCommand('extension.unstainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        stainedLines.delete(lineNumber);
        applyStains(editor);
        updateContext(editor);
    });

    let toggleStainCommand = vscode.commands.registerCommand('extension.toggleStain', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;

        if (stainedLines.has(lineNumber)) {
            stainedLines.delete(lineNumber); // Unstain if already stained
        } else {
            stainedLines.add(lineNumber); // Stain if not stained
        }

        applyStains(editor);
        updateContext(editor);
    });

    vscode.window.onDidChangeTextEditorSelection(event => {
        updateContext(event.textEditor);
    });

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            applyStains(editor);
            updateContext(editor);
        }
    });

    context.subscriptions.push(stainCommand, unstainCommand, toggleStainCommand);
}

export function deactivate() {}
