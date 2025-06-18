// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TokenCounter } from './tokenCounter';
import { StatusBar } from './statusBar';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "llm-codebase-tokenizer" is now active!');

    // Initialize token counter and status bar
    const tokenCounter = new TokenCounter();
    const statusBar = new StatusBar(tokenCounter);

    // Register event listeners for active text editor changes and document edits
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                statusBar.updateTokenCount(editor.document);
            }
        }),
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                statusBar.updateTokenCount(event.document);
            }
        })
    );

    // Register command for manual refresh
    context.subscriptions.push(
        vscode.commands.registerCommand('llm-codebase-tokenizer.refreshTokenCount', async () => {
            await statusBar.refreshFullProjectCount();
        })
    );

    // Initial update if there's an active editor
    if (vscode.window.activeTextEditor) {
        statusBar.updateTokenCount(vscode.window.activeTextEditor.document);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "llm-codebase-tokenizer" is now deactivated.');
}
