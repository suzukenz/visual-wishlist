/**
 * 画像のエンティティ
 */
export interface Picture {
  /** 画像ファイル名(ユニークID) */
  filename: string

  /** オリジナル画像の相対パス */
  path: string

  /** サムネイル画像の相対パス */
  thumbnailPath: string

  /** 表示順序(0から開始) */
  order: number

  /** 画像のメタデータ(オプション) */
  metadata?: {
    size: number
    mimeType: string
    lastModified: string
  }
}

/**
 * 画像順序管理のエンティティ
 */
export interface PictureOrder {
  /** 順序付けられた画像のリスト */
  pictures: Picture[]

  /** 最終更新日時(ISO 8601形式) */
  lastUpdated: string

  /** データフォーマットバージョン */
  version: string
}

/**
 * API: PUT /api/order のリクエストボディ
 */
export interface UpdateOrderRequest {
  /** ファイル名の配列(新しい順序) */
  filenames: string[]
}

/**
 * API: GET /api/images のレスポンス
 */
export type GetImagesResponse = Picture[]

/**
 * API: GET /api/order のレスポンス
 */
export type GetOrderResponse = PictureOrder

/**
 * API: PUT /api/order のレスポンス
 */
export type UpdateOrderResponse = PictureOrder
