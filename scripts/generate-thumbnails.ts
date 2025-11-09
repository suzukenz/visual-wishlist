import sharp from 'sharp'
import { readdir, mkdir, stat } from 'fs/promises'
import { join } from 'path'

/**
 * サムネイル生成スクリプト
 *
 * public/pictures/内の画像ファイルをスキャンし、
 * public/pictures/thumbnails/に高画質なサムネイルを生成します。
 *
 * サムネイルサイズ: 800x800 (高画質優先)
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
          const ext = file.toLowerCase().substring(file.lastIndexOf('.'))
          const resized = sharp(inputPath).resize(800, 800, {
            fit: 'cover',
            position: 'center',
            kernel: sharp.kernel.lanczos3, // 高品質なリサイズアルゴリズム
          })

          // 元の画像形式に応じて適切なフォーマットで出力
          // 画質を最優先に設定
          switch (ext) {
            case '.png':
              await resized
                .png({
                  quality: 100,
                  compressionLevel: 6, // 圧縮レベルを下げて画質優先
                  palette: false, // パレット圧縮を無効化して画質優先
                })
                .toFile(outputPath)
              break
            case '.webp':
              await resized
                .webp({
                  quality: 95, // 高画質設定
                  lossless: false,
                  nearLossless: false,
                })
                .toFile(outputPath)
              break
            case '.gif':
              // GIFは静止画として最初のフレームをPNGに変換
              await resized
                .png({
                  quality: 100,
                  compressionLevel: 6,
                  palette: false,
                })
                .toFile(outputPath.replace(/\.gif$/i, '.png'))
              break
            case '.jpg':
            case '.jpeg':
            default:
              await resized
                .jpeg({
                  quality: 95, // 高画質設定
                  mozjpeg: true,
                  chromaSubsampling: '4:4:4', // 色情報の間引きを最小化
                })
                .toFile(outputPath)
              break
          }

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
