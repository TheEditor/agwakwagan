# TypeDoc Setup for Agwakwagan

## Installation

TypeDoc is already installed as a dev dependency. If you need to reinstall:

```bash
npm install --save-dev typedoc
```

## Usage

Generate documentation:
```bash
npm run docs
```

Generate docs with live reload:
```bash
npm run docs:watch
```

## Output

Documentation generates to `./docs/` directory. Open `docs/index.html` in browser.

## Adding Documentation Comments

Use TSDoc/JSDoc syntax in your code:

```typescript
/**
 * Creates a new task in the specified column
 * @param columnId - UUID of target column
 * @param taskData - Task properties (title, description, etc)
 * @returns The newly created task object
 * @throws {Error} If columnId doesn't exist
 */
export function createTask(columnId: string, taskData: TaskData): Task {
  // implementation
}
```

## Configuration

Edit `typedoc.json` to customize output, excluded files, etc.

## Git

Add to `.gitignore`:
```
docs/
```
