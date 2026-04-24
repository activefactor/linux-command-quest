# Linux Command Quest

[![Play on GitHub Pages](https://img.shields.io/badge/PLAY-GitHub%20Pages-2ea44f?style=for-the-badge)](https://activefactor.github.io/linux-command-quest/linux-command-game/)

Linux Command Questは、Linuxコマンドをゲーム感覚で学ぶためのブラウザ向け学習モックです。

インフラエンジニアの基礎として、ターミナルを起動し、コマンドを入力し、ディレクトリ移動、ファイル確認、コピー、権限変更などを体験できます。実際のOSコマンドは実行せず、すべてブラウザ内の仮想Linux環境で動作します。

## 遊べる内容

- CLI風の起動画面
- ASCIIアートのトップメニュー
- `vi manual.txt` 風の閲覧専用マニュアル
- Linux基本コマンドのミッション
- コマンド名を覚えるタイピング練習
- 20問の本番タイムアタック
- 危険操作の警告シミュレーション
- 進捗確認画面

## 起動方法

ローカルでは、以下のファイルをブラウザで開くと遊べます。

```text
linux-command-game/index.html
```

GitHub Pagesを設定した後は、上部のバッジからゲーム画面へ移動できます。

## 主なコマンド

トップメニューでは、以下の入力が使えます。

```text
start      ミッションを始める
manual     遊び方を読む
typing     コマンドタイピング練習
challenge  20問タイムアタック
progress   進捗を見る
```

## 安全性

このアプリは学習用シミュレーターです。

- 実OSコマンドは実行しません
- 実ファイルシステムは操作しません
- 実ネットワークへ接続する演習は行いません
- 危険コマンドはゲーム内警告として扱います

## ドキュメント

- [提案書](linux-command-game/proposal.md)
- [要件定義書](linux-command-game/requirements.md)
- [基本設計書](linux-command-game/basic-design.md)
- [開発ルール](linux-command-game/development-rules.md)
- [セキュリティポリシー](linux-command-game/security-policy.md)

