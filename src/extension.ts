import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
   
	const stainDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(43, 255, 0, 0.7)', // Light red stain
		isWholeLine: true, // Extends stain to full line width
		overviewRulerColor: 'rgba(43, 255, 0, 1)', // Makes stain visible in minimap
		overviewRulerLane: vscode.OverviewRulerLane.Full, // Ensures visibility in minimap
		color:'black'
	});

    let stainedLines = new Set<number>(); // Track stained lines

    function updateContext(lineNumber: number) {
        vscode.commands.executeCommand('setContext', 'isLineStained', stainedLines.has(lineNumber));
    }

    let stainCommand = vscode.commands.registerCommand('extension.stainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        stainedLines.add(lineNumber); // Mark this line as stained
        applyStains(editor);
        updateContext(lineNumber);
    });

    let unstainCommand = vscode.commands.registerCommand('extension.unstainLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lineNumber = editor.selection.active.line;
        stainedLines.delete(lineNumber); // Remove stain from this line
        applyStains(editor);
        updateContext(lineNumber);
    });

	function applyStains(editor: vscode.TextEditor) {
		const decorations = [...stainedLines].map(line =>
			editor.document.lineAt(line).range // Covers the full line width
		);
		editor.setDecorations(stainDecoration, decorations);
	}
    vscode.window.onDidChangeTextEditorSelection(event => {
        const editor = event.textEditor;
        const lineNumber = editor.selection.active.line;
        updateContext(lineNumber);
    });

    context.subscriptions.push(stainCommand, unstainCommand);
}

export function deactivate() {}
