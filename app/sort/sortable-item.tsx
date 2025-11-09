'use client'

import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Picture } from '@/lib/types'

interface SortableItemProps {
  id: string
  picture: Picture
  index: number
}

/**
 * ドラッグ&ドロップ可能な画像アイテムコンポーネント
 *
 * dnd-kitのuseSortableフックを使用して、
 * タッチとマウスの両方でドラッグ可能なアイテムを実装します。
 *
 * @param id - ソート可能なアイテムのID(filename)
 * @param picture - 画像データ
 * @param index - リスト内のインデックス(表示用)
 */
export function SortableItem({ id, picture, index }: SortableItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md overflow-hidden relative ${
        isDragging ? 'shadow-xl z-10' : ''
      }`}
    >
      {/* 画像をメインに配置 (縦横比を2:1に変更) */}
      <div className="relative w-full aspect-[2/1] bg-gray-100">
        <Image
          src={picture.thumbnailPath}
          alt={picture.filename}
          fill
          className="object-contain pointer-events-none select-none"
          sizes="100vw"
          draggable={false}
        />

        {/* 透明なドラッグ可能エリア: 画像全体に配置してコンテキストメニューを防ぐ */}
        <div
          className="absolute inset-0 touch-none"
          style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
          {...attributes}
          {...listeners}
        />

        {/* ドラッグハンドル(画像上部に配置) - 視覚的なインジケーター */}
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md pointer-events-none">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>

        {/* 順序番号(画像上部右に配置) */}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md pointer-events-none">
          <p className="text-sm font-bold text-gray-900">{index + 1}</p>
        </div>

        {/* ファイル名(画像下部に配置) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none">
          <p className="text-xs text-white truncate">{picture.filename}</p>
        </div>
      </div>
    </div>
  )
}
