import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import type { Picture } from './types'

/**
 * サポートされている画像形式のホワイトリスト
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const

/**
 * 推奨される最大ファイルサイズ(バイト)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * ファイル名がパストラバーサル攻撃を含まないかチェック
 *
 * @param filename - チェックするファイル名
 * @returns 安全な場合はtrue
 */
function isValidFilename(filename: string): boolean {
  // 相対パス(.., ./)を含まないことを確認
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }

  // 許可された拡張子のみを受け入れ
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
}

/**
 * ファイルのMIMEタイプを拡張子から推測
 *
 * @param filename - ファイル名
 * @returns MIMEタイプ
 */
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

/**
 * public/pictures/フォルダ内のすべての画像ファイルをスキャン
 *
 * @returns 画像ファイル名の配列
 */
export async function scanImageFiles(): Promise<string[]> {
  const picturesDir = join(process.cwd(), 'public/pictures')

  try {
    const files = await readdir(picturesDir)

    // ホワイトリストで画像ファイルのみをフィルタリング
    const imageFiles = files.filter((file) => isValidFilename(file))

    return imageFiles
  } catch (error) {
    console.error('Failed to scan image directory:', error)
    return []
  }
}

/**
 * 画像ファイルのメタデータを取得
 *
 * @param filename - ファイル名
 * @returns メタデータまたはundefined
 */
export async function getImageMetadata(
  filename: string
): Promise<Picture['metadata'] | undefined> {
  const filePath = join(process.cwd(), 'public/pictures', filename)

  try {
    const stats = await stat(filePath)

    // ファイルサイズが推奨制限を超える場合は警告
    if (stats.size > MAX_FILE_SIZE) {
      console.warn(`⚠️  ${filename} exceeds recommended size (${stats.size} bytes)`)
    }

    return {
      size: stats.size,
      mimeType: getMimeType(filename),
      lastModified: stats.mtime.toISOString(),
    }
  } catch (error) {
    console.error(`Failed to get metadata for ${filename}:`, error)
    return undefined
  }
}

/**
 * サムネイルのファイル名を取得
 * GIFファイルの場合はPNGに変換される
 *
 * @param filename - 元のファイル名
 * @returns サムネイルのファイル名
 */
function getThumbnailFilename(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  if (ext === '.gif') {
    return filename.replace(/\.gif$/i, '.png')
  }
  return filename
}

/**
 * すべての画像をPictureエンティティの配列として取得
 * (順序適用前のデフォルト状態)
 *
 * @returns Picture配列
 */
export async function getAllImagesWithoutOrder(): Promise<Picture[]> {
  const filenames = await scanImageFiles()

  const pictures: Picture[] = await Promise.all(
    filenames.map(async (filename, index) => {
      const metadata = await getImageMetadata(filename)
      const thumbnailFilename = getThumbnailFilename(filename)

      return {
        filename,
        path: `/pictures/${filename}`,
        thumbnailPath: `/pictures/thumbnails/${thumbnailFilename}`,
        order: index,
        metadata,
      }
    })
  )

  return pictures
}
