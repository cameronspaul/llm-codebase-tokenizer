import * as vscode from 'vscode';
import { TokenCounter } from './tokenCounter';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private tokenCounter: TokenCounter;
    private isCalculating: boolean = false;
    private currentDocumentCount: number = 0;
    private projectCount: number = 0;

    constructor(tokenCounter: TokenCounter) {
        this.tokenCounter = tokenCounter;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'llm-codebase-tokenizer.refreshTokenCount';
        this.statusBarItem.tooltip = new vscode.MarkdownString('Click to calculate full project token count\n\n- **Current File**: 0 tokens\n- **Full Project**: Not calculated');
        this.statusBarItem.text = 'Tokens: 0';
        this.statusBarItem.show();
    }

    public updateTokenCount(document: vscode.TextDocument): void {
        if (this.isCalculating) {
            return;
        }
        this.currentDocumentCount = this.tokenCounter.getDocumentTokenCount(document);
        this.updateStatusBar();
    }

    public async refreshFullProjectCount(): Promise<void> {
        if (this.isCalculating) {
            return;
        }
        this.isCalculating = true;
        this.statusBarItem.text = 'Tokens: Calculating... ⌛';
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: 'Calculating project token count...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                this.projectCount = await this.tokenCounter.getProjectTokenCount();
                progress.report({ increment: 100 });
            });
        } catch (error) {
            console.error('Error calculating project token count:', error);
            vscode.window.showErrorMessage('Failed to calculate project token count.');
            this.projectCount = 0;
        } finally {
            this.isCalculating = false;
            this.updateStatusBar();
        }
    }

    private updateStatusBar(): void {
        this.statusBarItem.text = `Tokens: ${this.currentDocumentCount}`;
        const tooltip = new vscode.MarkdownString(`Click to calculate full project token count\n\n- **Current File**: ${this.currentDocumentCount} tokens\n- **Full Project**: ${this.projectCount > 0 ? this.projectCount + ' tokens' : 'Not calculated'}`);
        this.statusBarItem.tooltip = tooltip;
    }
}
