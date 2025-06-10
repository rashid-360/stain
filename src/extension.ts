import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const stainDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(43, 255, 0, 0.7)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(43, 255, 0, 1)',
        overviewRulerLane: vscode.OverviewRulerLane.Full,
        color: 'black'
    });

    // Store stained lines per file URI
    let stainedLinesByFile = new Map<string, Set<number>>();

    function getStainedLines(editor: vscode.TextEditor): Set<number> {
        const uri = editor.document.uri.toString();
        let stainedLines = stainedLinesByFile.get(uri);
        if (!stainedLines) {
            stainedLines = new Set<number>();
            stainedLinesByFile.set(uri, stainedLines);
        }
        return stainedLines;
    }

    function updateContext(editor: vscode.TextEditor) {
        const lineNumber = editor.selection.active.line;
        const stainedLines = getStainedLines(editor);
        vscode.commands.executeCommand('setContext', 'isLineStained', stainedLines.has(lineNumber));
    }

    function applyStains(editor: vscode.TextEditor) {
        const stainedLines = getStainedLines(editor);
        const decorations: vscode.Range[] = [];
        
        // Validate line numbers against current document
        for (const line of stainedLines) {
            if (line >= 0 && line < editor.document.lineCount) {
                decorations.push(editor.document.lineAt(line).range);
            } else {
                // Remove invalid line numbers
                stainedLines.delete(line);
            }
        }
        
        editor.setDecorations(stainDecoration, decorations);
    }

    let stainCommand = vscode.commands.registerCommand('extension.stainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        const stainedLines = getStainedLines(editor);
        
        stainedLines.add(lineNumber);
        applyStains(editor);
        updateContext(editor);
    });

    let unstainCommand = vscode.commands.registerCommand('extension.unstainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        const stainedLines = getStainedLines(editor);
        
        stainedLines.delete(lineNumber);
        applyStains(editor);
        updateContext(editor);
    });

    let toggleStainCommand = vscode.commands.registerCommand('extension.toggleStain', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        const stainedLines = getStainedLines(editor);
        
        if (stainedLines.has(lineNumber)) {
            stainedLines.delete(lineNumber);
        } else {
            stainedLines.add(lineNumber);
        }
        
        applyStains(editor);
        updateContext(editor);
    });

    // Handle editor changes (switching between files)
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            applyStains(editor);
            updateContext(editor);
        }
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

    // Clean up stained lines when document is closed
    vscode.workspace.onDidCloseTextDocument(document => {
        const uri = document.uri.toString();
        stainedLinesByFile.delete(uri);
    });

    context.subscriptions.push(stainCommand, unstainCommand, toggleStainCommand);
}

export function deactivate() {}