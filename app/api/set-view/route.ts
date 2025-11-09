import { NextRequest, NextResponse } from 'next/server'

interface SetViewRequest {
  mode: 'mobile' | 'desktop'
}

/**
 * POST /api/set-view
 *
 * ユーザーの表示モード設定をCookieに保存します。
 *
 * @param request - viewMode設定リクエスト
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string; message: string }>> {
  try {
    const body: SetViewRequest = await request.json()

    if (body.mode !== 'mobile' && body.mode !== 'desktop') {
      return NextResponse.json(
        {
          error: 'Invalid mode',
          message: 'mode must be either "mobile" or "desktop"',
        },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true })

    // Cookieを設定(1年間有効)
    response.cookies.set('viewMode', body.mode, {
      maxAge: 31536000, // 1年 = 365日 * 24時間 * 60分 * 60秒
      path: '/',
      httpOnly: false, // クライアントサイドでも読み取り可能
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Failed to set view mode:', error)
    return NextResponse.json(
      {
        error: 'Failed to set view mode',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
