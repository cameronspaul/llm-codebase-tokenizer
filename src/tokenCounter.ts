import { encodingForModel } from 'js-tiktoken';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);

export class TokenCounter {
    private encoder: any;
    private cache: Map<string, { tokenCount: number; timestamp: number }> = new Map();
    private excludedFolders: string[] = [];
    private includedFileTypes: string[] = [];
    private excludedFileTypes: string[] = [];

    constructor() {
        // Initialize the tiktoken encoder for a common OpenAI model
        this.encoder = encodingForModel('gpt-4o-mini');
        this.loadSettings();
    }

    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('tiktokenCounter');
    this.excludedFolders = config.get('excludedFolders', ['node_modules', '.venv', '.git']);
    this.includedFileTypes = config.get('includedFileTypes', [
        // Web Development
        '.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    
        // Backend & General Purpose
        '.py', '.pyw', '.java', '.jar', '.class', '.cpp', '.cxx', '.h', '.hpp', '.c', '.cs', '.go', '.rb', '.php', '.pl', '.pm', '.t', '.sh', '.bash', '.zsh', '.ps1', '.psm1',
    
        // Data Formats
        '.json', '.xml', '.md', '.txt', '.log', '.ini', '.yaml', '.yml', '.toml', '.csv', '.tsv', '.sql',
    
        // Configuration & Build
        '.jsonc', '.json5', '.properties', '.env', '.dockerfile', 'Dockerfile', '.gradle', '.pom', '.mak', '.mk',
    
        // Other Languages
        '.rs', '.swift', '.kt', '.kts', '.scala', '.r', '.m', '.lua', '.dart', '.groovy', '.gvy', '.gy', '.gsh',
    
        // Markup & Templating
        '.jinja', '.jinja2', '.j2', '.erb', '.mustache', '.handlebars', '.hbs', '.pug', '.jade'
    ]);    this.excludedFileTypes = config.get('excludedFileTypes', ['.bin', '.exe', '.jpg', '.png', '.gif', '.zip', '.tar', '.gz']);
    }

    public getTokenCount(text: string): number {
        try {
            const tokens = this.encoder.encode(text);
            return tokens.length;
        } catch (error) {
            console.error('Error calculating token count:', error);
            return 0;
        }
    }

    public getDocumentTokenCount(document: vscode.TextDocument): number {
        const text = document.getText();
        return this.getTokenCount(text);
    }

    public async getProjectTokenCount(): Promise<number> {
        this.loadSettings(); // Refresh settings in case they changed
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return 0;
        }

        let totalTokens = 0;
        for (const folder of workspaceFolders) {
            totalTokens += await this.scanFolder(folder.uri.fsPath);
        }
        return totalTokens;
    }

    private async scanFolder(folderPath: string): Promise<number> {
        let tokenCount = 0;
        try {
            const files = await promisify(fs.readdir)(folderPath);
            for (const file of files) {
                const fullPath = path.join(folderPath, file);
                if (this.isExcluded(fullPath)) {
                    continue;
                }

                try {
                    const stats = await statAsync(fullPath);
                    if (stats.isDirectory()) {
                        tokenCount += await this.scanFolder(fullPath);
                    } else if (stats.isFile() && this.isSupportedFileType(fullPath)) {
                        console.log('Tokenizing file:', fullPath);
                        const cached = this.cache.get(fullPath);
                        if (cached && cached.timestamp >= stats.mtimeMs) {
                            tokenCount += cached.tokenCount;
                        } else {
                            const content = await readFileAsync(fullPath, 'utf-8');
                            const count = this.getTokenCount(content);
                            this.cache.set(fullPath, { tokenCount: count, timestamp: stats.mtimeMs });
                            tokenCount += count;
                        }
                    }
                } catch (error) {
                    console.error(`Error processing file ${fullPath}:`, error);
                }
            }
        } catch (error) {
            console.error(`Error scanning folder ${folderPath}:`, error);
        }
        return tokenCount;
    }

    private isExcluded(filePath: string): boolean {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return this.excludedFolders.some(folder => 
            normalizedPath.includes(`/${folder}/`) || 
            normalizedPath.endsWith(`/${folder}`)
        );
    }

    private isSupportedFileType(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return this.includedFileTypes.includes(ext) && !this.excludedFileTypes.includes(ext);
    }
}
