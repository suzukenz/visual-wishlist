import Image from 'next/image'
import { ViewSwitcher } from '@/app/components/view-switcher'
import type { Picture } from '@/lib/types'

/**
 * 画像一覧を取得(サーバーサイド)
 */
async function getImages(): Promise<Picture[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/images`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Failed to fetch images:', response.statusText)
    return []
  }

  return response.json()
}

/**
 * PC用画像一覧表示ページ
 *
 * public/pictures/内の画像をサムネイルで一覧表示します。
 * 順序は保存されている順序データに従います。
 */
export default async function ImagesPage(): Promise<React.JSX.Element> {
  const pictures = await getImages()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">画像一覧</h1>

        {pictures.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">画像がありません</p>
            <p className="text-sm text-gray-500 mt-2">
              public/pictures/フォルダに画像を配置してください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pictures.map((picture) => (
              <div
                key={picture.filename}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-square">
                  <Image
                    src={picture.thumbnailPath}
                    alt={picture.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 truncate" title={picture.filename}>
                    {picture.filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">順序: {picture.order + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            画像の並び替えはスマートフォンから行えます
          </p>
        </div>
      </div>

      <ViewSwitcher />
    </div>
  )
}
