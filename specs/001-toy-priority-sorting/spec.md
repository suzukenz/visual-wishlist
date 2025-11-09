# Feature Specification: おもちゃ優先度ソートアプリ

**Feature Branch**: `001-toy-priority-sorting`
**Created**: 2025-11-09
**Status**: Draft
**Input**: User description: "３歳児の子供と一緒に、「どのおもちゃが欲しいか」を、おもちゃの写真を並び替えながら優先度を考えるためのアプリケーションです。

以下のように使われます。

- PCで、あらかじめおもちゃ画像を保存しておく
- スマートホンでアプリを起動し、画像を上下にドラッグ&ドロップで並び替える

非機能要件は以下です。

- ローカルネットワーク内でスマートホンからPC上のアプリにアクセスするだけ。
- 従って、画像やデータはPC端末内に保存される。ユーザー管理なども不要。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - おもちゃ画像の準備と表示 (Priority: P1)

親が指定フォルダにおもちゃの画像を格納し、アプリで画像一覧を確認できる。これによりスマートフォンで並び替える対象のおもちゃリストを準備する。

**Why this priority**: 並び替える前提として、おもちゃ画像の準備が必須。このストーリーがなければアプリは何も表示できない。

**Independent Test**: 指定フォルダに画像ファイルを配置し、PC上でアプリにアクセスして画像一覧が表示されることで独立してテスト可能。並び替え機能がなくても、画像表示機能単体で価値を提供する。

**Acceptance Scenarios**:

1. **Given** 指定フォルダにおもちゃ画像(jpg/png)を配置している、**When** PC上でアプリを開く、**Then** フォルダ内のすべての画像がサムネイルで一覧表示される
2. **Given** アプリを開いている、**When** 指定フォルダに新しい画像を追加する、**Then** アプリを更新すると新しい画像が一覧に表示される
3. **Given** アプリを開いている、**When** 指定フォルダから画像を削除する、**Then** アプリを更新するとその画像が一覧から消える

---

### User Story 2 - スマートフォンでの並び替え (Priority: P2)

親と子供が一緒にスマートフォン上でおもちゃ画像を上下にドラッグ&ドロップして並び替え、欲しいおもちゃの優先順位を決める。

**Why this priority**: 並び替え機能はアプリの主要価値。ただし、画像データがなければ並び替えできないため、P1の後に実装。

**Independent Test**: スマートフォンでアプリを開き(PC上の画像データを利用)、画像を上下にドラッグして順序を変更し、その順序が保存されることで独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** 指定フォルダに複数のおもちゃ画像が配置されている、**When** スマートフォンでアプリにアクセスする、**Then** おもちゃ画像が縦一列に表示される
2. **Given** おもちゃ画像が表示されている、**When** ある画像を指でタッチして上または下にドラッグする、**Then** 画像がドラッグした位置に移動する
3. **Given** 画像の順序を変更した、**When** 画面を離れて再度アプリを開く、**Then** 変更した順序が保持されている
4. **Given** おもちゃ画像が表示されている、**When** 最上位の画像を一番下に移動する、**Then** 他の画像の順序が適切に更新される

---

### Edge Cases

- 画像が1枚のみの場合、並び替え操作はどう扱われるか?(並び替え不可、または並び替えUIは表示されるが操作しても変化なし)
- 指定フォルダに画像が0枚の場合、何を表示するか?(「画像がありません」などのメッセージ表示)
- 画像ファイルサイズが非常に大きい場合、表示にどう対処するか?(サムネイル生成でパフォーマンスを確保)
- スマートフォンでドラッグ中にネットワークが切断された場合、並び替えはどう扱われるか?(操作を一時的に保留し、再接続時にサーバーに送信)
- サポートされる画像形式は?(jpg, png, gif, webpなど - 一般的なweb対応形式)
- 指定フォルダに画像以外のファイルが混在している場合、どう扱われるか?(画像ファイルのみを読み込み、他のファイルは無視)
- 画像の最大登録数に制限はあるか?(パフォーマンス考慮で50枚程度を推奨上限とする)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read toy images (jpg, png, gif, webp formats) from a designated folder on the PC
- **FR-002**: System MUST automatically detect and load all image files from the designated folder
- **FR-003**: System MUST display all detected toy images as thumbnails in a list view on PC
- **FR-004**: System MUST reflect changes when images are added to or removed from the designated folder (after page refresh)
- **FR-005**: System MUST serve the application over the local network so a smartphone can access it
- **FR-006**: System MUST display toy images in a vertical list on the smartphone
- **FR-007**: System MUST allow users to drag and drop toy images up and down on the smartphone to reorder them
- **FR-008**: System MUST persist the order of toy images after reordering
- **FR-009**: System MUST handle scenarios where no images exist in the designated folder (display appropriate message)
- **FR-010**: System MUST ignore non-image files in the designated folder
- **FR-011**: System MUST maintain image order persistence even after application restart
- **FR-012**: System MUST display the latest image list and order when the smartphone accesses the application

### Key Entities

- **Toy Image**: Represents a single toy photo from the designated folder
  - Unique identifier (filename from the designated folder)
  - Image file path (located in the designated folder on PC)
  - Display order/priority (integer value indicating position in the list)

- **Image List**: Represents the ordered collection of all toy images
  - Contains all toy images with their current order
  - Accessible from both PC and smartphone via local network
  - Order data persisted separately to PC local storage (e.g., JSON file)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 親が指定フォルダにおもちゃ画像5枚を配置し、1分以内にスマートフォンで確認できる
- **SC-002**: 3歳児が親のサポートを受けながら、5枚のおもちゃ画像の順序を1分以内で並び替えられる
- **SC-003**: 並び替えた順序がアプリ再起動後も100%保持される
- **SC-004**: スマートフォンでの画像のドラッグ&ドロップ操作が1秒以内に完了し、視覚的フィードバックが即座に表示される
- **SC-005**: 指定フォルダ内の画像読み込みから表示までが5秒以内に完了する(画像50枚、各5MB以下の場合)
- **SC-006**: 親と子供がアプリを使用して、「欲しいおもちゃの優先順位」についての会話を促進できる(質的評価)

## Assumptions

- ユーザーは基本的なPC操作(ファイルをフォルダに移動、ブラウザ操作)ができる
- 画像を格納する指定フォルダのパスは、アプリ起動時に設定または自動生成される
- ローカルネットワーク環境は安定しており、PCとスマートフォンが同じネットワークに接続されている
- PCは常時起動しており、アプリサーバーとして機能する
- 1度に1つの端末からのみアクセスする(複数デバイスの同時アクセスは想定しない)
- 画像の最適なサムネイルサイズは自動生成される
- 3歳児の操作を前提とするため、ドラッグ&ドロップのUIは大きなタッチターゲット(最小44x44px)を確保する
- ユーザー管理や認証は不要(ローカルネットワーク内のみでアクセス制限不要)
- データバックアップ機能は初期スコープ外(将来的な拡張として検討可能)
