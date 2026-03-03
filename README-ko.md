<p align="center">
  <img alt="react-easy-editor" src="https://img.shields.io/badge/react--easy--editor-000000?style=for-the-badge&logo=react&logoColor=61DAFB" />
</p>

<p align="center">
  <a href="https://github.com/facebook/lexical">Lexical</a> 기반의 React 에디터 컴포넌트,<br/>
  리치 텍스트 편집을 간편하게 만들어 줍니다.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-easy-editor"><img alt="npm version" src="https://img.shields.io/npm/v/react-easy-editor.svg"></a>
  <a href="https://www.npmjs.com/package/react-easy-editor"><img alt="npm downloads" src="https://img.shields.io/npm/dm/react-easy-editor.svg"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a>
</p>

---

## 왜 react-easy-editor인가요?

[Lexical](https://github.com/facebook/lexical)은 Meta에서 만든 훌륭한 오픈소스 텍스트 에디터 프레임워크입니다. 하지만 playground가 있음에도 불구하고, 실제로 필요한 기능을 구현하는 것은 난해하고 복잡한 경우가 많습니다.

**react-easy-editor**는 Lexical의 강력한 엔진을 간단한 플러그인 기반 React 컴포넌트로 감싸 이 문제를 해결합니다. 주니어, 미드레벨 개발자들도 Lexical의 저수준 API와 씨름하지 않고 리치 텍스트 에디터를 앱에 쉽게 추가할 수 있습니다.

- **한 번의 설치**: `npm install react-easy-editor` — 모든 기능 포함
- **간단한 API**: 하나의 컴포넌트, plugin props — 그게 전부입니다
- **플러그인 기반**: 필요한 기능만 props로 골라서 추가
- **Lexical 기반**: 검증된 Lexical 에디터 엔진 활용
- **TypeScript 우선**: 완벽한 타입 안전성 기본 제공

## 설치

```bash
npm install react-easy-editor
# or
yarn add react-easy-editor
# or
pnpm add react-easy-editor
```

**요구 사항:**

- React 18.0.0 이상

## 빠른 시작

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

복잡한 설정도, 수동 Lexical 세팅도, 추가 패키지 설치도 필요 없습니다. 컴포넌트와 플러그인만 있으면 됩니다.

## 사용법

### 기본 에디터

```tsx
import { ReactEasyEditor } from 'react-easy-editor';

function App() {
  return <ReactEasyEditor />;
}
```

### 플러그인 사용

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

## 로드맵

| 플러그인 | 설명 | 상태 |
| ------- | ---- | ---- |
| `ToolbarPlugin` | 서식 도구 모음 (볼드, 이탤릭, 밑줄 등) | 예정 |
| `HistoryPlugin` | 실행 취소 / 다시 실행 | 예정 |
| `LinkPlugin` | 링크 삽입 및 편집 | 예정 |
| `ImagePlugin` | 이미지 삽입 | 예정 |
| `CodeHighlightPlugin` | 구문 강조 코드 블록 | 예정 |
| `TablePlugin` | 테이블 편집 | 예정 |
| `MentionPlugin` | @ 멘션 기능 | 예정 |
| 추가 플러그인 | 커뮤니티 제안을 환영합니다! | - |

> 플러그인 아이디어가 있으신가요? [이슈를 열어](https://github.com/your-username/react-easy-editor/issues) 제안해주세요!

## 기여하기

기여는 언제나 환영합니다! 아래 절차를 따라주세요:

1. 저장소를 Fork 합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 테스트를 실행합니다 (`pnpm test`)
4. 변경 사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
5. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
6. Pull Request를 생성합니다

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/react-easy-editor.git
cd react-easy-editor

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 전체 패키지 빌드
pnpm build

# 테스트 실행
pnpm test

# 린트 & 포맷
pnpm lint
pnpm format
```

## 라이선스

MIT © [react-easy-editor contributors](https://github.com/your-username/react-easy-editor/graphs/contributors)

## 링크

- [버그 제보](https://github.com/your-username/react-easy-editor/issues)
- [기능 요청](https://github.com/your-username/react-easy-editor/issues)
- [변경 이력](./CHANGELOG.md)

---

<p align="center">
  개발자 생태계를 위해 ❤️ 로 만들었습니다
</p>
