<p align="center">
  <img alt="react-easy-editor" src="https://img.shields.io/badge/react--easy--editor-000000?style=for-the-badge&logo=react&logoColor=61DAFB" />
</p>

<p align="center">
  A React editor component built on <a href="https://github.com/facebook/lexical">Lexical</a>,<br/>
  designed to make rich text editing effortless.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-easy-editor"><img alt="npm version" src="https://img.shields.io/npm/v/react-easy-editor.svg"></a>
  <a href="https://www.npmjs.com/package/react-easy-editor"><img alt="npm downloads" src="https://img.shields.io/npm/dm/react-easy-editor.svg"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

<p align="center">
  <a href="./README-ko.md">한국어</a>
</p>

---

## Why react-easy-editor?

[Lexical](https://github.com/facebook/lexical) is an excellent open-source text editor framework by Meta. However, despite having a playground, implementing the features you actually need can often be challenging and complex.

**react-easy-editor** solves this by providing a simple, plugin-based React component that wraps Lexical's powerful engine. Junior and mid-level developers can add rich text editing to their apps without wrestling with Lexical's low-level APIs.

- **One Install**: `npm install react-easy-editor` — everything included
- **Simple API**: One component, plugin props — that's it
- **Plugin-based**: Add only the features you need via props
- **Built on Lexical**: Leverages Lexical's battle-tested editor engine
- **TypeScript-first**: Full type safety out of the box

## Installation

```bash
npm install react-easy-editor
# or
yarn add react-easy-editor
# or
pnpm add react-easy-editor
```

**Requirements:**

- React 18.0.0 or higher

## Quick Start

```tsx
import { ReactEasyEditor, ToolbarPlugin, HistoryPlugin } from 'react-easy-editor';

function App() {
  return (
    <ReactEasyEditor
      plugins={[
        ToolbarPlugin(),
        HistoryPlugin(),
      ]}
    />
  );
}
```

That's it. No complex configuration, no manual Lexical setup, no extra packages to install. Just one component with plugins.

## Usage

### Basic Editor

```tsx
import { ReactEasyEditor } from 'react-easy-editor';

function App() {
  return <ReactEasyEditor />;
}
```

### With Plugins

```tsx
import {
  ReactEasyEditor,
  ToolbarPlugin,
  HistoryPlugin,
  LinkPlugin,
  ImagePlugin,
} from 'react-easy-editor';

function App() {
  return (
    <ReactEasyEditor
      plugins={[
        ToolbarPlugin(),
        HistoryPlugin(),
        LinkPlugin(),
        ImagePlugin(),
      ]}
    />
  );
}
```

## Roadmap

| Plugin | Description | Status |
| ------ | ----------- | ------ |
| `ToolbarPlugin` | Formatting toolbar (bold, italic, underline, etc.) | Planned |
| `HistoryPlugin` | Undo / Redo support | Planned |
| `LinkPlugin` | Link insertion and editing | Planned |
| `ImagePlugin` | Image embedding | Planned |
| `CodeHighlightPlugin` | Syntax-highlighted code blocks | Planned |
| `TablePlugin` | Table editing | Planned |
| `MentionPlugin` | @ mentions | Planned |
| More plugins | Community suggestions welcome! | - |

> Have a plugin idea? [Open an issue](https://github.com/your-username/react-easy-editor/issues) to suggest it!

## Contributing

Contributions are always welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`pnpm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/react-easy-editor.git
cd react-easy-editor

# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## License

MIT © [react-easy-editor contributors](https://github.com/your-username/react-easy-editor/graphs/contributors)

## Links

- [Report Bug](https://github.com/your-username/react-easy-editor/issues)
- [Request Feature](https://github.com/your-username/react-easy-editor/issues)
- [Changelog](./CHANGELOG.md)

---

<p align="center">
  Built with ❤️ for the developer community
</p>
