import { NextRequest, NextResponse } from 'next/server'
import { loadOrder, saveOrder } from '@/lib/order-service'
import { getAllImagesWithoutOrder } from '@/lib/image-service'
import type { GetOrderResponse, UpdateOrderRequest, UpdateOrderResponse, PictureOrder } from '@/lib/types'

/**
 * GET /api/order
 *
 * 現在の画像順序情報を取得します。
 *
 * ファイルが存在しない場合は、デフォルト順序で新規作成します。
 */
export async function GET(): Promise<NextResponse<GetOrderResponse | { error: string; message: string }>> {
  try {
    const order = await loadOrder()
    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to get order:', error)
    return NextResponse.json(
      {
        error: 'Failed to read order data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/order
 *
 * 画像の並び順を更新し、data/order.jsonに保存します。
 *
 * 処理フロー:
 * 1. リクエストボディからファイル名配列を取得
 * 2. 既存の画像情報とマージ
 * 3. 新しいorder値を割り当て
 * 4. data/order.jsonに保存
 * 5. 更新後のPictureOrderを返却
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<UpdateOrderResponse | { error: string; message: string }>> {
  try {
    const body: UpdateOrderRequest = await request.json()

    // バリデーション: filenamesが配列であることを確認
    if (!Array.isArray(body.filenames)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'filenames must be an array',
        },
        { status: 400 }
      )
    }

    // ファイルシステムから現在の画像を取得
    const currentPictures = await getAllImagesWithoutOrder()
    const currentFilenames = new Set(currentPictures.map((p) => p.filename))

    // リクエストのファイル名が実在するかチェック
    const invalidFilenames = body.filenames.filter((filename) => !currentFilenames.has(filename))
    if (invalidFilenames.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid filenames',
          message: `One or more filenames do not exist: ${invalidFilenames.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // 新しい順序を作成
    const updatedPictures = body.filenames.map((filename, index) => {
      const picture = currentPictures.find((p) => p.filename === filename)!
      return {
        ...picture,
        order: index,
      }
    })

    // 新しい順序データを保存
    const newOrder: PictureOrder = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      pictures: updatedPictures,
    }

    await saveOrder(newOrder)

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      {
        error: 'Failed to update order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
