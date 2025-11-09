# Data Model: 画像優先度ソートアプリ

**Feature**: 001-toy-priority-sorting
**Date**: 2025-11-09

## 概要

このドキュメントでは、画像と順序データの構造を定義します。すべてのデータはPC上のローカルファイルシステムに保存されます。

---

## エンティティ定義

### Picture

画像1枚を表すエンティティ。

**TypeScript型定義**:
```typescript
interface Picture {
  /** 画像ファイル名(ユニークID) */
  filename: string;

  /** オリジナル画像の相対パス */
  path: string;

  /** サムネイル画像の相対パス */
  thumbnailPath: string;

  /** 表示順序(0から開始、小さいほど上位) */
  order: number;

  /** 画像のメタデータ(オプション) */
  metadata?: {
    /** ファイルサイズ(バイト) */
    size: number;

    /** MIMEタイプ */
    mimeType: string;

    /** 最終更新日時(ISO 8601形式) */
    lastModified: string;
  };
}
```

**フィールド詳細**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|-----|------|-----|
| filename | string | ✅ | 画像ファイル名(拡張子含む)。ユニークキーとして機能 | "picture-01.jpg" |
| path | string | ✅ | オリジナル画像のパス(publicからの相対パス) | "/pictures/picture-01.jpg" |
| thumbnailPath | string | ✅ | サムネイル画像のパス(publicからの相対パス) | "/pictures/thumbnails/picture-01.jpg" |
| order | number | ✅ | 表示順序。0から開始、連番でなくても良い | 0, 1, 2, ... |
| metadata | object | ❌ | 画像のメタ情報(将来の拡張用) | - |

**バリデーションルール**:
- `filename`: 空文字列不可、重複不可
- `path`: 実在するファイルパスである必要あり
- `thumbnailPath`: 実在するファイルパスである必要あり(生成済み前提)
- `order`: 0以上の整数、重複可能(同じorderの場合はfilename順)

**状態遷移**:
なし(シンプルなデータ構造、状態を持たない)

---

### PictureOrder

画像の順序情報を保存するエンティティ。`data/order.json`ファイルとして永続化されます。

**TypeScript型定義**:
```typescript
interface PictureOrder {
  /** 順序付けられた画像のリスト */
  pictures: Picture[];

  /** 最終更新日時(ISO 8601形式) */
  lastUpdated: string;

  /** データフォーマットバージョン(将来の互換性のため) */
  version: string;
}
```

**フィールド詳細**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|-----|------|-----|
| pictures | Picture[] | ✅ | 順序付けられた画像配列。配列のインデックスが表示順序 | [Picture, ...] |
| lastUpdated | string | ✅ | 最後に並び替えが行われた日時(ISO 8601) | "2025-11-09T12:34:56.789Z" |
| version | string | ✅ | データフォーマットのバージョン(セマンティックバージョニング) | "1.0.0" |

**バリデーションルール**:
- `images`: 配列の要素数は0以上
- `lastUpdated`: 有効なISO 8601形式の日時文字列
- `version`: セマンティックバージョニング形式(MAJOR.MINOR.PATCH)

**JSONファイル例**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-09T12:34:56.789Z",
  "pictures": [
    {
      "filename": "picture-01.jpg",
      "path": "/pictures/picture-01.jpg",
      "thumbnailPath": "/pictures/thumbnails/picture-01.jpg",
      "order": 0,
      "metadata": {
        "size": 2048576,
        "mimeType": "image/jpeg",
        "lastModified": "2025-11-09T10:00:00.000Z"
      }
    },
    {
      "filename": "picture-02.png",
      "path": "/pictures/picture-02.png",
      "thumbnailPath": "/pictures/thumbnails/picture-02.png",
      "order": 1,
      "metadata": {
        "size": 1536000,
        "mimeType": "image/png",
        "lastModified": "2025-11-09T10:15:00.000Z"
      }
    }
  ]
}
```

---

## データフロー

### 1. 初回起動時

```
[public/pictures/] フォルダスキャン
    ↓
[画像ファイル検出]
    ↓
[サムネイル生成] (Sharp)
    ↓
[デフォルト順序で PictureOrder 作成]
    ↓
[data/order.json に保存]
```

### 2. 画像一覧表示

```
[GET /api/images] リクエスト
    ↓
[public/pictures/ フォルダスキャン]
    ↓
[data/order.json 読み込み]
    ↓
[マージ処理] (新規画像追加、削除画像除外)
    ↓
[Picture[] レスポンス]
```

### 3. 並び替え

```
[クライアント] ドラッグ&ドロップ
    ↓
[新しい順序配列作成]
    ↓
[PUT /api/order] リクエスト
    ↓
[PictureOrder 更新]
    ↓
[data/order.json 保存]
    ↓
[成功レスポンス]
```

---

## ファイルシステム構造

```
project-root/
├── public/
│   └── pictures/                  # 画像配置フォルダ
│       ├── picture-01.jpg         # オリジナル画像
│       ├── picture-02.png
│       └── thumbnails/            # サムネイル格納フォルダ
│           ├── picture-01.jpg     # 200x200 サムネイル
│           └── picture-02.png
│
└── data/
    └── order.json                 # 順序データ(PictureOrder)
```

**重要な注意事項**:
- `public/pictures/thumbnails/`はビルド時に自動生成
- `data/order.json`はアプリ初回起動時に自動生成
- Git管理: `data/order.json`と`public/pictures/thumbnails/`は.gitignoreに追加推奨

---

## エンティティ間の関係

```
PictureOrder (1)
    |
    | contains
    |
    v
Picture (0..N)
```

- PictureOrderは0個以上のPictureを保持
- PictureはPictureOrder内でのみ意味を持つ(独立では存在しない)
- 画像ファイルの追加/削除は、PictureOrder更新時に動的に反映

---

## データ整合性の保証

### 1. 新規画像の検出
`public/pictures/`フォルダに新しい画像が追加された場合:
- GET /api/images実行時に自動検出
- デフォルト順序(末尾)に追加
- 次回のPUT /api/orderで永続化

### 2. 削除画像の処理
`public/pictures/`フォルダから画像が削除された場合:
- GET /api/images実行時に自動検出
- order.jsonから該当Pictureを除外
- 順序の再計算は不要(既存の順序を維持)

### 3. 順序の重複
複数のPictureが同じorderを持つ場合:
- filename昇順でソート
- ただし、通常はorderは一意になるように管理

### 4. 破損したorder.jsonの復旧
- ファイルが存在しない、または不正なJSON: 新規作成
- versionフィールドがない: マイグレーション処理
- imagesが配列でない: 空配列として初期化

---

## 型定義ファイル

**ファイルパス**: `/lib/types.ts`

```typescript
/**
 * 画像のエンティティ
 */
export interface Picture {
  /** 画像ファイル名(ユニークID) */
  filename: string;

  /** オリジナル画像の相対パス */
  path: string;

  /** サムネイル画像の相対パス */
  thumbnailPath: string;

  /** 表示順序(0から開始) */
  order: number;

  /** 画像のメタデータ(オプション) */
  metadata?: {
    size: number;
    mimeType: string;
    lastModified: string;
  };
}

/**
 * 画像順序管理のエンティティ
 */
export interface PictureOrder {
  /** 順序付けられた画像のリスト */
  pictures: Picture[];

  /** 最終更新日時(ISO 8601形式) */
  lastUpdated: string;

  /** データフォーマットバージョン */
  version: string;
}

/**
 * API: PUT /api/order のリクエストボディ
 */
export interface UpdateOrderRequest {
  /** ファイル名の配列(新しい順序) */
  filenames: string[];
}

/**
 * API: GET /api/images のレスポンス
 */
export type GetImagesResponse = Picture[];

/**
 * API: GET /api/order のレスポンス
 */
export type GetOrderResponse = PictureOrder;

/**
 * API: PUT /api/order のレスポンス
 */
export type UpdateOrderResponse = PictureOrder;
```

---

## パフォーマンス考慮事項

### 1. ファイルシステムアクセス
- `public/pictures/`のスキャンは50枚以下を想定(数十ms)
- サムネイルはビルド時生成のため、ランタイムオーバーヘッドなし

### 2. JSONファイルサイズ
- 50枚の画像で約5-10KB(メタデータ含む)
- 読み書き速度は十分高速

### 3. メモリ使用量
- PictureOrder全体をメモリに保持しても問題なし(数KB)
- 画像ファイル自体はメモリに読み込まない

---

## セキュリティ考慮事項

### 1. パストラバーサル攻撃の防止
- filenameのバリデーション: `../`などの相対パス不可
- 許可リスト: 拡張子チェック(.jpg, .png, .gif, .webp)

### 2. ファイルサイズ制限
- オリジナル画像: 10MB以下を推奨
- サムネイル: 自動的に数十KB程度

### 3. ローカルネットワーク専用
- 外部公開を想定しない
- 認証・認可機能なし

---

## 今後の拡張性

現在のデータモデルは、以下の拡張に対応可能:

1. **画像のカテゴリ分類**: Pictureに`category: string`フィールド追加
2. **お気に入り機能**: Pictureに`favorite: boolean`フィールド追加
3. **複数の順序リスト**: PictureOrderを複数保存(例: 用途別、テーマ別)
4. **親子アカウント**: PictureOrderに`userId: string`フィールド追加

versionフィールドによりマイグレーションパスを確保済み。
