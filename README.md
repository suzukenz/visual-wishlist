# 画像優先度ソートアプリ

3歳児が親と一緒に優先度を決めるためのシンプルなアプリケーションです。

## 概要

PCの指定フォルダに配置された画像をスマートフォンでドラッグ&ドロップして並び替え、その順序をPC上に永続化します。ローカルネットワーク内でのみ動作し、ユーザー管理や認証は不要です。

## 主な機能

- **PC表示**: 画像一覧をグリッドレイアウトで表示
- **スマートフォン表示**: 画像を縦一列に並べ、ドラッグ&ドロップで並び替え
- **自動デバイス判定**: User-Agentに基づいて適切なUIを自動表示
- **手動切り替え**: 画面右下のボタンでPC/スマートフォン表示を切り替え可能
- **順序の永続化**: 並び替えた順序はJSONファイルに保存され、次回アクセス時も維持

## 技術スタック

- **フレームワーク**: Next.js 16.0.1 (App Router)
- **言語**: TypeScript 5
- **UI**: React 19.2.0
- **スタイリング**: Tailwind CSS 4
- **ドラッグ&ドロップ**: dnd-kit 6.3.1
- **画像処理**: Sharp 0.33.0
- **テスト**: Vitest + Playwright

## セットアップ

詳細なセットアップ手順は [quickstart.md](./specs/001-toy-priority-sorting/quickstart.md) を参照してください。

### クイックスタート

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動(ローカルネットワーク内でアクセス可能)
pnpm run dev

# 本番ビルド
pnpm run build
pnpm run start
```

### 画像の準備

1. `public/pictures/` フォルダに画像を配置
2. サムネイル生成: `pnpm run generate-thumbnails`
3. ブラウザで `http://localhost:3000` を開く

サポートされる画像形式: jpg, jpeg, png, gif, webp

## 使い方

### PC から

1. PCのブラウザで `http://localhost:3000` を開く
2. 画像一覧が表示される
3. 画像の並び替えはスマートフォンから行う

### スマートフォン から

1. PCと同じWi-Fiネットワークに接続
2. ブラウザで `http://<PC-IP>:3000` を開く (例: `http://192.168.1.100:3000`)
3. 画像をタッチしてドラッグし、順序を変更
4. 変更は自動的に保存される

## プロジェクト構造

```
app/
├── api/
│   ├── images/route.ts       # 画像一覧取得API
│   ├── order/route.ts        # 順序取得・更新API
│   └── set-view/route.ts     # 表示モード設定API
├── components/
│   └── view-switcher.tsx     # デバイス切り替えUI
├── images/page.tsx           # PC用画像一覧ページ
├── sort/
│   ├── page.tsx              # スマートフォン用並び替えページ
│   └── sortable-item.tsx     # ドラッグ可能アイテム
└── page.tsx                  # ルートページ(リダイレクト)

lib/
├── image-service.ts          # 画像ファイル読み込みロジック
├── order-service.ts          # 順序データ永続化ロジック
└── types.ts                  # 型定義

public/pictures/              # 画像配置フォルダ
data/order.json               # 順序データ保存ファイル
```

## Development Standards

このプロジェクトは、明確な開発原則に基づいて構築されています。詳細は [Project Constitution](.specify/memory/constitution.md) を参照してください。

### 重要な開発ルール

実装完了後は、必ず以下のチェックを実行してください:

```bash
pnpm run typecheck  # 型チェック
pnpm run lint       # 静的解析
```

すべてのチェックに合格してからコミットしてください。

## 開発

### スクリプト

```bash
# 開発サーバー起動
pnpm run dev

# 型チェック
pnpm run typecheck

# Lint
pnpm run lint

# ユニットテスト
pnpm run test

# E2Eテスト
pnpm run test:e2e

# サムネイル生成
pnpm run generate-thumbnails
```

### 新しい画像の追加

```bash
# 画像を追加
cp ~/Pictures/new-image.jpg public/pictures/

# サムネイル生成
pnpm run generate-thumbnails

# 開発サーバーが起動中の場合、ブラウザをリロード
```

## トラブルシューティング

### スマートフォンからアクセスできない

- PCとスマートフォンが同じWi-Fiネットワークに接続されているか確認
- PCのファイアウォール設定を確認(ポート3000を許可)
- ルーターのAP分離機能が無効になっているか確認

### 画像が表示されない

- `public/pictures/` に画像が配置されているか確認
- サポートされる形式(.jpg, .jpeg, .png, .gif, .webp)を使用しているか確認
- `pnpm run generate-thumbnails` を実行したか確認

詳細なトラブルシューティングは [quickstart.md](./specs/001-toy-priority-sorting/quickstart.md) を参照してください。

## ライセンス

このプロジェクトはプライベートです。

## リンク

- [仕様書](./specs/001-toy-priority-sorting/spec.md)
- [実装計画](./specs/001-toy-priority-sorting/plan.md)
- [クイックスタート](./specs/001-toy-priority-sorting/quickstart.md)
