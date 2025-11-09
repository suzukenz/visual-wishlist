import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'

/**
 * ルートページ
 *
 * デバイス判定とリダイレクトを行います。
 *
 * 優先順位:
 * 1. Cookie保存のユーザー選択 (100%精度)
 * 2. User-Agent解析 (70-90%精度)
 * 3. デフォルト = デスクトップUI (安全側)
 *
 * - PC: /images (画像一覧表示)
 * - スマートフォン: /sort (並び替えUI)
 */
export default async function HomePage(): Promise<never> {
  const cookieStore = await cookies()
  const viewMode = cookieStore.get('viewMode')?.value

  // Cookie優先: ユーザーが手動で選択した表示モード
  if (viewMode === 'mobile') {
    redirect('/sort')
  } else if (viewMode === 'desktop') {
    redirect('/images')
  }

  // Cookie未設定の場合はUser-Agent解析
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)

  if (isMobile) {
    redirect('/sort')
  } else {
    redirect('/images')
  }
}
