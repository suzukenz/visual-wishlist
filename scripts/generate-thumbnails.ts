import sharp from 'sharp'
import { readdir, mkdir, stat } from 'fs/promises'
import { join } from 'path'

/**
 * サムネイル生成スクリプト
 *
 * public/pictures/内の画像ファイルをスキャンし、
 * public/pictures/thumbnails/に200x200のサムネイルを生成します。
 *
 * 実行方法:
 * pnpm run generate-thumbnails
 */
async function generateThumbnails(): Promise<void> {
  const sourceDir = join(process.cwd(), 'public/pictures')
  const thumbDir = join(process.cwd(), 'public/pictures/thumbnails')

  // ソースディレクトリの存在確認
  try {
    await stat(sourceDir)
  } catch {
    console.log('⚠️  public/pictures/ directory does not exist. Skipping thumbnail generation.')
    return
  }

  // サムネイルディレクトリ作成
  await mkdir(thumbDir, { recursive: true })

  // 画像ファイルの取得
  const files = await readdir(sourceDir)
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))

  if (imageFiles.length === 0) {
    console.log('⚠️  No images found in public/pictures/. Skipping thumbnail generation.')
    return
  }

  console.log(`Found ${imageFiles.length} images`)

  // 同時実行数の制限(メモリ管理のため4並列に制限)
  const concurrency = 4

  for (let i = 0; i < imageFiles.length; i += concurrency) {
    const batch = imageFiles.slice(i, i + concurrency)

    await Promise.all(
      batch.map(async (file) => {
        const inputPath = join(sourceDir, file)
        const outputPath = join(thumbDir, file)

        try {
          await sharp(inputPath)
            .resize(200, 200, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({
              quality: 80,
              mozjpeg: true,
            })
            .toFile(outputPath)

          console.log(`✓ Generated: ${file}`)
        } catch (error) {
          console.error(`✗ Failed to generate thumbnail for ${file}:`, error)
        }
      })
    )
  }

  console.log(`✓ Generated ${imageFiles.length} thumbnails`)
}

generateThumbnails().catch(console.error)
