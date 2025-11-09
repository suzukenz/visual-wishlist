# Tasks: おもちゃ優先度ソートアプリ

**Input**: Design documents from `/specs/001-toy-priority-sorting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: テストは明示的にリクエストされていないため、このタスクリストには含まれていません。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テストできるようになっています。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能(異なるファイル、依存関係なし)
- **[Story]**: このタスクが属するユーザーストーリー(US1, US2など)
- 説明には正確なファイルパスを含める

## Path Conventions

- Next.js App Router構造: `app/`, `lib/`
- すべてのパスはリポジトリルートからの相対パス

---

## Phase 1: Setup (共有インフラストラクチャ)

**目的**: プロジェクトの初期化と基本構造の構築

- [ ] T001 Next.js 16.0.1プロジェクトを初期化し、package.jsonを設定
- [ ] T002 [P] TypeScript 5、React 19.2.0、Tailwind CSS 4の依存関係をインストール
- [ ] T003 [P] dnd-kit依存関係(@dnd-kit/core@^6.3.1, @dnd-kit/sortable@^8.0.0, @dnd-kit/utilities@^3.2.2)をインストール
- [ ] T004 [P] Sharp(^0.33.0)をインストール
- [ ] T005 [P] 開発依存関係(vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/dom, vite-tsconfig-paths, @playwright/test, tsx)をインストール
- [ ] T006 [P] vitest.config.mtsを作成し、React Testing Libraryのセットアップを含める
- [ ] T007 [P] playwright.config.tsを作成し、ブラウザ設定を含める
- [ ] T008 [P] ESLintとPrettier設定ファイルを作成
- [ ] T009 必要なディレクトリ構造(app/, lib/, public/pictures/, public/pictures/thumbnails/, data/, scripts/)を作成
- [ ] T010 [P] .gitignoreにpublic/pictures/thumbnails/, data/order.json, coverage/, playwright-report/, test-results/を追加
- [ ] T011 [P] package.jsonのスクリプトセクションを更新(dev, build, start, lint, typecheck, generate-thumbnails, test, test:e2e)

---

## Phase 2: Foundational (ブロッキング前提条件)

**目的**: すべてのユーザーストーリーを実装する前に完了する必要があるコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

- [ ] T012 lib/types.tsに型定義(Picture, PictureOrder, UpdateOrderRequest, GetImagesResponse, GetOrderResponse, UpdateOrderResponse)を作成
- [ ] T013 scripts/generate-thumbnails.tsにサムネイル生成スクリプトを実装(Sharp使用、200x200、並列処理4並列)
- [ ] T014 lib/image-service.tsに画像ファイル読み込みロジックの基盤を作成(ファイルシステムスキャン、画像形式バリデーション)
- [ ] T015 lib/order-service.tsに順序データ永続化の基盤を作成(JSON読み書き、デフォルト順序生成)
- [ ] T016 app/page.tsxにルートページを作成(デバイス判定とリダイレクトのプレースホルダー)

**チェックポイント**: 基盤準備完了 - ユーザーストーリーの実装を並列で開始可能

---

## Phase 3: User Story 1 - 画像の準備と表示 (Priority: P1) 🎯 MVP

**ゴール**: 親が指定フォルダに画像を格納し、PC上でアプリを開いて画像一覧を確認できる

**独立テスト**: public/pictures/に画像ファイルを配置し、PC上でhttp://localhost:3000にアクセスして画像一覧が表示されることを確認

### User Story 1の実装

- [ ] T017 [P] [US1] lib/image-service.tsにgetAllImages関数を実装(public/pictures/スキャン、画像ファイル検出、メタデータ取得)
- [ ] T018 [P] [US1] lib/order-service.tsにloadOrder関数を実装(data/order.jsonの読み込み、存在しない場合は新規作成)
- [ ] T019 [US1] lib/order-service.tsにmergeImagesWithOrder関数を実装(画像リストと順序データのマージ、新規画像の追加、削除画像の除外)
- [ ] T020 [US1] app/api/images/route.tsにGET /api/imagesエンドポイントを実装(画像一覧取得、順序適用、エラーハンドリング)
- [ ] T021 [US1] app/api/order/route.tsにGET /api/orderエンドポイントを実装(順序情報取得、デフォルト生成)
- [ ] T022 [US1] app/images/page.tsxにPC用画像一覧表示ページを実装(サムネイル表示、グリッドレイアウト、Tailwind CSSスタイリング)
- [ ] T023 [US1] app/page.tsxにPC判定ロジックを実装(User-Agent解析、/imagesへのリダイレクト)
- [ ] T024 [US1] app/images/page.tsxに「画像がありません」メッセージの表示を追加(0枚の場合)
- [ ] T025 [US1] lib/image-service.tsにファイルサイズバリデーションを追加(10MB以下を推奨)
- [ ] T026 [US1] サムネイル生成スクリプトを実行し、public/pictures/thumbnails/に画像が生成されることを確認

**チェックポイント**: この時点で、User Story 1は完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - スマートフォンでの並び替え (Priority: P2)

**ゴール**: 親と子供が一緒にスマートフォン上で画像をドラッグ&ドロップして並び替え、優先順位を決める

**独立テスト**: スマートフォンでhttp://[PC-IP]:3000にアクセスし、画像をドラッグして順序を変更し、その順序が保存されることを確認

### User Story 2の実装

- [ ] T027 [US2] lib/order-service.tsにsaveOrder関数を実装(data/order.jsonへの順序保存、lastUpdated更新)
- [ ] T028 [US2] app/api/order/route.tsにPUT /api/orderエンドポイントを実装(順序更新、バリデーション、エラーハンドリング)
- [ ] T029 [US2] app/sort/page.tsxにスマートフォン用並び替えページの基盤を作成('use client'ディレクティブ、基本レイアウト)
- [ ] T030 [US2] app/sort/page.tsxにdnd-kitのDndContextとSortableContextを実装(PointerSensor、verticalListSortingStrategy、closestCenter)
- [ ] T031 [US2] app/sort/page.tsxにSortableItemコンポーネントを実装(useSortable、CSS transform、タッチターゲット44x44px確保)
- [ ] T032 [US2] app/sort/page.tsxにonDragEndハンドラを実装(arrayMove、PUT /api/order呼び出し、楽観的UI更新)
- [ ] T033 [US2] app/page.tsxにスマートフォン判定ロジックを実装(User-Agent解析、/sortへのリダイレクト)
- [ ] T034 [US2] app/sort/page.tsxに画像の縦一列表示スタイルを実装(Tailwind CSS、モバイル最適化)
- [ ] T035 [US2] app/sort/page.tsxにドラッグ中の視覚的フィードバックを追加(ドラッグ中のアイテムのスタイル変更)
- [ ] T036 [US2] app/sort/page.tsxにローディング状態とエラーハンドリングを追加(順序保存中のスピナー、エラーメッセージ表示)
- [ ] T037 [US2] app/sort/page.tsxに1枚のみの場合のエッジケース処理を追加(並び替えUI表示、操作しても変化なしメッセージ)
- [ ] T038 [US2] package.jsonのdevスクリプトを確認し、-H 0.0.0.0オプションが含まれることを確認(ローカルネットワークアクセス有効化)

**チェックポイント**: この時点で、User Story 1とUser Story 2の両方が独立して動作

---

## Phase 5: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善と仕上げ

- [ ] T039 [P] app/components/ViewSwitcher.tsxにデバイス切り替えUIコンポーネントを実装(PC/スマートフォン手動切り替え、Cookie保存)
- [ ] T040 [P] app/api/set-view/route.tsにPOST /api/set-viewエンドポイントを実装(viewMode Cookieの設定、max-age: 31536000)
- [ ] T041 [P] app/page.tsxにCookie優先のデバイス判定ロジックを実装(Cookie → User-Agent → デフォルトPC)
- [ ] T042 [P] app/images/page.tsxとapp/sort/page.tsxにViewSwitcherコンポーネントを追加(画面右下に固定配置)
- [ ] T043 [P] lib/image-service.tsにパストラバーサル攻撃防止のバリデーションを追加(../の相対パス不可)
- [ ] T044 [P] lib/image-service.tsに拡張子ホワイトリストチェックを追加(.jpg, .jpeg, .png, .gif, .webp)
- [ ] T045 [P] app/sort/page.tsxに最小タッチターゲット44x44pxの確認を追加(3歳児操作考慮)
- [ ] T046 [P] すべてのuseEffectにコメントを追加(同期対象の外部リソースを説明)
- [ ] T047 README.mdを作成(プロジェクト概要、セットアップ手順、quickstart.mdへのリンク)
- [ ] T048 エラーハンドリングの一貫性を確認(すべてのAPIルートで適切なHTTPステータスコード)
- [ ] T049 Tailwind CSSのパフォーマンス最適化(未使用クラスのパージ確認)
- [ ] T050 アクセシビリティの基本確認(画像のalt属性、適切なARIA属性)

### Constitution Compliance (必須)

**目的**: すべての実装がプロジェクトの憲章に準拠していることを確認

- [ ] T051 `pnpm run typecheck`を実行し、すべての型エラーを修正
- [ ] T052 `pnpm run lint`を実行し、すべてのlintエラーを修正
- [ ] T053 すべての`useEffect`の使用が外部システムとの同期のみに限定されていることを確認
- [ ] T054 コードベースに`any`型が残っていないことを確認
- [ ] T055 すべての関数に明示的な型アノテーションがあることを確認

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3+)**: すべてFoundationalフェーズの完了に依存
  - ユーザーストーリーは並列で進行可能(スタッフが確保できる場合)
  - または優先順位順に逐次実行(P1 → P2)
- **Polish (Final Phase)**: すべての希望するユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2)の後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2)の後に開始可能 - US1と統合するが、独立してテスト可能

### Within Each User Story

- モデル → サービス → エンドポイント → UI
- コア実装 → 統合 → エッジケース処理
- ストーリー完了後、次の優先度へ移行

### Parallel Opportunities

- Setupフェーズの[P]マーク付きタスクはすべて並列実行可能
- Foundationalフェーズ内の[P]マーク付きタスクは並列実行可能
- Foundationalフェーズ完了後、すべてのユーザーストーリーを並列開始可能(チーム容量がある場合)
- User Story 1内のT017, T018は並列実行可能(異なるファイル)
- 異なるユーザーストーリーは異なるチームメンバーで並列作業可能

---

## Parallel Example: User Story 1

```bash
# User Story 1のサービス層を並列で起動:
Task: "lib/image-service.tsにgetAllImages関数を実装"
Task: "lib/order-service.tsにloadOrder関数を実装"

# User Story 1のAPIルートを並列で起動:
Task: "app/api/images/route.tsにGET /api/imagesエンドポイントを実装"
Task: "app/api/order/route.tsにGET /api/orderエンドポイントを実装"
```

---

## Implementation Strategy

### MVP First (User Story 1のみ)

1. Phase 1: Setup を完了
2. Phase 2: Foundational を完了(重要 - すべてのストーリーをブロック)
3. Phase 3: User Story 1 を完了
4. **停止して検証**: User Story 1を独立してテスト
5. 準備ができていればデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational を完了 → 基盤準備完了
2. User Story 1を追加 → 独立してテスト → デプロイ/デモ(MVP!)
3. User Story 2を追加 → 独立してテスト → デプロイ/デモ
4. 各ストーリーが以前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. ストーリーは独立して完了し、統合

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルはタスクを特定のユーザーストーリーにマッピング(トレーサビリティのため)
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、独立性を壊すストーリー間の依存関係
