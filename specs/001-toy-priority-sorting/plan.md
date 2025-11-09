# Implementation Plan: おもちゃ優先度ソートアプリ

**Branch**: `001-toy-priority-sorting` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-toy-priority-sorting/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

3歳児が親と一緒に優先度を決めるためのアプリケーション。PCの指定フォルダに配置された画像をスマートフォンでドラッグ&ドロップして並び替え、その順序をPC上に永続化する。ローカルネットワーク内でのみ動作し、ユーザー管理や認証は不要。

## Technical Context

**Language/Version**: TypeScript 5, Node.js (Next.js 16.0.1が要求)
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS 4
**Storage**: ファイルシステム(画像ファイル + JSONファイルで順序管理)
**Testing**: NEEDS CLARIFICATION (テストフレームワーク未設定)
**Target Platform**: Web (PC + スマートフォンブラウザ)、ローカルネットワーク環境
**Project Type**: Web (Next.js App Router)
**Performance Goals**:
- 画像50枚の読み込み: 5秒以内
- ドラッグ&ドロップ操作: 1秒以内の応答
- サムネイル生成: 初回アクセス時に自動生成
**Constraints**:
- ローカルネットワーク内のみで動作
- PCが常時起動していることが前提
- 単一デバイスアクセス(同時アクセス非対応)
- 画像ファイルサイズ: 10MB以下を推奨
**Scale/Scope**:
- 画像枚数: 最大50枚を推奨
- ユーザー数: 単一家庭内利用(1家族)
- 画面数: 2画面(画像一覧表示、並び替えUI)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

このセクションでは、実装が`.specify/memory/constitution.md`で定義された原則に準拠しているかを確認します。

### Principle 1: Type Safety & Code Quality

- [ ] すべての実装後に`pnpm run typecheck`を実行し、型エラーがないことを確認
- [ ] すべての実装後に`pnpm run lint`を実行し、静的解析エラーがないことを確認
- [ ] `any`型の使用を避け、明示的な型定義を使用
- [ ] 関数の引数と戻り値に型アノテーションを明示

### Principle 2: Minimal Implementation

- [ ] YAGNI原則に従い、必要最小限の機能のみを実装
- [ ] 新しいデザインパターンやアーキテクチャパターンの導入には明確な理由を文書化
- [ ] 新しい依存関係の追加は、既存手段で解決できないことを確認
- [ ] コードの重複が3回以上発生した場合にのみ抽象化を検討

### Principle 3: React useEffect Discipline

- [ ] `useEffect`の使用が外部システムとの同期に限定されていることを確認
- [ ] すべての`useEffect`に同期対象の外部リソースを説明するコメントを追加
- [ ] propsや派生値をローカルstateにコピーする`useEffect`がないことを確認
- [ ] ユーザーアクションの処理がイベントハンドラで行われることを確認

**違反がある場合**: "Complexity Tracking"セクションで正当化すること

## Project Structure

### Documentation (this feature)

```text
specs/001-toy-priority-sorting/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── images/
│   │   └── route.ts              # GET: 画像一覧取得、POST: 順序更新
│   └── order/
│       └── route.ts              # GET: 順序取得、PUT: 順序保存
├── page.tsx                      # ルートページ(PC/スマホ判定とリダイレクト)
├── images/
│   └── page.tsx                  # 画像一覧表示ページ(PC用)
└── sort/
    └── page.tsx                  # 並び替えページ(スマートフォン用)

lib/
├── image-service.ts              # 画像ファイル読み込み、サムネイル生成
├── order-service.ts              # 順序データの永続化(JSON読み書き)
└── types.ts                      # 型定義(ToyImage, ImageOrder)

public/
└── pictures/                     # 指定フォルダ(画像配置場所)

data/
└── order.json                    # 画像順序を保存するJSONファイル
```

**Structure Decision**: Next.js App Router構造を採用。`app/`ディレクトリにページとAPIルートを配置し、`lib/`にビジネスロジックを分離。画像は`public/pictures/`に配置し、順序データは`data/order.json`に保存。

## Complexity Tracking

該当なし。すべての実装は憲章の原則に準拠しています。

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete

以下の技術的な未決定事項をリサーチして解決します:

1. **ドラッグ&ドロップライブラリの選定**
   - Question: スマートフォンでのドラッグ&ドロップに最適なライブラリは?
   - Options: dnd-kit, react-beautiful-dnd, react-dnd, ネイティブHTML5 Drag & Drop API
   - Research focus: タッチデバイス対応、React 19互換性、バンドルサイズ、パフォーマンス

2. **サムネイル生成方法**
   - Question: Next.jsでのサーバーサイド画像処理方法は?
   - Options: sharp (Node.js), next/image最適化機能、Canvas API、外部サービス
   - Research focus: Next.js 16との互換性、パフォーマンス、依存関係の最小化

3. **デバイス判定方法**
   - Question: PC/スマートフォンの判定とリダイレクトのベストプラクティスは?
   - Options: User-Agent解析、画面サイズ検出(CSS media query + JS)、手動選択
   - Research focus: 精度、パフォーマンス、ユーザビリティ

4. **テストフレームワーク**
   - Question: Next.js 16 + React 19に最適なテストフレームワークは?
   - Options: Vitest, Jest with React Testing Library, Playwright (E2E)
   - Research focus: React 19サポート、セットアップの容易さ、実行速度

**Output**: `research.md` に各項目の決定内容、選定理由、代替案を記載

---

## Phase 1: Data Model & API Contracts

**Status**: ✅ Complete

### Data Model

`data-model.md`に以下のエンティティを定義:

**Picture**
- filename: string (ユニークID、画像ファイル名)
- path: string (ファイルパス)
- thumbnailPath: string (サムネイル画像パス)
- order: number (表示順序)

**PictureOrder**
- pictures: Picture[] (順序付き画像リスト)
- lastUpdated: Date (最終更新日時)

### API Contracts

`contracts/`ディレクトリにOpenAPI仕様を作成:

**GET /api/images**
- Response: Picture[] (画像一覧)
- Logic: `public/pictures/`フォルダをスキャン、サムネイル生成、順序データとマージ

**GET /api/order**
- Response: PictureOrder (現在の順序)
- Logic: `data/order.json`を読み込み

**PUT /api/order**
- Request: { filenames: string[] } (ファイル名の配列)
- Response: PictureOrder (更新後の順序)
- Logic: `data/order.json`に保存

### Quickstart

`quickstart.md`に以下を記載:
1. 開発環境セットアップ手順
2. 画像フォルダの準備方法
3. ローカルネットワーク内でのアクセス方法(IPアドレス確認、ポート設定)
4. 動作確認手順

### Agent Context Update

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Output**: `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`, `.claude/CLAUDE.md`更新

---

## Phase 2: Task Breakdown

**Status**: Not started (`/speckit.tasks`コマンドで実行)

このフェーズは`/speckit.plan`の範囲外です。`/speckit.tasks`コマンドで実行してください。

---

## Notes

- ローカルネットワーク内でのアクセスのため、Next.jsのデフォルトホスト設定を`0.0.0.0`に変更が必要(package.json: `"dev": "next dev -H 0.0.0.0"`)
- 画像フォルダ(`public/pictures/`)とデータフォルダ(`data/`)は初回起動時に自動生成
- 3歳児の操作を考慮し、ドラッグターゲットは最小44x44pxを確保
- スマートフォンでのタッチ操作に最適化したUIデザインが必要
