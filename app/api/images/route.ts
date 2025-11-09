import { NextResponse } from 'next/server'
import { getAllImagesWithoutOrder } from '@/lib/image-service'
import { loadOrder, mergeImagesWithOrder } from '@/lib/order-service'
import type { GetImagesResponse } from '@/lib/types'

/**
 * GET /api/images
 *
 * 画像一覧を取得します。
 *
 * 処理フロー:
 * 1. public/pictures/フォルダをスキャン
 * 2. data/order.jsonから順序情報を読み込み
 * 3. 新規画像を検出し、デフォルト順序で追加
 * 4. 削除された画像を除外
 * 5. 順序でソートして返却
 */
export async function GET(): Promise<NextResponse<GetImagesResponse | { error: string; message: string }>> {
  try {
    // ファイルシステムから画像をスキャン
    const currentPictures = await getAllImagesWithoutOrder()

    // 保存されている順序情報を読み込み
    const savedOrder = await loadOrder()

    // 画像リストと順序データをマージ
    const mergedPictures = mergeImagesWithOrder(currentPictures, savedOrder)

    return NextResponse.json(mergedPictures)
  } catch (error) {
    console.error('Failed to get images:', error)
    return NextResponse.json(
      {
        error: 'Failed to read images directory',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
