'use client'

import { useState } from 'react'

/**
 * デバイス切り替えUIコンポーネント
 *
 * PC/スマートフォン表示を手動で切り替えるためのUIを提供します。
 * 選択はCookieに保存され、次回アクセス時も維持されます。
 */
export function ViewSwitcher(): React.JSX.Element {
  const [switching, setSwitching] = useState(false)

  const switchView = async (mode: 'mobile' | 'desktop'): Promise<void> => {
    setSwitching(true)

    try {
      await fetch('/api/set-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      })

      // Cookieが設定されたらページをリロード
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch view:', error)
      setSwitching(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <button
        onClick={() => switchView('desktop')}
        disabled={switching}
        className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
        title="PC表示に切り替え"
        aria-label="PC表示に切り替え"
      >
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      <button
        onClick={() => switchView('mobile')}
        disabled={switching}
        className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
        title="スマートフォン表示に切り替え"
        aria-label="スマートフォン表示に切り替え"
      >
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
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  )
}
