'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './sortable-item'
import type { Picture } from '@/lib/types'

/**
 * スマートフォン用並び替えページ
 *
 * dnd-kitを使用してドラッグ&ドロップで画像を並び替えます。
 * 順序の変更はPUT /api/orderエンドポイントで保存されます。
 */
export default function SortPage(): React.JSX.Element {
  const [pictures, setPictures] = useState<Picture[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // dnd-kit sensors: タッチとマウス両方に対応
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8pxドラッグしてから反応(誤操作防止)
      },
    })
  )

  // 外部システムとの同期: コンテキストメニューを無効化
  useEffect(() => {
    const handleContextMenu = (e: Event): void => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // 外部システムとの同期: APIから画像一覧を取得
  useEffect(() => {
    async function fetchImages(): Promise<void> {
      try {
        const response = await fetch('/api/images')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data: Picture[] = await response.json()
        setPictures(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  // ドラッグ終了時の処理
  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // 楽観的UI更新: ドラッグ結果をすぐに反映
    const oldIndex = pictures.findIndex((p) => p.filename === active.id)
    const newIndex = pictures.findIndex((p) => p.filename === over.id)
    const newPictures = arrayMove(pictures, oldIndex, newIndex)
    setPictures(newPictures)

    // サーバーに順序を保存
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filenames: newPictures.map((p) => p.filename),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save order')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save order')
      // エラー時は元の順序に戻す
      const response = await fetch('/api/images')
      const data: Picture[] = await response.json()
      setPictures(data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (pictures.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-2">画像がありません</p>
          <p className="text-sm text-gray-500">public/pictures/フォルダに画像を配置してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-12 py-2">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー: コンパクトに */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">画像の並び替え</h1>
        </div>

        {/* エラー・保存中表示 */}
        {error && (
          <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {saving && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-800">保存中...</p>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pictures.map((p) => p.filename)}
            strategy={verticalListSortingStrategy}
          >
            {/* 画像リスト: 左右に余白を確保してスクロール可能に */}
            <div className="space-y-2">
              {pictures.map((picture, index) => (
                <SortableItem key={picture.filename} id={picture.filename} picture={picture} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {pictures.length === 1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              画像が1枚のみです。並び替えはできません。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
