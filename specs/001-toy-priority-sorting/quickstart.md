# Quickstart: 画像優先度ソートアプリ

**Feature**: 001-toy-priority-sorting
**Date**: 2025-11-09

このガイドでは、開発環境のセットアップから動作確認までの手順を説明します。

---

## 前提条件

- Node.js 20.9.0以上
- pnpm(推奨)またはnpm
- Git
- PC とスマートフォンが同じローカルネットワークに接続

---

## 1. 開発環境セットアップ

### 1.1 リポジトリのクローン(既存の場合)

```bash
cd /Users/suzukenz/Develop/src/github.com/visual-wishlist
git checkout 001-toy-priority-sorting
```

### 1.2 依存関係のインストール

```bash
pnpm install

# 追加の依存関係をインストール
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2 sharp@^0.33.0

# 開発依存関係をインストール
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @playwright/test tsx
```

### 1.3 設定ファイルの作成

#### vitest.config.mts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

#### playwright.config.ts

```bash
pnpm exec playwright install
```

### 1.4 package.jsonスクリプトの更新

```json
{
  "scripts": {
    "dev": "pnpm run generate-thumbnails && next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "generate-thumbnails": "tsx scripts/generate-thumbnails.ts",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 2. 画像フォルダの準備

### 2.1 必要なディレクトリ作成

```bash
mkdir -p public/pictures
mkdir -p public/pictures/thumbnails
mkdir -p data
```

### 2.2 サンプル画像の配置

画像の画像を`public/pictures/`に配置してください。

**サポートされる形式**: jpg, png, gif, webp
**推奨サイズ**: 10MB以下

例:
```bash
# サンプル画像(存在する場合)
cp ~/Pictures/toy-car.jpg public/pictures/
cp ~/Pictures/teddy-bear.png public/pictures/
cp ~/Pictures/robot.jpg public/pictures/
```

### 2.3 サムネイル生成スクリプトの作成

**ファイル**: `scripts/generate-thumbnails.ts`

```typescript
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

async function generateThumbnails() {
  const sourceDir = join(process.cwd(), 'public/pictures');
  const thumbDir = join(process.cwd(), 'public/pictures/thumbnails');

  // サムネイルディレクトリ作成
  await mkdir(thumbDir, { recursive: true });

  // 画像ファイルの取得
  const files = await readdir(sourceDir);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log('⚠️  No images found in public/pictures/');
    return;
  }

  console.log(`Found ${imageFiles.length} images`);

  // 同時実行数の制限
  const concurrency = 4;

  for (let i = 0; i < imageFiles.length; i += concurrency) {
    const batch = imageFiles.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (file) => {
        const inputPath = join(sourceDir, file);
        const outputPath = join(thumbDir, file);

        try {
          await sharp(inputPath)
            .resize(200, 200, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({
              quality: 80,
              mozjpeg: true,
            })
            .toFile(outputPath);

          console.log(`✓ Generated: ${file}`);
        } catch (error) {
          console.error(`✗ Failed to generate thumbnail for ${file}:`, error);
        }
      })
    );
  }

  console.log(`✓ Generated ${imageFiles.length} thumbnails`);
}

generateThumbnails().catch(console.error);
```

### 2.4 サムネイル生成

```bash
pnpm run generate-thumbnails
```

**出力例**:
```
Found 3 images
✓ Generated: toy-car.jpg
✓ Generated: teddy-bear.png
✓ Generated: robot.jpg
✓ Generated 3 thumbnails
```

---

## 3. ローカルネットワーク内でのアクセス方法

### 3.1 PCのIPアドレス確認

#### macOS/Linux:
```bash
ifconfig | grep "inet "
```

#### Windows:
```cmd
ipconfig
```

**例**: `192.168.1.100`

### 3.2 開発サーバー起動

```bash
pnpm run dev
```

サーバーは`0.0.0.0:3000`でリッスンします(すべてのネットワークインターフェースでアクセス可能)。

**出力例**:
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

✓ Starting...
✓ Ready in 2.3s
```

### 3.3 アクセス方法

**PC から**:
```
http://localhost:3000
```

**スマートフォン から**(同じWi-Fi接続):
```
http://192.168.1.100:3000
```

PCのIPアドレス部分を、手順3.1で確認したIPに置き換えてください。

---

## 4. 動作確認手順

### 4.1 PC での画像一覧確認

1. PC のブラウザで`http://localhost:3000`を開く
2. デバイス判定により、PC用UIが表示される
3. `public/pictures/`内の画像がサムネイルで一覧表示されることを確認

### 4.2 スマートフォン での並び替え

1. スマートフォンのブラウザで`http://192.168.1.100:3000`を開く
2. デバイス判定により、スマートフォン用UIが表示される
3. 画像が縦一列に表示されることを確認
4. 画像をタッチしてドラッグし、順序を変更
5. 画面を離れて再度アクセス
6. 変更した順序が保持されていることを確認

### 4.3 画像の追加/削除

#### 画像追加:
```bash
# 新しい画像を追加
cp ~/Pictures/new-toy.jpg public/pictures/

# サムネイル生成
pnpm run generate-thumbnails

# ブラウザをリロード(F5またはCmd+R)
```

新しい画像が末尾に表示されることを確認。

#### 画像削除:
```bash
# 画像を削除
rm public/pictures/old-toy.jpg
rm public/pictures/thumbnails/old-toy.jpg

# ブラウザをリロード
```

削除した画像が表示されないことを確認。

---

## 5. テスト実行

### 5.1 ユニットテスト(Vitest)

```bash
# 通常実行
pnpm run test

# ウォッチモード
pnpm run test

# UIモード
pnpm run test:ui
```

### 5.2 E2Eテスト(Playwright)

```bash
# ヘッドレスモード
pnpm run test:e2e

# UIモード(デバッグ用)
pnpm run test:e2e:ui
```

### 5.3 型チェック

```bash
pnpm run typecheck
```

### 5.4 Lint

```bash
pnpm run lint
```

---

## 6. トラブルシューティング

### 問題: スマートフォンからアクセスできない

**原因**: PCとスマートフォンが異なるネットワークに接続している

**解決策**:
1. 両方のデバイスが同じWi-Fiネットワークに接続されているか確認
2. PCのファイアウォール設定を確認(ポート3000を許可)
3. ルーターのAP分離機能が有効になっていないか確認

### 問題: サムネイルが生成されない

**原因**: Sharpのインストールに失敗している

**解決策**:
```bash
# Sharpを再インストール
pnpm remove sharp
pnpm add sharp

# 再度サムネイル生成
pnpm run generate-thumbnails
```

### 問題: 画像が表示されない

**原因1**: 画像形式が未対応
- 対応形式: jpg, jpeg, png, gif, webp

**原因2**: ファイルパスが不正
- `public/pictures/`直下に配置されているか確認

**解決策**:
```bash
# ディレクトリ構造を確認
ls -la public/pictures/
ls -la public/pictures/thumbnails/
```

### 問題: 順序が保存されない

**原因**: `data/order.json`への書き込み権限がない

**解決策**:
```bash
# dataディレクトリの権限確認
ls -ld data/

# 権限修正(必要に応じて)
chmod 755 data/
```

### 問題: デバイス判定が正しくない

**解決策**: 手動切り替えUIを使用
- 画面右下の切り替えボタンで、手動でPC/スマートフォン表示を切り替え可能

---

## 7. 本番ビルド

### 7.1 ビルド実行

```bash
# サムネイル生成(prebuildで自動実行)
pnpm run build
```

### 7.2 本番サーバー起動

```bash
pnpm run start
```

デフォルトでは`localhost:3000`のみでリッスンします。ローカルネットワークでアクセスする場合は、`package.json`を修正:

```json
{
  "scripts": {
    "start": "next start -H 0.0.0.0"
  }
}
```

---

## 8. .gitignore 設定

以下を`.gitignore`に追加推奨:

```gitignore
# サムネイル(ビルド時生成)
public/pictures/thumbnails/

# 順序データ(ユーザー固有)
data/order.json

# テストカバレッジ
coverage/

# Playwrightレポート
playwright-report/
test-results/
```

---

## 9. 次のステップ

開発環境が整ったら、`/speckit.tasks`コマンドで実装タスクを生成してください:

```bash
# Claude Code で実行
/speckit.tasks
```

これにより、`specs/001-toy-priority-sorting/tasks.md`が生成され、実装タスクが優先順位付きで一覧表示されます。

---

## 参考リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [dnd-kit ドキュメント](https://docs.dndkit.com/)
- [Sharp ドキュメント](https://sharp.pixelplumbing.com/)
- [Vitest ドキュメント](https://vitest.dev/)
- [Playwright ドキュメント](https://playwright.dev/)

---

**質問がある場合**: プロジェクトのREADME.mdまたはCLAUDE.mdを参照してください。
