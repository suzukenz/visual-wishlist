import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { PictureOrder, Picture } from './types'

/**
 * 順序データファイルのパス
 */
const ORDER_FILE_PATH = join(process.cwd(), 'data/order.json')

/**
 * 現在のデータフォーマットバージョン
 */
const CURRENT_VERSION = '1.0.0'

/**
 * data/order.jsonから順序情報を読み込む
 *
 * ファイルが存在しない場合は、デフォルトの空の順序を返す
 *
 * @returns PictureOrder
 */
export async function loadOrder(): Promise<PictureOrder> {
  try {
    const data = await readFile(ORDER_FILE_PATH, 'utf-8')
    const order: PictureOrder = JSON.parse(data)

    // バージョンチェック(将来のマイグレーション用)
    if (!order.version) {
      console.warn('⚠️  order.json has no version field. Adding default version.')
      order.version = CURRENT_VERSION
    }

    return order
  } catch {
    // ファイルが存在しない、または不正なJSONの場合はデフォルトを返す
    console.log('No existing order.json found. Creating new order.')
    return {
      version: CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
      pictures: [],
    }
  }
}

/**
 * data/order.jsonに順序情報を保存
 *
 * @param order - 保存する順序情報
 */
export async function saveOrder(order: PictureOrder): Promise<void> {
  const dataDir = join(process.cwd(), 'data')

  // dataディレクトリが存在しない場合は作成
  await mkdir(dataDir, { recursive: true })

  // lastUpdatedを現在時刻に更新
  const updatedOrder: PictureOrder = {
    ...order,
    lastUpdated: new Date().toISOString(),
    version: CURRENT_VERSION,
  }

  await writeFile(ORDER_FILE_PATH, JSON.stringify(updatedOrder, null, 2), 'utf-8')
}

/**
 * 画像リストと順序データをマージ
 *
 * - 新規画像: デフォルト順序(末尾)に追加
 * - 削除画像: 順序データから除外
 * - 既存画像: 順序を維持
 *
 * @param currentPictures - ファイルシステムから取得した現在の画像リスト
 * @param savedOrder - 保存されている順序データ
 * @returns マージされた画像リスト(順序適用済み)
 */
export function mergeImagesWithOrder(
  currentPictures: Picture[],
  savedOrder: PictureOrder
): Picture[] {
  // ファイル名をキーとしたマップを作成
  const currentPicturesMap = new Map(currentPictures.map((pic) => [pic.filename, pic]))

  // 保存されている順序から、現在存在する画像のみを抽出
  const existingPictures: Picture[] = []
  for (const savedPic of savedOrder.pictures) {
    const currentPic = currentPicturesMap.get(savedPic.filename)
    if (currentPic) {
      // 順序を保持しつつ、メタデータは最新のものを使用
      existingPictures.push({
        ...currentPic,
        order: savedPic.order,
      })
      currentPicturesMap.delete(savedPic.filename)
    }
  }

  // 新規画像を末尾に追加
  const newPictures = Array.from(currentPicturesMap.values())
  const maxOrder = existingPictures.length > 0 ? Math.max(...existingPictures.map((p) => p.order)) : -1
  const newPicturesWithOrder = newPictures.map((pic, index) => ({
    ...pic,
    order: maxOrder + 1 + index,
  }))

  // 既存画像と新規画像を結合
  const mergedPictures = [...existingPictures, ...newPicturesWithOrder]

  // order値で昇順ソート
  mergedPictures.sort((a, b) => a.order - b.order)

  return mergedPictures
}
