# TreeView Extension Architecture

## Overview

This extension demonstrates VS Code's TreeView API with context menu actions. It follows a clean, modular architecture pattern.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              VS Code Extension API                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  VS Code Platform                                      │ │
│  │  - Command Registry                                    │ │
│  │  - Window Management                                   │ │
│  │  - TreeView Registration                               │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    ┌─────────────┐         ┌──────────────────┐
    │ extension.ts│         │ itemsProvider.ts │
    ├─────────────┤         ├──────────────────┤
    │ - Activate  │         │ - Item (class)   │
    │ - Commands  │         │ - ItemsProvider  │
    │ - Handlers  │         │ - Data Store     │
    └─────────────┘         └──────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
     ┌─────────────┐      ┌─────────────┐
     │  TreeView   │      │Context Menu │
     ├─────────────┤      ├─────────────┤
     │ - Display   │      │ - Actions   │
     │ - Selection │      │ - Handlers  │
     └─────────────┘      └─────────────┘
```

## Data Flow

### Item Creation & Display

```
ItemsProvider Constructor
  ↓
Create 3 Items (Map)
  ↓
VS Code creates TreeView
  ↓
Calls getChildren()
  ↓
Returns Array<Item>
  ↓
TreeView renders items in Explorer sidebar
```

### Command Execution Flow

```
User right-clicks item
  ↓
Context menu appears (from package.json)
  ↓
User selects action
  ↓
Command fired (e.g., itemsExplorer.deleteItem)
  ↓
Command handler executes
  ↓
itemsProvider.deleteItem(id)
  ↓
itemsProvider.refresh() fires _onDidChangeTreeData
  ↓
VS Code re-requests getChildren()
  ↓
TreeView updates in UI
```

## Key Classes

### Item Class

Extends `vscode.TreeItem` to represent a single tree item.

```typescript
export class Item extends vscode.TreeItem {
    id: string                    // Unique identifier
    label: string                 // Display name
    description: string           // Subtitle
    contextValue: 'item'          // For context menu filtering
    tooltip: string               // Hover text
    iconPath: ThemeIcon           // Display icon
}
```

**Properties:**
- `id` - Unique identifier for the item
- `label` - Main display text
- `description` - Secondary text shown as subtitle
- `contextValue` - Used in package.json `when` clauses for menu visibility
- `tooltip` - Shows on hover
- `iconPath` - VS Code theme icon (circle-filled)

### ItemsProvider Class

Implements `vscode.TreeDataProvider<Item>` to provide data to the TreeView.

```typescript
export class ItemsProvider implements vscode.TreeDataProvider<Item> {
    private items: Map<string, Item>
    private _onDidChangeTreeData: EventEmitter<Item | undefined | null | void>
    
    getChildren(element?: Item): Thenable<Item[]>
    getTreeItem(element: Item): vscode.TreeItem
    refresh(): void
    deleteItem(id: string): void
    addItem(id: string, label: string, description: string): void
}
```

**Key Methods:**
- `getChildren()` - Returns items to display in the tree
- `getTreeItem()` - Converts Item to TreeItem for rendering
- `refresh()` - Fires change event to update UI
- `deleteItem()` - Removes item from data store
- `addItem()` - Adds new item to data store

## Configuration (package.json)

### Contribution Points

#### Views
```json
"views": {
  "explorer": [
    {
      "id": "itemsExplorer",
      "name": "Items Explorer",
      "icon": "media/icon.svg",
      "contextualTitle": "Items"
    }
  ]
}
```

- Registers a TreeView in the Explorer sidebar
- `id` is used throughout the extension for references
- `name` appears as the panel title
- `contextualTitle` appears in breadcrumb

#### Menus
```json
"menus": {
  "view/title": [...],           // Top-right buttons
  "view/item/context": [...]     // Right-click context menu
}
```

**view/title menu** - Action buttons in panel header
- Position: Top-right of Items Explorer
- Example: Refresh button

**view/item/context menu** - Context menu when right-clicking items
- `when` clause: Filters when commands appear
  - `viewItem == item` - Only show when right-clicking an item
- `group` - Controls button order (inline@1, inline@2, etc.)

#### Commands
```json
"commands": [
  {
    "command": "itemsExplorer.openItem",
    "title": "Open Item",
    "icon": "$(open)"
  },
  ...
]
```

Defines all available commands with icons and titles.

## Extension Activation

### Sequence Diagram

```
User opens VS Code with extension
        ↓
VS Code reads package.json
        ↓
Creates TreeView "itemsExplorer"
        ↓
Extension activation triggered
        ↓
activate() function called with ExtensionContext
        ↓
ItemsProvider instance created
        ↓
createTreeView() registers TreeView
        ↓
Commands registered:
  - itemsExplorer.refreshItems
  - itemsExplorer.openItem
  - itemsExplorer.editItem
  - itemsExplorer.deleteItem
        ↓
ItemsExplorer panel appears in sidebar
        ↓
getChildren() called automatically
        ↓
3 items displayed
        ↓
Ready for user interaction
```

## Context Menu Flow

### When User Right-Clicks Item

1. **package.json filters** - VS Code evaluates `when` clauses
   - `view == itemsExplorer` - Is it our TreeView? ✓
   - `viewItem == item` - Is it an item? ✓

2. **Menu items appear**
   - Open Item
   - Edit Item
   - Delete Item

3. **User selects action**

4. **Command fires**
   ```typescript
   // Example: openItem command
   vscode.commands.registerCommand('itemsExplorer.openItem', (item: Item) => {
       // item is passed from context
       vscode.window.showInformationMessage(`Opening item: ${item.label}`);
   })
   ```

## Data Persistence Strategy

### Current Implementation
- **In-Memory Only** - Items stored in `Map<string, Item>`
- **Lost on Restart** - Items reset when extension reloads

### Enhancement Options

#### Option 1: File-Based
```typescript
// Save to workspace folder
const itemsPath = vscode.workspace.workspaceFolders[0].uri.fsPath + '/items.json';
fs.writeFileSync(itemsPath, JSON.stringify(items));
```

#### Option 2: Workspace State
```typescript
// Built-in VS Code storage
context.workspaceState.update('items', itemsArray);
context.workspaceState.get('items');
```

#### Option 3: Global State
```typescript
// Persists across all workspaces
context.globalState.update('items', itemsArray);
```

#### Option 4: Database
```typescript
// Use SQLite or other database
// Most robust for complex data
```

## Extension Points

The extension can be extended with:

1. **Parent-Child Hierarchy**
   - Modify `getChildren()` to return children of selected item
   - Items would have `Expandable` state

2. **Edit Functionality**
   - Implement InputBox to rename items
   - Update item in data store
   - Call `refresh()`

3. **Persistence**
   - Save/load items to file or database
   - Load on activation

4. **Drag & Drop**
   - Implement `TreeDragAndDropController`
   - Reorder items

5. **Custom Icons**
   - Replace theme icons with custom SVG files
   - Different icons for different item types

6. **Item Properties**
   - Store custom metadata (created date, tags, etc.)
   - Display in tooltip or separate panel

## Best Practices Applied

✓ **Separation of Concerns**
  - `extension.ts` - Command handling
  - `itemsProvider.ts` - Data management

✓ **Single Responsibility**
  - Each class has one purpose
  - Each method does one thing

✓ **Extensibility**
  - Easy to add commands
  - Easy to modify data provider

✓ **TypeScript Strict Mode**
  - All types explicitly defined
  - Better IDE support

✓ **Error Handling**
  - Confirmation dialogs for destructive actions
  - User notifications for all actions

✓ **VS Code Best Practices**
  - Proper command registration
  - Context values for menu filtering
  - Event-driven updates with EventEmitter

## Performance Considerations

- **Lazy Loading** - Items loaded on demand via `getChildren()`
- **Event-Driven** - Only refresh when needed
- **Efficient Updates** - No unnecessary re-renders
- **Memory Efficient** - Map data structure for O(1) lookups

## Testing Considerations

To add tests, implement:

1. **Unit Tests** (ItemsProvider)
   - Test item creation
   - Test deletion
   - Test refresh events

2. **Integration Tests** (with VS Code API)
   - Test command execution
   - Test TreeView rendering
   - Test context menu appearance

3. **Mock Objects**
   - Mock VS Code API
   - Mock TreeView behavior

Example:
```typescript
describe('ItemsProvider', () => {
  it('should create items', () => {
    const provider = new ItemsProvider();
    expect(provider.getChildren()).toHaveLength(3);
  });
  
  it('should delete items', () => {
    const provider = new ItemsProvider();
    provider.deleteItem('item-1');
    expect(provider.getChildren()).toHaveLength(2);
  });
});
```

## Related VS Code APIs

- **TreeDataProvider** - Provides data to TreeView
- **TreeView** - Renders the tree in UI
- **EventEmitter** - Notifies of changes
- **Command Registry** - Registers and executes commands
- **Window API** - Shows dialogs and notifications
- **ExtensionContext** - Provides extension lifecycle context

## Resources

- [TreeView API Guide](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Extension API Reference](https://code.visualstudio.com/api/references/vscode-api)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
