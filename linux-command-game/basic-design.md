# Linux Command Quest 基本設計書

## 1. 目的

本ドキュメントは、Linux Command QuestのMVP開発に必要な基本設計を定義する。

要件定義書で定めた機能を、実装可能なコンポーネント、データ構造、画面、処理フローに分解し、開発時の判断基準とする。

## 2. システム構成

### 2.1 全体構成

MVPはブラウザのみで動作するクライアントサイドアプリケーションとする。

```text
Browser
  |
  +-- App Controller
  |     |
  |     +-- Screen State Manager
  |     +-- Command Input Controller
  |     +-- Mission Controller
  |
  +-- Linux Screen Renderer
  |     |
  |     +-- Canvas Terminal Renderer
  |     +-- Vi Viewer Renderer
  |     +-- Boot Sequence Renderer
  |
  +-- Learning UI Renderer
  |     |
  |     +-- Mission Panel
  |     +-- Hint Panel
  |     +-- Incident Alert
  |
  +-- Command Engine
  |     |
  |     +-- Command Parser
  |     +-- Command Dispatcher
  |     +-- Command Handlers
  |
  +-- Virtual Linux Environment
        |
        +-- Virtual File System
        +-- Path Resolver
        +-- Command History
        +-- Incident Detector
```

### 2.2 実行環境

- ブラウザ
- HTML
- CSS
- JavaScriptまたはTypeScript
- Canvas API

実OS、実シェル、実ファイルシステム、実ネットワークには接続しない。

## 3. 画面設計

### 3.1 画面一覧

| 画面 | 説明 |
| --- | --- |
| Boot Screen | CLI起動画面 |
| Top Menu | ASCIIアートタイトルとメニュー |
| Manual Viewer | `vi manual.txt` で開く説明画面 |
| Game Screen | ミッションを進めるメイン画面 |
| Progress Screen | ミッション進捗を確認する画面 |
| Typing Practice Screen | 意味とコマンドを見ながら練習する画面 |
| Challenge Screen | 意味だけを見て20問を解く本番タイムアタック画面 |
| Challenge Result Screen | タイムアタック結果画面 |
| Result Overlay | ミッション完了時の結果表示 |
| Incident Overlay | 危険操作時の警告表示 |

### 3.2 Boot Screen

#### 役割

ゲーム開始時に、Linux環境へ接続し学習システムが起動する雰囲気を演出する。

#### 表示内容

- 自動タイピングされるコマンド
- 接続ログ
- 起動ログ
- ローディング表示

#### 代表表示

```text
$ ssh trainee@linux-command-quest.local
Connecting...
Welcome to Linux Command Quest

$ ./start-training.sh
Loading virtual filesystem...
Loading missions...
Starting terminal trainer...
```

#### 遷移

- 起動演出完了後、Top Menuへ遷移する
- Enterやクリックで演出スキップを許可してもよい

### 3.3 Top Menu

#### 役割

ゲーム開始、マニュアル表示、クレジット表示をCLI入力で選択させる。

#### 表示内容

- ASCIIアートタイトル
- メニュー
- コマンドプロンプト

#### 入力

| 入力 | 遷移 |
| --- | --- |
| `start` | Game Screen |
| `1` | Game Screen |
| `manual` | Manual Viewer |
| `2` | Manual Viewer |
| `vi manual.txt` | Manual Viewer |
| `credits` | Credits表示 |
| `3` | Credits表示 |
| `progress` | Progress Screen |
| `4` | Progress Screen |
| `resume` | Game Screen |
| `5` | Game Screen |
| `typing` | Typing Practice Screen |
| `6` | Typing Practice Screen |
| `challenge` | Challenge Screen |
| `7` | Challenge Screen |
| その他 | ヘルプ表示 |

### 3.4 Manual Viewer

#### 役割

遊び方、世界観、コマンドの基本を `vi` 風に表示する。

#### 仕様

- 閲覧専用
- 編集不可
- インサートモードなし
- 入力欄には `:` を事前表示しない
- 学習者が `:q!` または `:wq` を自分で入力する
- `:q!` または `:wq` でTop Menuへ戻る
- 末尾に終了方法を表示する

#### 入力

| 入力 | 処理 |
| --- | --- |
| `:q!` | Top Menuへ戻る |
| `:wq` | Top Menuへ戻る |
| `i` | 閲覧専用メッセージ |
| `a` | 閲覧専用メッセージ |
| `o` | 閲覧専用メッセージ |
| その他 | 未対応メッセージ |

### 3.5 Game Screen

#### 役割

仮想Linux環境でコマンドを入力し、ミッションを達成する。

#### レイヤー

```text
Canvas / Linux Screen Layer
  - terminal history
  - prompt
  - command result
  - errors
  - vi viewer

Floating Learning UI Layer
  - mission text
  - goals
  - hints
  - score
  - incident meter
  - translucent panel with light background blur
```

#### ゲーム制御入力

| 入力 | 処理 |
| --- | --- |
| `exit` | セッションを保持してTop Menuへ戻る |
| `progress` | Progress Screenを表示する |
| `next` | クリア済みミッションから次へ進む |
| `restart` | 新しいゲームとして最初から始める |

### 3.6 Progress Screen

#### 役割

現在のミッション進行状況を、ゲーム画面とは別のCLI風ページとして表示する。

#### 表示内容

- スコア
- リスク状態
- 現在の作業ディレクトリ
- 完了済みミッション数
- 各ミッションの状態

#### 入力

| 入力 | 処理 |
| --- | --- |
| `exit` | 前の画面へ戻る |
| `back` | 前の画面へ戻る |
| `:q!` | 前の画面へ戻る |
| `:wq` | 前の画面へ戻る |
| `start` | 新しいゲームを開始する |

### 3.7 Typing Practice Screen

#### 役割

Linuxコマンドの意味とコマンド文字列を同時に表示し、反復入力によって基本コマンドを覚える。

#### 表示内容

- モード名
- 現在の問題番号
- コマンドの意味
- 入力するコマンド
- 入力中の文字列
- 正誤フィードバック
- 正解数
- ミスタイピング数

#### 入力

| 入力 | 処理 |
| --- | --- |
| 正解コマンド | 次の問題へ進む |
| 不一致の入力 | 誤入力として表示する |
| `exit` | Top Menuへ戻る |

### 3.8 Challenge Screen

#### 役割

20問の本番タイムアタックを行う。意味だけを表示し、対応するコマンドを素早く入力させる。

#### 表示内容

- モード名
- 問題番号
- 全20問中の進捗
- コマンドの意味
- 入力中の文字列
- 経過時間
- ペナルティ秒
- 正答数
- 誤答数

#### 入力

| 入力 | 処理 |
| --- | --- |
| 正解コマンド | 次の問題へ進む |
| Enter時の不正解コマンド | 1秒ペナルティを加算し、同じ問題を継続 |
| `exit` | 本番を中断してTop Menuへ戻る |

### 3.9 Challenge Result Screen

#### 表示内容

- 素の経過時間
- ペナルティ秒
- 最終タイム
- 正答数
- 誤答数
- 正確率
- ランク

#### 入力

| 入力 | 処理 |
| --- | --- |
| `challenge` | 再挑戦する |
| `typing` | 練習モードへ移動する |
| `exit` | Top Menuへ戻る |

## 4. 状態設計

### 4.1 AppState

```ts
type AppState = {
  screen: "boot" | "top" | "manual" | "game" | "progress" | "typing" | "challenge" | "challenge-result" | "result";
  terminal: TerminalState;
  linux: VirtualLinuxState;
  mission: MissionState;
  typing: TypingState;
  ui: UiState;
};
```

### 4.2 TerminalState

```ts
type TerminalState = {
  lines: TerminalLine[];
  input: string;
  history: string[];
  historyIndex: number | null;
};
```

### 4.3 VirtualLinuxState

```ts
type VirtualLinuxState = {
  currentPath: string;
  fileSystem: FileNode;
};
```

### 4.4 MissionState

```ts
type MissionState = {
  currentMissionId: string;
  completedMissionIds: string[];
  hintIndex: number;
  failedAttempts: number;
  score: number;
  incidentLevel: number;
  gameStarted: boolean;
};
```

### 4.5 TypingState

```ts
type TypingState = {
  mode: "practice" | "challenge" | null;
  questions: TypingQuestion[];
  currentIndex: number;
  correctCount: number;
  mistakeCount: number;
  startedAt: number | null;
  endedAt: number | null;
  penaltySeconds: number;
};
```

### 4.6 UiState

```ts
type UiState = {
  bootCompleted: boolean;
  showMissionPanel: boolean;
  showHintPanel: boolean;
  activeOverlay: "none" | "incident" | "result";
};
```

## 5. データ設計

### 5.1 FileNode

```ts
type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  mode: string;
  owner: string;
  group: string;
  children?: Record<string, FileNode>;
};
```

### 5.2 TerminalLine

```ts
type TerminalLine = {
  kind: "input" | "output" | "error" | "warning" | "success" | "system";
  text: string;
  timestamp: number;
};
```

### 5.3 CommandResult

```ts
type CommandResult = {
  ok: boolean;
  lines: TerminalLine[];
  statePatch?: Partial<VirtualLinuxState>;
  incident?: IncidentEvent;
};
```

### 5.4 Mission

```ts
type Mission = {
  id: string;
  title: string;
  description: string;
  startPath: string;
  goals: MissionGoal[];
  hints: string[];
  dangerRules: DangerRule[];
  completionMessage: string;
};
```

### 5.5 MissionGoal

```ts
type MissionGoal =
  | { type: "commandExecuted"; command: string }
  | { type: "currentPath"; path: string }
  | { type: "fileExists"; path: string }
  | { type: "fileMode"; path: string; mode: string };
```

### 5.6 IncidentEvent

```ts
type IncidentEvent = {
  level: "notice" | "warning" | "incident";
  title: string;
  message: string;
  command: string;
  scorePenalty: number;
};
```

### 5.7 TypingQuestion

```ts
type TypingQuestion = {
  id: string;
  meaning: string;
  command: string;
  category: "navigation" | "file-read" | "file-operation" | "permission" | "process" | "system" | "manual";
  difficulty: "basic" | "intermediate" | "advanced";
};
```

### 5.8 ChallengeResult

```ts
type ChallengeResult = {
  elapsedSeconds: number;
  penaltySeconds: number;
  finalSeconds: number;
  correctCount: number;
  mistakeCount: number;
  accuracy: number;
  rank: "S" | "A" | "B" | "C";
};
```

## 6. モジュール設計

### 6.1 App Controller

#### 役割

アプリ全体の状態と画面遷移を管理する。

#### 主な処理

- 初期化
- 画面遷移
- 入力イベントの受け渡し
- 描画更新
- ミッション進行の制御

### 6.2 Command Input Controller

#### 役割

入力欄のイベントを処理する。

#### 主な処理

- Enterで入力を確定する
- 上下キーで履歴を移動する
- 現在画面に応じて入力先を切り替える
- 空入力を無視する

### 6.3 Command Parser

#### 役割

入力文字列をコマンド名と引数に分解する。

#### 処理例

```text
cp app.conf app.conf.bak
```

```ts
{
  command: "cp",
  args: ["app.conf", "app.conf.bak"]
}
```

#### 制約

- MVPではパイプ、リダイレクト、サブシェルを解析しない
- クォート処理は必要最小限とする
- 入力文字列を実行可能コードとして扱わない

### 6.4 Command Dispatcher

#### 役割

解析済みコマンドを対応するハンドラーに振り分ける。

#### 許可コマンド

- `pwd`
- `ls`
- `cd`
- `cat`
- `cp`
- `chmod`
- `vi`
- `clear`
- `help`

### 6.5 Command Handlers

#### 役割

各コマンドの仮想実行を行う。

#### ハンドラー一覧

| ハンドラー | 処理 |
| --- | --- |
| `executePwd` | 現在パスを返す |
| `executeLs` | ディレクトリ内容を返す |
| `executeCd` | 現在パスを変更する |
| `executeCat` | ファイル内容を返す |
| `executeCp` | 仮想ファイルをコピーする |
| `executeChmod` | 仮想権限を変更する |
| `executeVi` | 閲覧画面へ遷移する |
| `executeClear` | ターミナル表示を消去する |
| `executeHelp` | 使用可能コマンドを表示する |

### 6.6 Virtual File System

#### 役割

仮想Linux環境のファイル、ディレクトリ、権限を管理する。

#### 主な処理

- パス解決
- ノード取得
- ファイルコピー
- 権限変更
- ファイル存在確認
- ディレクトリ一覧取得

### 6.7 Mission Controller

#### 役割

ミッション進行と達成判定を管理する。

#### 主な処理

- 現在ミッションの取得
- コマンド実行後の達成判定
- ヒント表示
- 成功処理
- スコア反映

### 6.8 Incident Detector

#### 役割

危険操作を検知し、ゲーム内イベントに変換する。

#### 主な検知対象

- `chmod 777`
- `chmod -R 777 /`
- 未対応の危険コマンド
- ミッションで禁止された操作
- バックアップ前の変更

### 6.9 Typing Controller

#### 役割

タイピング練習モードと本番タイムアタックモードの出題、回答判定、タイム計測、結果集計を管理する。

#### 主な処理

- 練習問題セットの読み込み
- 練習モードの現在問題管理
- 本番モード用の20問ランダム抽出
- 入力コマンドの完全一致判定
- Enter時の不正解回数の記録
- 本番モードの経過時間計測
- 1ミス1秒のペナルティ加算
- 結果ランクの算出

### 6.10 Renderer

#### 役割

CanvasとHTML UIを描画する。

#### 分担

- Linux Screen Renderer: CLI画面、ログ、プロンプトを描画
- Boot Sequence Renderer: 自動タイピング演出を描画
- Vi Viewer Renderer: マニュアル閲覧画面を描画
- Progress Renderer: 進捗ページを描画
- Typing Practice Renderer: 意味とコマンドを表示する練習画面を描画
- Challenge Renderer: 意味、タイマー、ペナルティを表示する本番画面を描画
- Challenge Result Renderer: タイムアタック結果を描画
- Learning UI Renderer: ミッション、ヒント、警告を描画

## 7. 処理フロー

### 7.1 起動フロー

```text
アプリ起動
  -> 初期状態生成
  -> Boot Screen表示
  -> 自動タイピング演出
  -> Top Menu表示
  -> 入力待ち
```

### 7.2 ゲーム開始フロー

```text
Top Menuで start 入力
  -> ミッション初期化
  -> 仮想ファイルシステム初期化
  -> Game Screen表示
  -> プロンプト表示
  -> 入力待ち
```

### 7.3 コマンド実行フロー

```text
コマンド入力
  -> Command Parser
  -> Command Dispatcher
  -> Incident Detector
  -> Command Handler
  -> Virtual Linux State更新
  -> Terminal Lines追加
  -> Mission Controllerで達成判定
  -> Renderer更新
```

### 7.4 マニュアル表示フロー

```text
manual または vi manual.txt 入力
  -> Manual Viewer表示
  -> マニュアル本文表示
  -> 入力欄には : を事前表示しない
  -> 学習者が :q! または :wq 入力
  -> Top Menuへ戻る
```

### 7.5 ゲーム離脱フロー

```text
Game Screenで exit 入力
  -> セッション状態を保持
  -> Top Menu表示
  -> resume 入力でGame Screenへ戻る
```

### 7.6 進捗確認フロー

```text
progress 入力
  -> Progress Screen表示
  -> スコア、リスク、現在ミッション、完了状況を表示
  -> exit または back 入力
  -> 呼び出し元の画面へ戻る
```

### 7.7 タイピング練習フロー

```text
Top Menuで typing 入力
  -> Typing Practice Screen表示
  -> 問題の意味と正解コマンドを表示
  -> 学習者がコマンドを入力
  -> 完全一致なら正解として次の問題へ進む
  -> 不一致なら誤入力としてフィードバック
  -> exit 入力でTop Menuへ戻る
```

### 7.8 本番タイムアタックフロー

```text
Top Menuで challenge 入力
  -> 練習問題セットから20問をランダム抽出
  -> Challenge Screen表示
  -> タイマー開始
  -> コマンドの意味のみを表示
  -> 学習者がコマンドを入力
  -> 正解なら次の問題へ進む
  -> Enter時に不正解ならミス数を増やし1秒ペナルティを加算
  -> 20問完了
  -> Challenge Result Screen表示
```

### 7.9 インシデントフロー

```text
危険操作入力
  -> Incident Detector検知
  -> 実操作は行わない
  -> Terminalに警告表示
  -> Learning UIにアラート表示
  -> スコア減点
  -> 必要に応じてヒント表示
```

## 8. コマンド詳細設計

### 8.1 `pwd`

- 引数なし
- `currentPath` を表示する
- 引数がある場合は警告または無視

### 8.2 `ls`

- 引数なしの場合、`currentPath` の内容を表示する
- 引数ありの場合、対象パスの内容を表示する
- ファイル指定時はファイル名を表示する
- 存在しないパスはエラー
- MVPでは `-l` 対応を任意とする

### 8.3 `cd`

- `cd path` で `currentPath` を変更する
- `cd ..` を解釈する
- 相対パスと絶対パスに対応する
- ファイルへ移動しようとした場合はエラー

### 8.4 `cat`

- `cat file` でファイル内容を表示する
- ディレクトリ指定はエラー
- 存在しないファイルはエラー

### 8.5 `cp`

- `cp source dest` に対応する
- MVPではファイルコピーのみ対応する
- コピー先が存在する場合は上書き警告を検討する
- ディレクトリコピーは未対応

### 8.6 `chmod`

- `chmod mode file` に対応する
- modeは3桁数値のみ対応する
- `777` は警告対象
- `-R` は未対応または重大警告

### 8.7 `vi`

- `vi manual.txt` でManual Viewerを開く
- その他のファイルも閲覧専用で表示可能にする
- 編集は不可
- 入力欄に `:` を事前表示しない
- `:q!`、`:wq` で閉じる
- `i`、`a`、`o` は閲覧専用メッセージを返す

### 8.8 ゲーム制御コマンド

Linuxコマンドではなく、ゲームの画面遷移を制御する入力として扱う。

- `exit`: Game ScreenからTop Menuへ戻る
- `progress`: Progress Screenを表示する
- `resume`: Top Menuから中断中のGame Screenへ戻る
- `next`: クリア済みミッションから次へ進む
- `restart`: 新しいゲームとして初期化する

## 9. ミッション設計

### 9.1 MVPミッション

| ID | タイトル | 主なコマンド |
| --- | --- | --- |
| `mission-001` | 現在地を確認する | `pwd` |
| `mission-002` | 指定ディレクトリへ移動する | `cd`, `ls` |
| `mission-003` | 設定ファイルをバックアップする | `cp` |
| `mission-004` | 実行権限を付与する | `chmod` |

### 9.2 達成判定

達成判定は、コマンド履歴と仮想ファイルシステム状態をもとに行う。

例:

- `pwd` が実行された
- 現在パスが指定パスである
- 指定ファイルが存在する
- 指定ファイルの権限が `755` である

### 9.3 ヒント

ヒントは3段階とする。

1. 使うコマンド名だけを示す
2. 引数の考え方を示す
3. 入力例に近い形を示す

### 9.4 タイピング問題セット

タイピング練習と本番タイムアタックは、同じ `TypingQuestion` データを使用する。

| ID | 意味 | コマンド | カテゴリ |
| --- | --- | --- | --- |
| `type-001` | 現在のディレクトリを表示する | `pwd` | navigation |
| `type-002` | ファイル一覧を表示する | `ls` | navigation |
| `type-003` | ディレクトリを移動する | `cd` | navigation |
| `type-004` | ファイルの内容を表示する | `cat` | file-read |
| `type-005` | ファイルをコピーする | `cp` | file-operation |
| `type-006` | ファイルやディレクトリを移動、または名前変更する | `mv` | file-operation |
| `type-007` | ファイルやディレクトリを削除する | `rm` | file-operation |
| `type-008` | ディレクトリを作成する | `mkdir` | file-operation |
| `type-009` | 空のファイルを作成する | `touch` | file-operation |
| `type-010` | 画面を消去する | `clear` | navigation |
| `type-011` | ファイル内の文字列を検索する | `grep` | file-read |
| `type-012` | ファイルやディレクトリを探す | `find` | file-read |
| `type-013` | ファイル権限を変更する | `chmod` | permission |
| `type-014` | ファイルをエディタで開く | `vi` | manual |

タイピングゲームはコマンド名を覚えることを目的とするため、オプションやパラメータは省略する。画面には「※これはコマンドを覚えるゲームなのでオプションやパラメータは、省略しています」と表示する。

本番タイムアタックでは、この問題セットから重複を許容して20問をランダムに出題する。将来的に問題数が20問以上になった場合は、重複なしのランダム出題を優先する。

不正解時は、正解コマンドの先頭から1文字ずつヒントを表示する。例: `ls` の場合、1回目は「lから始まる2文字です」、2回目は「lsから始まる2文字です」と表示する。

## 10. スコア設計

### 10.1 基本方針

スコアは速さよりも、安全な操作と確認行動を評価する。

タイピング本番モードでは、通常ミッションのスコアとは別に、最終タイムと正確率を主な評価軸とする。

### 10.2 加点

- 正しいコマンドを実行
- `pwd`、`ls`、`cat` などで事前確認
- ミッション達成
- 危険操作を避けてクリア

### 10.3 減点

- ヒント使用
- 存在しないパスを何度も指定
- 危険操作
- ミッション外の破壊的操作

### 10.4 タイムアタック採点

```text
最終タイム = 経過時間 + ペナルティ秒
ペナルティ秒 = Enter時の不正解回数 * 1秒
正確率 = 正答数 / 入力回数
```

#### ランク

| ランク | 条件 |
| --- | --- |
| S | 最終タイム60秒以内、正確率95%以上 |
| A | 最終タイム90秒以内、正確率90%以上 |
| B | 最終タイム120秒以内、正確率80%以上 |
| C | それ以外 |

## 11. エラー設計

### 11.1 表示方針

Linux風メッセージと日本語補足を組み合わせる。

例:

```text
cd: /home/foo: No such file or directory
ヒント: 指定したディレクトリが存在しません。ls で候補を確認してみましょう。
```

### 11.2 エラー種別

| 種別 | 例 |
| --- | --- |
| 未対応コマンド | `command not found` |
| パス不正 | `No such file or directory` |
| 対象種別不正 | `Not a directory` |
| 引数不足 | `missing operand` |
| 危険操作 | ゲーム内警告 |

## 12. 初期データ

### 12.1 初期ファイルシステム

```text
/
  home/
    trainee/
      projects/
        readme.txt
        app.conf
        deploy.sh
      logs/
        access.log
        error.log
  etc/
    myapp/
      app.conf
  var/
    log/
      syslog
      nginx/
        access.log
        error.log
```

### 12.2 manual.txt

`manual.txt` には以下を含める。

- ASCIIアート見出し
- ゲームの目的
- コマンドの入力方法
- 基本コマンドの説明
- ミッションの進め方
- ヒントの使い方
- 危険操作の考え方
- `:q!` または `:wq` で戻る説明
- 画面上の入力欄に `:` は出ていないため、自分で `:` から入力する説明

## 13. テスト設計

### 13.1 単体テスト対象

- Command Parser
- Path Resolver
- Virtual File System
- Command Handlers
- Mission Controller
- Incident Detector
- Typing Controller

### 13.2 主要テストケース

- `pwd` で現在地が表示される
- `cd /home/trainee/projects` で移動できる
- `cd ../../../../` で仮想ルート外へ出られない
- `ls` で一覧が表示される
- `cat readme.txt` で内容が表示される
- `cp app.conf app.conf.bak` でコピーされる
- `chmod 755 deploy.sh` で権限が変更される
- `chmod 777 deploy.sh` で警告が出る
- `vi manual.txt` でマニュアルが開く
- マニュアル画面の入力欄に `:` が事前表示されない
- `:q!` でマニュアルが閉じる
- `exit` でゲーム中にトップページへ戻れる
- `resume` で中断中のゲームへ戻れる
- `progress` で進捗ページを表示できる
- 進捗ページは `exit` または `back` で閉じられる
- `typing` でタイピング練習モードを開始できる
- タイピング練習モードで意味とコマンドが同時に表示される
- タイピング練習モードで完全一致時に正解になる
- `challenge` で20問の本番タイムアタックを開始できる
- 本番タイムアタックでは意味のみが表示される
- 本番タイムアタックでEnter時の不正解に1秒ペナルティが加算される
- 20問完了後に最終タイム、正確率、ランクが表示される
- `<script>alert(1)</script>` がHTMLとして実行されない

## 14. 開発順序

1. 静的画面とデザイン土台を作る
2. Boot ScreenとTop Menuを作る
3. コマンド入力欄と履歴を作る
4. Command Parserを作る
5. 仮想ファイルシステムを作る
6. `pwd`、`ls`、`cd` を実装する
7. Manual Viewerと `vi manual.txt` を実装する
8. `cat`、`cp`、`chmod` を実装する
9. Mission Controllerを実装する
10. Incident Detectorを実装する
11. `exit`、`resume`、`progress` のゲーム制御を実装する
12. タイピング練習モードを実装する
13. 本番タイムアタックモードを実装する
14. ヒント、スコア、結果表示を実装する
15. テストと手動確認を行う

## 15. 未決事項

- JavaScriptで始めるか、TypeScriptで始めるか
- Canvasのみで入力まで描画するか、HTML入力を重ねるか
- `ls -l` をMVPに含めるか
- `vi` でスクロール操作をどこまで再現するか
- トップメニューにクリック補助を用意するか
- モバイル表示をMVP対象に含めるか
- タイピング問題をカテゴリ別に選べるようにするか
