import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

/**
 * ルートページ
 *
 * デバイス判定とリダイレクトを行います。
 *
 * User-Agent解析によりデバイスタイプを判定します(70-90%精度):
 * - PC: /images (画像一覧表示)
 * - スマートフォン: /sort (並び替えUI)
 */
export default async function HomePage(): Promise<never> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)

  if (isMobile) {
    redirect('/sort')
  } else {
    redirect('/images')
  }
}
