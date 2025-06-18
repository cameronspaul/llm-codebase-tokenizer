# LLM Codebase Tokenizer

A VS Code extension that calculates and displays token counts for OpenAI models in real-time using the pure JavaScript version of tiktoken (js-tiktoken).

## Features

- Displays token count of the currently active document in the status bar.
- Provides a clickable status bar item to calculate and display the total token count for the entire codebase.
- Excludes directories like `node_modules`, `.venv`, and `.git` by default.
- Supports customizable exclusion patterns via user settings.
- Handles large codebases efficiently with asynchronous file processing.
- Shows token count breakdowns (current file vs. full project) in a hover tooltip.
- Caches results to minimize redundant calculations.
- Includes error handling for unsupported file types and permission issues.
- Provides visual feedback during token calculation with a spinner/progress indicator.
- Allows manual refresh via the command palette.

## Installation

1. Clone or download this repository to your local machine.
2. Navigate to the extension's directory:
   ```
   cd llm-codebase-tokenizer
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Compile the extension:
   ```
   npm run compile
   ```
5. Package the extension into a `.vsix` file:
   ```
   npx vsce package
   ```
   Note: You may need to install `vsce` globally if it's not already installed. You can do this by running:
   ```
   npm install -g vsce
   ```
6. Open VS Code, go to the Extensions view (`Ctrl+Shift+X`), and click on the "..." menu in the top right corner, then select "Install from VSIX...".
7. Browse to the `llm-codebase-tokenizer` directory and select the generated `.vsix` file.

## Usage

- Open any text file in VS Code, and the token count for the current file will be displayed in the status bar.
- Click on the status bar item to calculate the token count for the entire project.
- Use the command palette (`Ctrl+Shift+P`) and select "Refresh Token Count" to manually update the project token count.
- Configure exclusion patterns in the settings under `llmCodebaseTokenizer.excludedFolders` and `llmCodebaseTokenizer.excludedFileTypes`.

## Configuration

You can customize the folders and file types to exclude from token counting in the VS Code settings:

- `llmCodebaseTokenizer.excludedFolders`: Array of folder names to exclude (default: `["node_modules", ".venv", ".git"]`).
- `llmCodebaseTokenizer.excludedFileTypes`: Array of file extensions to exclude (default: `[".bin", ".exe", ".jpg", ".png", ".gif", ".zip", ".tar", ".gz"]`).

## Development

To contribute or modify the extension:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Make changes to the source code in the `src` directory.
4. Run `npm run compile` to build the extension.
5. Press `F5` in VS Code to launch the extension in a new Extension Development Host window for testing.
6. To package the extension for distribution, use:
   ```
   npx vsce package
   ```
   This will create a `.vsix` file that can be installed in VS Code or published to the marketplace (requires additional setup with `vsce`).

## Troubleshooting Compilation Issues

If you encounter issues during compilation or packaging:
- Ensure Node.js and npm are installed and up to date.
- Verify that all dependencies are installed correctly by running `npm install`.
- Check for TypeScript errors in the source code. You can run `npm run lint` to identify potential issues.
- If `vsce` is not recognized, install it globally with `npm install -g vsce`.

## License

MIT
