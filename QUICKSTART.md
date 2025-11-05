# Quick Start Guide - TreeView Example Extension

## Setup & Run

### 1. Open the Extension Folder
```bash
cd c:\repos2\avro-vscode\extensions\treeview-example
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Compile TypeScript
```bash
npm run compile
```

### 4. Run the Extension
- Open the extension folder in VS Code
- Press `F5` to launch the extension in debug mode
- A new VS Code window will open with the extension loaded

## Test the Extension

1. In the new VS Code window, look at the Explorer sidebar
2. Find the **"Items Explorer"** panel (should be visible by default)
3. You'll see 3 items:
   - Item 1: First example item
   - Item 2: Second example item
   - Item 3: Third example item

## Try the Features

### Refresh Items
- Click the **Refresh** button (🔄) in the Items Explorer title bar
- You should see an "Items refreshed!" notification

### Open Item
- Right-click on any item
- Select **"Open Item"**
- You'll see a notification: "Opening item: Item X"

### Edit Item
- Right-click on any item
- Select **"Edit Item"**
- You'll see a notification: "Editing item: Item X"

### Delete Item
- Right-click on any item
- Select **"Delete Item"**
- Confirm the deletion in the dialog
- The item will be removed from the tree

## Development

### Watch Mode
While developing, use watch mode to automatically recompile:
```bash
npm run watch
```

### Debugging
- Set breakpoints in the source files (in VS Code)
- Press `F5` to start debugging
- Use the debug console to inspect variables

## Project Structure

```
├── src/
│   ├── extension.ts       # Main extension logic & command registration
│   └── itemsProvider.ts   # TreeView data provider implementation
├── dist/                  # Compiled JavaScript (generated)
├── package.json           # Extension manifest & dependencies
├── tsconfig.json          # TypeScript configuration
└── .vscode/
    ├── launch.json        # Debug launch configuration
    └── tasks.json         # Build tasks
```

## Key Concepts

### TreeView Provider
The `ItemsProvider` class implements `vscode.TreeDataProvider<Item>` which manages:
- Loading items from data source
- Notifying VS Code of changes
- Providing tree structure

### Commands
Four commands are registered:
1. `itemsExplorer.refreshItems` - Refresh the tree
2. `itemsExplorer.openItem` - Open/display item
3. `itemsExplorer.editItem` - Edit item
4. `itemsExplorer.deleteItem` - Delete with confirmation

### Context Menu
Context menu items are defined in `package.json` under `menus.view/item/context`:
- Uses `when` clauses to show/hide commands
- Uses `group` to control button positioning
- Uses `icon` for visual indicators

## Next Steps

### To Extend:

1. **Add More Items**: Edit `ItemsProvider` constructor
2. **Persist Data**: Save items to file or database
3. **Add Create Command**: Add new items via UI input
4. **Custom Icons**: Replace theme icons with custom SVG
5. **Parent-Child Hierarchy**: Modify `getChildren()` to support nesting

### Example: Add a Create Item Command

```typescript
context.subscriptions.push(
    vscode.commands.registerCommand('itemsExplorer.createItem', async () => {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter item name'
        });
        if (name) {
            itemsProvider.addItem(Date.now().toString(), name, 'New item');
            itemsProvider.refresh();
        }
    })
);
```

## Troubleshooting

### Extension not showing up?
- Make sure to press `F5` to run the extension
- Check the "Extension Development Host" window

### TreeView not visible?
- Open the Explorer sidebar (Ctrl+Shift+E)
- Scroll down to see "Items Explorer"

### Changes not taking effect?
- Stop the debug session (Shift+F5)
- Recompile: `npm run compile`
- Press F5 again

### Compilation errors?
- Make sure `node_modules` is installed: `npm install`
- Check TypeScript version: `npm ls typescript`
- Try: `npm run compile`

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TreeView Documentation](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Command Documentation](https://code.visualstudio.com/api/references/commands)
