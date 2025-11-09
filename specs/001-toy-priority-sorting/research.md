# Research: おもちゃ優先度ソートアプリ 技術調査

**Date**: 2025-11-09
**Feature**: 001-toy-priority-sorting

## 概要

Next.js 16 + React 19環境で、3歳児向けおもちゃ優先度ソートアプリを構築するための技術選定調査を実施しました。

---

## 1. ドラッグ&ドロップライブラリ

### 決定: **dnd-kit**

**選定バージョン**: @dnd-kit/core 6.3.1

### 選定理由

1. **タッチデバイス完全対応**: HTML5 DnD APIを使用せず独自実装のため、スマートフォンでネイティブ動作
2. **軽量**: 10KB minified、依存関係ゼロ
3. **React 19対応**: `'use client'`ディレクティブで現時点でも使用可能
4. **垂直リスト最適化**: `verticalListSortingStrategy`が標準提供
5. **優れたパフォーマンス**: GPU加速CSS、50枚の画像でも問題なし
6. **アクセシビリティ**: ARIA属性、キーボード対応標準装備

### 代替案として検討したもの

- **react-beautiful-dnd**: 2025年8月に非推奨化、React 19非対応
- **react-dnd**: React 19で型エラー、タッチ対応に追加設定必要、バンドルサイズ大
- **Native HTML5 DnD API**: タッチデバイス非対応(致命的)
- **Pragmatic drag and drop**: React 19非対応、タッチデバイスで深刻な問題

### 実装方針

```typescript
'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

**必要な依存関係**:
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## 2. サムネイル生成方法

### 決定: **Sharp (ビルド時生成)**

**選定バージョン**: sharp ^0.33.0

### 選定理由

1. **圧倒的なパフォーマンス**: 50枚を約4.5秒で処理(1枚あたり約90ms)
2. **Next.js 16標準**: 内部で使用されているため完全互換
3. **簡単なセットアップ**: プリコンパイル済みバイナリで`npm install`のみ
4. **低メモリ使用量**: ストリーミング処理で効率的
5. **豊富なフォーマット対応**: jpg, png, gif(静止画), webp すべてサポート
6. **高品質出力**: 最適化アルゴリズムが優秀

### 代替案として検討したもの

- **next/image最適化API**: ビルド時生成不可、ランタイムのみ
- **Canvas API**: Sharpより2倍遅い、セットアップ複雑
- **Jimp**: Sharpより21倍遅い、50枚処理には不向き

### 実装方針

**ビルド時生成スクリプト**:
```typescript
// scripts/generate-thumbnails.ts
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

async function generateThumbnails() {
  const sourceDir = join(process.cwd(), 'public/toys');
  const thumbDir = join(process.cwd(), 'public/toys/thumbnails');

  await mkdir(thumbDir, { recursive: true });

  const files = await readdir(sourceDir);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
  );

  const concurrency = 4;

  for (let i = 0; i < imageFiles.length; i += concurrency) {
    const batch = imageFiles.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (file) => {
        const inputPath = join(sourceDir, file);
        const outputPath = join(thumbDir, file);

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
      })
    );
  }
}
```

**package.jsonスクリプト**:
```json
{
  "scripts": {
    "generate-thumbnails": "tsx scripts/generate-thumbnails.ts",
    "prebuild": "npm run generate-thumbnails",
    "dev": "npm run generate-thumbnails && next dev -H 0.0.0.0"
  }
}
```

**キャッシング戦略**:
- ビルド時に`public/toys/thumbnails/`に生成
- Cache-Control: `public, max-age=31536000, immutable`
- 画像追加時は`npm run generate-thumbnails`を手動実行

---

## 3. デバイス判定方法

### 決定: **ハイブリッドアプローチ (User-Agent + 手動切り替え)**

### 選定理由

1. **初期表示高速**: サーバーサイドUser-Agent解析でハイドレーションエラーなし
2. **ユーザー自由度**: 手動切り替えで100%精度を実現
3. **段階的エンハンスメント**: JavaScript無効でも基本機能動作
4. **Next.js 16最適**: App Router + Server Componentsとの親和性

### 実装方針

**優先順位**:
```
1. Cookie保存のユーザー選択 (100%精度)
   ↓ (未設定の場合)
2. User-Agent解析 (70-90%精度)
   ↓ (判定失敗の場合)
3. デフォルト = デスクトップUI (安全側)
```

**サーバーサイド実装**:
```typescript
import { headers, cookies } from 'next/headers'
import { userAgent } from 'next/server'

export default async function Page() {
  // ユーザー選択を優先
  const cookieStore = cookies()
  const userChoice = cookieStore.get('viewMode')?.value

  // User-Agent解析
  const ua = userAgent({ headers: headers() })
  const detectedDevice = ua.device.type === 'mobile' ? 'mobile' : 'desktop'

  const viewMode = userChoice || detectedDevice

  return viewMode === 'mobile' ? <MobileUI /> : <DesktopUI />
}
```

**手動切り替えUI**:
```typescript
// components/ViewSwitcher.tsx
'use client'

export function ViewSwitcher() {
  const switchView = async (mode: 'mobile' | 'desktop') => {
    await fetch('/api/set-view', {
      method: 'POST',
      body: JSON.stringify({ mode })
    })
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={() => switchView('mobile')}>📱</button>
      <button onClick={() => switchView('desktop')}>🖥️</button>
    </div>
  )
}
```

### 代替案として検討したもの

- **画面サイズ検出のみ**: SSRで画面サイズ不明、ハイドレーションエラーのリスク
- **手動選択のみ**: 初回訪問時のUX摩擦が大きい

---

## 4. テストフレームワーク

### 決定: **Vitest + Playwright (併用)**

### 選定理由

#### Vitest (ユニット・統合テスト)
1. **React 19完全サポート**: 最新版で対応
2. **Next.js 16公式推奨**: 公式ドキュメントで推奨
3. **高速実行**: Jestの4倍速、メモリ使用量30%削減
4. **簡単セットアップ**: 最小限の設定で動作

#### Playwright (E2Eテスト)
1. **ドラッグ&ドロップに最適**: 組み込み`dragTo()`メソッド
2. **実ブラウザ環境**: 最も信頼性の高いテスト
3. **async Server Components対応**: Vitestで未対応の部分をカバー
4. **Next.js 16公式推奨**: 公式テンプレート提供

### 実装方針

**Vitestセットアップ**:
```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom vite-tsconfig-paths
```

**vitest.config.mts**:
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

**Playwrightセットアップ**:
```bash
npm init playwright
```

**テスト戦略**:
- **70%**: Vitestでユニット・統合テスト(高速、低コスト)
- **30%**: Playwrightでクリティカルパステスト(信頼性、実環境)

### 代替案として検討したもの

- **Jestのみ**: React 19で依存関係競合、セットアップ複雑、実行速度遅い
- **Playwrightのみ**: ユニットテストにはオーバースペック

---

## 技術スタック最終決定

| カテゴリ | 選定技術 | バージョン |
|---------|---------|-----------|
| ドラッグ&ドロップ | dnd-kit | ^6.3.1 |
| サムネイル生成 | Sharp | ^0.33.0 |
| デバイス判定 | User-Agent + Cookie | Next.js組み込み |
| ユニットテスト | Vitest + React Testing Library | latest |
| E2Eテスト | Playwright | latest |

### 追加の依存関係

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "vitest": "latest",
    "@vitejs/plugin-react": "latest",
    "jsdom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/dom": "latest",
    "vite-tsconfig-paths": "latest",
    "@playwright/test": "latest",
    "tsx": "^4.0.0"
  }
}
```

---

## 実装上の注意事項

### 1. dnd-kit使用時
- Next.js App Routerでは`'use client'`ディレクティブ必須
- PointerSensorでタッチ&マウス両対応
- 3歳児向けに最小タッチターゲット44x44px確保

### 2. Sharp使用時
- 同時実行数を4並列に制限(メモリ管理)
- quality: 80, mozjpeg: true で最適化
- Git管理: `public/toys/thumbnails/`は.gitignoreに追加

### 3. デバイス判定
- Cookieのmax-age: 1年(31536000秒)
- iPad等タブレットはデスクトップ扱い
- ローカルネットワークでも正常動作

### 4. テスト実装
- async Server ComponentsはPlaywrightでテスト
- ドラッグ&ドロップの複雑なシナリオもPlaywright
- APIルート、ユーティリティ関数はVitest

---

## 次のステップ

Phase 1でこれらの技術選定に基づいて以下を作成:
1. data-model.md: ToyImage, ImageOrderエンティティの詳細定義
2. contracts/: APIエンドポイント仕様(OpenAPI)
3. quickstart.md: 開発環境セットアップ手順
