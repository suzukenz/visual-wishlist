<!--
Sync Impact Report:
Version: 1.0.0 (Initial creation)
Rationale: Initial constitution establishing core development standards for visual-wishlist
Modified principles: N/A (initial creation)
Added sections:
  - Core Principle: Type Safety & Code Quality
  - Core Principle: Minimal Implementation
Templates requiring updates:
  ✅ plan-template.md - reviewed, constitution check section present
  ✅ spec-template.md - reviewed, compatible with quality standards
  ✅ tasks-template.md - reviewed, compatible with implementation workflow
Follow-up TODOs: None
-->

# Project Constitution: visual-wishlist

**Version**: 1.0.0
**Ratified**: 2025-11-09
**Last Amended**: 2025-11-09
**Project**: visual-wishlist
**Tech Stack**: Next.js 16.0.1, React 19.2.0, TypeScript 5

---

## Preamble

本憲章は、visual-wishlistプロジェクトにおける開発の基本原則を定めます。すべての機能実装、コード変更、設計判断は、以下に定める原則に準拠しなければなりません。

---

## Core Principles

### Principle 1: Type Safety & Code Quality

**Statement**:
すべての実装は型安全性を維持し、静的解析チェックに合格しなければなりません。

**Rules**:

- 実装完了後、必ず以下のコマンドを実行し、すべてのチェックに合格すること
  - `pnpm run typecheck` - TypeScriptの型チェック
  - `pnpm run lint` - ESLintによる静的解析
- 型定義には明示的な型アノテーションを使用し、`any`型の使用は禁止
- 推論可能な場合でも、関数の引数と戻り値には型を明示すること
- すべての警告はエラーとして扱い、解決してからコミットすること

**Rationale**:
型安全性と静的解析により、実行時エラーを未然に防ぎ、コードの保守性と信頼性を確保します。明示的な型定義は、コードの意図を明確にし、チーム全体の理解を促進します。

---

### Principle 2: Minimal Implementation

**Statement**:
実装は必要最小限とし、過度な抽象化や将来の拡張のための事前準備を避けます。

**Rules**:

- YAGNI (You Aren't Gonna Need It) 原則に従い、現在必要な機能のみを実装すること
- デザインパターンやアーキテクチャパターンは、明確な理由がある場合のみ導入すること
- 新しい依存関係の追加は、既存の手段で解決できないことを確認してから行うこと
- コードの重複が3回以上発生した場合に抽象化を検討すること(Rule of Three)

**Rationale**:
シンプルな実装は理解しやすく、保守しやすく、バグの混入を防ぎます。過度な抽象化は複雑性を増大させ、開発速度を低下させます。

---

### Principle 3: React useEffect Discipline

**Statement**:
`useEffect`は外部システムとの同期にのみ使用し、それ以外の用途での使用を禁止します。

**Rules**:

- `useEffect`を使用できるケース:
  - API呼び出し、WebSocket接続
  - ブラウザAPI(localStorage、DOM操作など)
  - 外部ストアのサブスクリプション
  - タイマー(setTimeout、setIntervalなど)
- `useEffect`を使用してはならないケース:
  - propsや派生値をローカルstateにコピーする
  - フラグの変更に応じてロジックを実行する
  - ユーザーアクションをeffect内で処理する
  - 派生値やバリデーション状態をeffect内で更新する
  - 空の依存配列による1回限りの初期化(代わりに`useMemo`を使用)
- すべての`useEffect`には、どの外部リソースと同期しているかを説明するコメントを付けること

**Rationale**:
`useEffect`の誤用は予期しない再レンダリング、パフォーマンス問題、バグの原因となります。外部システムとの同期に限定することで、Reactの宣言的な性質を維持し、コードの予測可能性を高めます。

---

## Governance

### Amendment Process

1. 憲章の修正提案は、プロジェクトメンバー全員にレビューを依頼する
2. 修正内容が以下のいずれかに該当する場合、バージョンを適切にインクリメントする:
   - MAJOR: 後方互換性のない原則の削除または再定義
   - MINOR: 新しい原則の追加、または既存原則の大幅な拡張
   - PATCH: 文言の明確化、誤字修正、意味を変えない改善
3. 修正が承認されたら、`LAST_AMENDED_DATE`を更新日に変更する
4. Sync Impact Reportを更新し、影響を受けるテンプレートやドキュメントを更新する

### Version Control

- 憲章のバージョンはセマンティックバージョニング(MAJOR.MINOR.PATCH)に従う
- すべての変更はgit履歴に記録され、追跡可能とする
- 重要な変更の場合、チーム全体に通知する

### Compliance Review

- すべての機能実装前に、plan-template.mdの"Constitution Check"セクションで準拠性を確認する
- 原則に違反する実装が必要な場合、"Complexity Tracking"セクションで正当化する
- コードレビュー時に憲章への準拠を確認する

### Enforcement

- プルリクエストマージ前に、`typecheck`と`lint`の合格を必須とする
- CIパイプラインで自動チェックを実行する
- 違反が発見された場合、即座に修正する

---

## Interpretation

本憲章に明記されていない事項については、以下の優先順位で判断します:

1. Next.js、React、TypeScriptの公式ベストプラクティス
2. プロジェクトの既存コードとの一貫性
3. シンプルさと保守性の原則

疑問がある場合は、チームで議論し、必要に応じて憲章を更新します。

---

*この憲章は、visual-wishlistプロジェクトの品質と一貫性を保つための基盤です。すべての開発者は、この原則を理解し、遵守する責任があります。*
