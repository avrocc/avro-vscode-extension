# Avro Extension

Official VS Code extension for the Avro platform with custom TreeView explorer.

## Features

- **Custom Activity Bar Button**: Dedicated "Avro" button in the sidebar with custom icon
- **Hierarchical TreeView**: Organized folders with nested items:
  - 📁 Documents folder with 3 file items
  - 📁 Actions folder with Deploy and Test actions
- **Context Menu Actions**:
  - **Open Item**: Opens/displays the selected item
  - **Edit Item**: Edit file items
  - **Delete Item**: Delete items with confirmation
  - **Execute Action**: Run Deploy/Test actions
- **Keyboard Shortcut**: `Ctrl+Shift+A` to show Avro panel
- **Refresh Button**: Refresh the items tree

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press `F5` to open a new VS Code window with the extension loaded

## Development

### Prerequisites
- Node.js 14+
- VS Code 1.85+

### Commands

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch for TypeScript changes
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Extension Structure

```
├── src/
│   ├── extension.ts       # Main extension entry point
│   └── itemsProvider.ts   # TreeView provider implementation
├── package.json           # Extension manifest
└── tsconfig.json          # TypeScript configuration
```

## How It Works

1. The extension activates automatically when VS Code starts
2. A TreeView named "Items Explorer" is created in the Explorer sidebar
3. The TreeView displays 3 sample items
4. Right-click on any item to see context menu options:
   - Open Item
   - Edit Item
   - Delete Item
5. Click the refresh button to reload the items list

## Adding Custom Items

To add more items, modify the `ItemsProvider` constructor or use the `addItem()` method:

```typescript
itemsProvider.addItem('item-4', 'Item 4', 'Description');
```

## License

MIT
```

## License

MIT
>>>>>>> feature/init
