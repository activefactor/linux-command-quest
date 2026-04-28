"use strict";

const canvas = document.getElementById("terminalCanvas");
const ctx = canvas.getContext("2d");
const commandInput = document.getElementById("commandInput");
const promptLabel = document.getElementById("promptLabel");
const learningPanel = document.getElementById("learningPanel");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const goalList = document.getElementById("goalList");
const hintButton = document.getElementById("hintButton");
const nextButton = document.getElementById("nextButton");
const hintText = document.getElementById("hintText");
const screenStatus = document.getElementById("screenStatus");
const scoreStatus = document.getElementById("scoreStatus");
const riskStatus = document.getElementById("riskStatus");

const FONT_FAMILY = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
const LINE_HEIGHT = 22;
const PADDING_X = 22;
const PADDING_Y = 22;

const titleArt = [
  " _     _                         ____                                          _ ",
  "| |   (_)_ __  _   ___  __      / ___|___  _ __ ___  _ __ ___   __ _ _ __   __| |",
  "| |   | | '_ \\| | | \\ \\/ /_____| |   / _ \\| '_ ` _ \\| '_ ` _ \\ / _` | '_ \\ / _` |",
  "| |___| | | | | |_| |>  <_____| |__| (_) | | | | | | | | | | | (_| | | | | (_| |",
  "|_____|_|_| |_|\\__,_/_/\\_\\     \\____\\___/|_| |_| |_|_| |_| |_|\\__,_|_| |_|\\__,_|",
  "                         Quest"
];

const manualArt = [
  " _   _                 _____         ____  _             ",
  "| | | | _____      __ |_   _|__     |  _ \\| | __ _ _   _ ",
  "| |_| |/ _ \\ \\ /\\ / /   | |/ _ \\    | |_) | |/ _` | | | |",
  "|  _  | (_) \\ V  V /    | | (_) |   |  __/| | (_| | |_| |",
  "|_| |_|\\___/ \\_/\\_/     |_|\\___/    |_|   |_|\\__,_|\\__, |",
  "                                                   |___/ "
];

const opsArt = [
  " __  __ _         _               ____                      _ ",
  "|  \\/  (_)___ ___(_) ___  _ __   | __ )  ___   __ _ _ __ __| |",
  "| |\\/| | / __/ __| |/ _ \\| '_ \\  |  _ \\ / _ \\ / _` | '__/ _` |",
  "| |  | | \\__ \\__ \\ | (_) | | | | | |_) | (_) | (_| | | | (_| |",
  "|_|  |_|_|___/___/_|\\___/|_| |_| |____/ \\___/ \\__,_|_|  \\__,_|"
];

const typingModeNote = "※これはコマンドを覚えるゲームなのでオプションやパラメータは、省略しています";

const manualText = [
  ...manualArt,
  "",
  "1. このゲームは、Linuxコマンドを安全に練習するための仮想ターミナルです。",
  "2. コマンドを入力してEnterを押すと、仮想Linux環境で結果が表示されます。",
  "3. まずは pwd で現在地を確認します。",
  "4. ls でファイルやディレクトリの一覧を確認できます。",
  "5. cd /home/trainee/projects のように入力すると、ディレクトリを移動できます。",
  "6. cat readme.txt でファイルの中身を読みます。",
  "7. cp app.conf app.conf.bak で設定ファイルのバックアップを作れます。",
  "8. chmod 755 deploy.sh でスクリプトに実行権限を付けます。",
  "9. chmod 777 や rm -rf / のような危険操作は、ゲーム内インシデントとして扱われます。",
  "10. missions で、障害対応チケット風の実務ミッションを選べます。",
  "11. typing で、意味とコマンドを見ながらタイピング練習ができます。",
  "12. challenge で、意味だけを見て20問のタイムアタックに挑戦できます。",
  `13. ${typingModeNote}`,
  "14. 困ったらゲーム画面のヒントを見るか、help を入力してください。",
  "",
  "この画面は vi 風の閲覧専用マニュアルです。編集はできません。",
  "終了するには :q! または :wq を入力してください。"
];

const bootScript = [
  { type: "input", text: "ssh trainee@linux-command-quest.local" },
  { type: "system", text: "Connecting to linux-command-quest.local..." },
  { type: "success", text: "Welcome to Linux Command Quest training shell." },
  { type: "input", text: "./start-training.sh" },
  { type: "system", text: "Loading virtual filesystem..." },
  { type: "system", text: "Loading mission database..." },
  { type: "success", text: "Starting terminal trainer..." }
];

const typingQuestions = [
  { id: "type-001", meaning: "現在のディレクトリを表示する", command: "pwd", category: "navigation", difficulty: "basic" },
  { id: "type-002", meaning: "ファイル一覧を表示する", command: "ls", category: "navigation", difficulty: "basic" },
  { id: "type-003", meaning: "ディレクトリを移動する", command: "cd", category: "navigation", difficulty: "basic" },
  { id: "type-004", meaning: "ファイルの内容を表示する", command: "cat", category: "file-read", difficulty: "basic" },
  { id: "type-005", meaning: "ファイルをコピーする", command: "cp", category: "file-operation", difficulty: "basic" },
  { id: "type-006", meaning: "ファイルやディレクトリを移動、または名前変更する", command: "mv", category: "file-operation", difficulty: "basic" },
  { id: "type-007", meaning: "ファイルやディレクトリを削除する", command: "rm", category: "file-operation", difficulty: "basic" },
  { id: "type-008", meaning: "ディレクトリを作成する", command: "mkdir", category: "file-operation", difficulty: "basic" },
  { id: "type-009", meaning: "空のファイルを作成する", command: "touch", category: "file-operation", difficulty: "basic" },
  { id: "type-010", meaning: "画面を消去する", command: "clear", category: "navigation", difficulty: "basic" },
  { id: "type-011", meaning: "ファイル内の文字列を検索する", command: "grep", category: "file-read", difficulty: "intermediate" },
  { id: "type-012", meaning: "ファイルやディレクトリを探す", command: "find", category: "file-read", difficulty: "intermediate" },
  { id: "type-013", meaning: "ファイルの末尾を表示する", command: "tail", category: "file-read", difficulty: "intermediate" },
  { id: "type-014", meaning: "ファイルの先頭を表示する", command: "head", category: "file-read", difficulty: "intermediate" },
  { id: "type-015", meaning: "行数や文字数を数える", command: "wc", category: "file-read", difficulty: "intermediate" },
  { id: "type-016", meaning: "ファイル権限を変更する", command: "chmod", category: "permission", difficulty: "intermediate" },
  { id: "type-017", meaning: "ファイルの所有者を変更する", command: "chown", category: "permission", difficulty: "intermediate" },
  { id: "type-018", meaning: "プロセス一覧を表示する", command: "ps", category: "process", difficulty: "intermediate" },
  { id: "type-019", meaning: "ディスク使用量を表示する", command: "df", category: "system", difficulty: "intermediate" },
  { id: "type-020", meaning: "ディレクトリやファイルの容量を表示する", command: "du", category: "system", difficulty: "intermediate" },
  { id: "type-021", meaning: "ファイルをエディタで開く", command: "vi", category: "manual", difficulty: "basic" }
];

const missions = [
  {
    id: "mission-001",
    title: "Mission 1: 現在地を確認する",
    description: "まずはターミナルの現在地を確認してください。Linuxでは、自分がどこにいるかを確認してから作業を始めます。",
    goals: [{ type: "commandExecuted", command: "pwd", label: "`pwd` を実行する" }],
    hints: ["現在地の確認には pwd を使います。", "コマンドは引数なしで実行できます。", "入力例: pwd"],
    completionMessage: "現在地を確認できました。次はディレクトリを移動して中身を確認しましょう。"
  },
  {
    id: "mission-002",
    title: "Mission 2: 指定ディレクトリへ移動する",
    description: "`/home/trainee/projects` に移動し、中にあるファイル一覧を確認してください。",
    goals: [
      { type: "currentPath", path: "/home/trainee/projects", label: "`/home/trainee/projects` に移動する" },
      { type: "commandExecutedInPath", command: "ls", path: "/home/trainee/projects", label: "移動先で `ls` を実行する" }
    ],
    hints: ["ディレクトリ移動には cd を使います。", "移動後に ls を実行して一覧を見ます。", "入力例: cd /home/trainee/projects その後 ls"],
    completionMessage: "移動と一覧確認ができました。設定作業の前には、対象ファイルの存在確認が大切です。"
  },
  {
    id: "mission-003",
    title: "Mission 3: 設定ファイルをバックアップする",
    description: "`app.conf` を `app.conf.bak` としてコピーしてください。設定変更の前には必ずバックアップを作ります。",
    goals: [
      { type: "fileExists", path: "/home/trainee/projects/app.conf", label: "元の `app.conf` が残っている" },
      { type: "fileExists", path: "/home/trainee/projects/app.conf.bak", label: "`app.conf.bak` が存在する" }
    ],
    hints: ["ファイルコピーには cp を使います。", "コピー元、コピー先の順に指定します。", "入力例: cp app.conf app.conf.bak"],
    completionMessage: "バックアップを作成できました。次は実行権限の変更を試します。"
  },
  {
    id: "mission-004",
    title: "Mission 4: 実行権限を付与する",
    description: "`deploy.sh` に必要最小限の実行権限を付与してください。今回の正解は `755` です。",
    goals: [{ type: "fileMode", path: "/home/trainee/projects/deploy.sh", mode: "755", label: "`deploy.sh` の権限を `755` にする" }],
    hints: ["権限変更には chmod を使います。", "数値モードとファイル名を指定します。", "入力例: chmod 755 deploy.sh"],
    completionMessage: "実行権限を安全に変更できました。`777` を避けたのが良い判断です。"
  }
];

const opsMissions = [
  {
    id: "runaway-process",
    title: "暴走プロセスを強制停止せよ",
    incident: "CPU使用率が急上昇し、開発環境の応答が悪化しています。",
    background: "開発用サーバー `dev-app-01` でCPUアラートが発報しました。Web画面の反応が遅く、まずは原因プロセスの切り分けが必要です。",
    instruction: "プロセス一覧から暴走しているプロセスを特定し、対象だけを停止してください。",
    answerGuide: "`ps` でCPU使用率が異常なプロセスを見つけ、`kill <PID>` または `pkill <プロセス名>` で停止する",
    clearCondition: "PID 4321 の `runaway-worker` だけを停止できればクリア",
    concepts: ["プロセス", "プロセスID", "シグナル"],
    commands: ["ps", "kill", "pkill"],
    goals: ["ps でプロセス一覧を確認する", "CPU使用率が高いプロセスを特定する", "対象プロセスだけを kill または pkill で停止する"],
    hints: ["まず ps を実行して、CPUが高いプロセスを探しましょう。", "PID 4321 の runaway-worker が異常値です。", "入力例: kill 4321"],
    successMessage: "暴走プロセスだけを停止できました。PIDを確認してから止める判断ができています。",
    check: "processStopped",
    target: { pid: "4321", name: "runaway-worker" }
  },
  {
    id: "port-8080",
    title: "8080番ポートの使用者を特定せよ",
    incident: "新しいアプリケーションが8080番ポートで起動できません。",
    background: "検証環境でAPIを起動しようとしたところ `Address already in use` が出ています。先に8080番を使っているアプリを確認する必要があります。",
    instruction: "8080番ポートをLISTENしているアプリケーション名を特定し、answer で回答してください。",
    answerGuide: "`ss` または `netstat` で8080番ポートを確認し、`answer <アプリ名>` で回答する",
    clearCondition: "`answer node-api`、または該当PIDの `answer 2840` でクリア",
    concepts: ["ポート", "待ち受け", "プロセス"],
    commands: ["ss", "netstat", "ps", "answer"],
    goals: ["ss または netstat で待ち受けポートを確認する", "8080番ポートのPIDを確認する", "アプリケーション名を answer で回答する"],
    hints: ["ポートの確認には ss を使います。", "8080番ポートは PID 2840 がLISTENしています。", "入力例: answer node-api"],
    successMessage: "8080番ポートの使用者を特定できました。ポートとプロセスを結びつける視点が良いです。",
    check: "answer",
    target: { answer: ["node-api", "node api", "2840"] }
  },
  {
    id: "dns-forward",
    title: "対象URLのIPアドレスを特定せよ",
    incident: "監視対象のURLがどのIPへ向いているか確認が必要です。",
    background: "外形監視で `api.training.local` の接続先確認を依頼されました。DNS設定が想定通りか、正引き結果を確認します。",
    instruction: "DNSの正引き結果として得られるIPアドレスを answer で回答してください。",
    answerGuide: "`dig api.training.local` または `nslookup api.training.local` を実行し、`answer <IPアドレス>` で回答する",
    clearCondition: "`answer 203.0.113.24` でクリア",
    concepts: ["DNS", "正引き", "Aレコード"],
    commands: ["dig", "nslookup", "answer"],
    goals: ["dig または nslookup で名前解決する", "AレコードのIPアドレスを読む", "IPアドレスを answer で回答する"],
    hints: ["対象URLは api.training.local です。", "dig api.training.local を試しましょう。", "入力例: answer 203.0.113.24"],
    successMessage: "正引き結果を特定できました。DNS確認は障害切り分けの入口になります。",
    check: "answer",
    target: { host: "api.training.local", answer: ["203.0.113.24"] }
  },
  {
    id: "log-forensics",
    title: "ログからエラー事象を特定せよ",
    incident: "Webアプリケーションでエラーが発生しています。",
    background: "ユーザーから500エラーの報告が入りました。アプリログからERROR行を探し、実際に起きているエラー事象を特定します。",
    instruction: "ログファイルからERROR行を探し、発生しているエラーメッセージを answer で回答してください。",
    answerGuide: "`grep ERROR /var/log/myapp/app.log` でERROR行を探し、`answer <エラーメッセージ>` で回答する",
    clearCondition: "`answer database connection timeout` でクリア",
    concepts: ["ログファイル", "ログレベル", "severity"],
    commands: ["cat", "less", "view", "grep", "awk", "answer"],
    goals: ["/var/log/myapp/app.log を確認する", "ERROR を含む行を絞り込む", "エラーメッセージを answer で回答する"],
    hints: ["対象ログは /var/log/myapp/app.log です。", "grep ERROR /var/log/myapp/app.log を試しましょう。", "入力例: answer database connection timeout"],
    successMessage: "ログからエラー事象を特定できました。ログレベルで絞り込む流れが身についています。",
    check: "answer",
    target: { answer: ["database connection timeout", "db connection timeout"] }
  },
  {
    id: "disk-pressure",
    title: "ディスク逼迫の原因を突き止めよ",
    incident: "/var のディスク使用率が急上昇しています。",
    background: "監視から `/var` の使用率95%アラートが届きました。サービス停止につながる前に、どのファイルが容量を圧迫しているか調査します。",
    instruction: "容量を圧迫しているファイルまたはディレクトリを特定し、answer で回答してください。",
    answerGuide: "`df` で逼迫箇所を見て、`du /var/log/myapp` などで原因を絞り、`answer <ファイル名>` で回答する",
    clearCondition: "`answer /var/log/myapp/archive.log` または `answer archive.log` でクリア",
    concepts: ["ディスク使用率", "ファイルサイズ", "ログ肥大化"],
    commands: ["df", "du", "find", "sort", "answer"],
    goals: ["df で使用率が高い領域を確認する", "du または find で大きいファイルを探す", "原因ファイルを answer で回答する"],
    hints: ["まず df を実行して、逼迫している領域を見ます。", "du /var/log/myapp でログ容量を確認しましょう。", "入力例: answer /var/log/myapp/archive.log"],
    successMessage: "ディスク逼迫の原因を特定できました。容量調査では大きい場所から絞り込むのが基本です。",
    check: "answer",
    target: { answer: ["/var/log/myapp/archive.log", "archive.log"] }
  },
  {
    id: "service-down",
    title: "停止したサービスの原因を追跡せよ",
    incident: "アプリケーションサービス myapp が停止しています。",
    background: "リリース後に `myapp` が起動しなくなりました。サービス状態と直近ログから、停止した直接原因を特定します。",
    instruction: "サービス状態と直近ログを確認し、停止原因を answer で回答してください。",
    answerGuide: "`systemctl status myapp` と `journalctl -u myapp` を確認し、`answer <停止原因>` で回答する",
    clearCondition: "`answer missing environment file` など、環境ファイル不足を示す回答でクリア",
    concepts: ["サービス", "systemd", "ジャーナルログ"],
    commands: ["systemctl", "journalctl", "ps", "grep", "answer"],
    goals: ["systemctl status myapp で状態を確認する", "journalctl -u myapp で直近ログを見る", "停止原因を answer で回答する"],
    hints: ["まず systemctl status myapp を確認しましょう。", "journalctl -u myapp に原因メッセージがあります。", "入力例: answer missing environment file"],
    successMessage: "停止原因を追跡できました。状態確認とログ確認を組み合わせられています。",
    check: "answer",
    target: { answer: ["missing environment file", "env.production missing", "/etc/myapp/env.production"] }
  }
];

const state = {
  screen: "boot",
  lines: [],
  history: [],
  historyIndex: null,
  currentPath: "/home/trainee",
  fileSystem: createFileSystem(),
  executedCommands: [],
  score: 1000,
  risk: 0,
  currentMissionIndex: 0,
  completedMissionIds: [],
  hintIndex: 0,
  completedCurrentMission: false,
  bootTimer: null,
  challengeTimer: null,
  manualReturnScreen: "top",
  progressReturnScreen: "top",
  gameStarted: false,
  opsMissionId: null,
  completedOpsMissionIds: [],
  opsHintIndex: 0,
  opsRuntime: createOpsRuntime(),
  typing: createTypingState()
};

function createTypingState() {
  return {
    mode: null,
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    mistakeCount: 0,
    startedAt: null,
    endedAt: null,
    penaltySeconds: 0,
    hintRevealCount: 0,
    lastFeedback: "",
    result: null
  };
}

function createOpsRuntime() {
  return {
    processes: [
      { pid: "1", user: "root", cpu: "0.0", mem: "0.3", command: "systemd", status: "running" },
      { pid: "835", user: "root", cpu: "0.4", mem: "1.1", command: "sshd", status: "running" },
      { pid: "1720", user: "trainee", cpu: "1.2", mem: "2.4", command: "bash", status: "running" },
      { pid: "2840", user: "app", cpu: "3.8", mem: "7.6", command: "node-api", status: "running" },
      { pid: "4321", user: "app", cpu: "98.7", mem: "18.4", command: "runaway-worker", status: "running" },
      { pid: "5190", user: "app", cpu: "0.7", mem: "5.2", command: "log-shipper", status: "running" }
    ],
    ports: [
      { proto: "tcp", state: "LISTEN", local: "0.0.0.0:22", pid: "835", app: "sshd" },
      { proto: "tcp", state: "LISTEN", local: "0.0.0.0:8080", pid: "2840", app: "node-api" },
      { proto: "tcp", state: "LISTEN", local: "127.0.0.1:5432", pid: "3011", app: "postgres" }
    ],
    dnsRecords: {
      "api.training.local": "203.0.113.24",
      "linux-command-quest.local": "192.0.2.15"
    },
    services: {
      myapp: {
        loaded: "loaded (/etc/systemd/system/myapp.service; enabled)",
        active: "failed",
        reason: "missing environment file /etc/myapp/env.production"
      }
    },
    opsCommandHistory: []
  };
}

function createFileSystem() {
  return dir("/", {
    home: dir("home", {
      trainee: dir("trainee", {
        projects: dir("projects", {
          "readme.txt": file("readme.txt", "Linux Command Quest project workspace.\nまずは app.conf を確認し、deploy.sh の権限を整えましょう。\n", "644"),
          "app.conf": file("app.conf", "APP_NAME=command-quest\nPORT=8080\nENV=training\nLOG_LEVEL=info\n", "640"),
          "deploy.sh": file("deploy.sh", "#!/bin/sh\necho Deploying Linux Command Quest\n", "644")
        }),
        logs: dir("logs", {
          "access.log": file("access.log", "10.0.0.8 - GET / 200\n10.0.0.9 - GET /manual 200\n", "644"),
          "error.log": file("error.log", "2026-04-24 09:12:22 WARN deploy.sh is not executable\n", "644")
        }),
        "manual.txt": file("manual.txt", manualText.join("\n"), "444")
      })
    }),
    etc: dir("etc", {
      myapp: dir("myapp", {
        "app.conf": file("app.conf", "PORT=8080\nWORKERS=2\n", "640")
      })
    }),
    var: dir("var", {
      log: dir("log", {
        syslog: file("syslog", "system booted\ntraining sandbox ready\n", "644"),
        myapp: dir("myapp", {
          "app.log": file("app.log", "2026-04-28 08:54:01 INFO boot complete\n2026-04-28 09:01:13 WARN retrying upstream request\n2026-04-28 09:02:44 ERROR database connection timeout\n2026-04-28 09:02:45 INFO request finished with 500\n", "644"),
          "archive.log": file("archive.log", "large archived application log\n", "644")
        }),
        nginx: dir("nginx", {
          "access.log": file("access.log", "GET / 200\nGET /health 200\n", "644"),
          "error.log": file("error.log", "no critical errors\n", "644")
        })
      })
    })
  });
}

function dir(name, children) {
  return { name, type: "directory", mode: "755", owner: "root", group: "root", children };
}

function file(name, content, mode) {
  return { name, type: "file", content, mode, owner: "trainee", group: "trainee" };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  render();
}

function appendLine(kind, text) {
  const parts = String(text).split("\n");
  parts.forEach((part) => state.lines.push({ kind, text: part, timestamp: Date.now() }));
  const maxLines = 450;
  if (state.lines.length > maxLines) {
    state.lines.splice(0, state.lines.length - maxLines);
  }
}

function appendPromptedInput(text) {
  const prompt = getPromptText();
  appendLine("input", prompt ? `${prompt} ${text}` : text);
}

function getPromptText() {
  if (state.screen === "game") {
    return `trainee@quest:${state.currentPath}$`;
  }
  if (state.screen === "ops-board") {
    return "missions>";
  }
  if (state.screen === "ops-mission") {
    const mission = getCurrentOpsMission();
    return mission ? `ops:${mission.id}$` : "ops>";
  }
  if (state.screen === "typing") {
    return "practice>";
  }
  if (state.screen === "challenge") {
    return "challenge>";
  }
  if (state.screen === "challenge-result") {
    return "$";
  }
  if (state.screen === "manual") {
    return "";
  }
  if (state.screen === "progress") {
    return "$";
  }
  return "$";
}

function setPrompt() {
  promptLabel.textContent = getPromptText();
}

function colorForKind(kind) {
  if (kind === "input") return "#8ff0a4";
  if (kind === "error") return "#ff6b6b";
  if (kind === "warning") return "#ffd166";
  if (kind === "success") return "#7ee787";
  if (kind === "system") return "#66d9ef";
  if (kind === "muted") return "#77847c";
  return "#d7ded7";
}

function render() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#050607";
  ctx.fillRect(0, 0, width, height);
  ctx.font = `15px ${FONT_FAMILY}`;
  ctx.textBaseline = "top";

  const wrapWidth = Math.max(24, Math.floor((width - PADDING_X * 2) / 8.7));
  const visualLines = [];
  state.lines.forEach((line) => {
    wrapText(line.text, wrapWidth).forEach((text) => {
      visualLines.push({ kind: line.kind, text });
    });
  });

  const visibleCount = Math.max(1, Math.floor((height - PADDING_Y * 2) / LINE_HEIGHT));
  const start = Math.max(0, visualLines.length - visibleCount);
  let y = PADDING_Y;
  for (let i = start; i < visualLines.length; i += 1) {
    const line = visualLines[i];
    ctx.fillStyle = colorForKind(line.kind);
    ctx.fillText(line.text, PADDING_X, y);
    y += LINE_HEIGHT;
  }

  drawCursorGlow(width, height);
  renderPanel();
  setPrompt();
}

function wrapText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const lines = [];
  let rest = text;
  while (rest.length > maxChars) {
    lines.push(rest.slice(0, maxChars));
    rest = rest.slice(maxChars);
  }
  lines.push(rest);
  return lines;
}

function drawCursorGlow(width, height) {
  ctx.strokeStyle = "rgba(143, 240, 164, 0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, width - 16, height - 16);
}

function renderPanel() {
  screenStatus.textContent = state.screen.toUpperCase();
  scoreStatus.textContent = String(state.score);
  riskStatus.textContent = state.risk >= 70 ? "INCIDENT" : state.risk >= 35 ? "WARN" : "LOW";
  riskStatus.style.color = state.risk >= 70 ? "#ff7a90" : state.risk >= 35 ? "#ffcf70" : "#d7ded7";

  clearNode(goalList);
  if (state.screen === "boot") {
    learningPanel.hidden = false;
    panelTitle.textContent = "仮想Linuxを起動中";
    panelDescription.textContent = "CLIの起動ログを表示しています。Enterでスキップできます。";
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = "";
    return;
  }

  if (state.screen === "top") {
    learningPanel.hidden = false;
    panelTitle.textContent = "トップメニュー";
    panelDescription.textContent = "`start` で基本操作、`missions` で実務ミッション、`typing` で練習、`challenge` で20問タイムアタックを開始できます。";
    addGoal("start または 1: ゲームを始める", false);
    addGoal("missions または 2: 実務ミッションを選ぶ", false);
    addGoal("manual または 3: 遊び方を読む", false);
    addGoal("credits または 4: クレジットを見る", false);
    addGoal("progress または 5: 進捗を見る", false);
    if (state.gameStarted) {
      addGoal("resume または 6: 中断したゲームへ戻る", false);
    }
    addGoal("typing または 7: コマンド練習", false);
    addGoal("challenge または 8: 本番タイムアタック", false);
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = "";
    return;
  }

  if (state.screen === "ops-board") {
    learningPanel.hidden = false;
    panelTitle.textContent = "実務ミッションボード";
    panelDescription.textContent = "障害対応チケット風のミッションを選択します。番号またはミッションIDを入力してください。";
    opsMissions.forEach((mission, index) => {
      const done = state.completedOpsMissionIds.includes(mission.id);
      addGoal(`${index + 1}: ${mission.title}`, done);
    });
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = "`exit` でトップへ戻ります。";
    return;
  }

  if (state.screen === "ops-mission") {
    const mission = getCurrentOpsMission();
    learningPanel.hidden = false;
    panelTitle.textContent = mission ? mission.title : "実務ミッション";
    panelDescription.textContent = mission ? `${mission.background} ${mission.instruction}` : "`missions` でミッションを選び直してください。";
    if (mission) {
      addGoal(`やること: ${mission.answerGuide}`, isOpsMissionCompleted(mission));
      addGoal(`クリア条件: ${mission.clearCondition}`, isOpsMissionCompleted(mission));
      mission.goals.forEach((goal) => addGoal(goal, isOpsGoalDone(mission, goal)));
      addGoal(`概念: ${mission.concepts.join(" / ")}`, false);
      addGoal(`主なコマンド: ${mission.commands.join(" / ")}`, false);
    }
    hintButton.disabled = !mission || isOpsMissionCompleted(mission);
    nextButton.disabled = !mission || !isOpsMissionCompleted(mission);
    hintText.textContent = isOpsMissionCompleted(mission) ? "クリア済みです。次へでミッションボードへ戻れます。" : hintText.textContent;
    return;
  }

  if (state.screen === "manual") {
    learningPanel.hidden = false;
    panelTitle.textContent = "vi manual.txt";
    panelDescription.textContent = "閲覧専用のvi風マニュアルです。`:q!` または `:wq` で戻れます。";
    addGoal(":q! または :wq を自分で入力して戻る", false);
    hintButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  if (state.screen === "progress") {
    learningPanel.hidden = false;
    panelTitle.textContent = "進捗ページ";
    panelDescription.textContent = "現在のミッション進捗、スコア、リスクを確認できます。`exit` または `back` で戻ります。";
    addGoal("exit または back: 前の画面へ戻る", false);
    addGoal("start: 新しくゲームを始める", false);
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = "";
    return;
  }

  if (state.screen === "typing") {
    const question = getCurrentTypingQuestion();
    learningPanel.hidden = false;
    panelTitle.textContent = "タイピング練習";
    panelDescription.textContent = question ? `意味とコマンドを見ながら、正確に入力します。${typingModeNote}` : "練習を完了しました。`typing` でもう一度、`challenge` で本番です。";
    addGoal(`正解: ${state.typing.correctCount}/${state.typing.questions.length}`, false);
    addGoal(`ミス: ${state.typing.mistakeCount}`, false);
    if (question) {
      addGoal(`意味: ${question.meaning}`, false);
      addGoal(`入力: ${question.command}`, false);
    }
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = state.typing.lastFeedback;
    return;
  }

  if (state.screen === "challenge") {
    const question = getCurrentTypingQuestion();
    const elapsed = getChallengeElapsedSeconds();
    learningPanel.hidden = false;
    panelTitle.textContent = "本番タイムアタック";
    panelDescription.textContent = question ? `意味だけを見て、対応するコマンドを入力します。Enter時の不正解は1秒追加です。${typingModeNote}` : "結果を集計しています。";
    addGoal(`問題: ${Math.min(state.typing.currentIndex + 1, state.typing.questions.length)}/${state.typing.questions.length}`, false);
    addGoal(`経過: ${formatSeconds(elapsed)}`, false);
    addGoal(`ペナルティ: +${state.typing.penaltySeconds}s`, false);
    addGoal(`正解: ${state.typing.correctCount}`, false);
    addGoal(`誤答: ${state.typing.mistakeCount}`, false);
    if (question) {
      addGoal(`意味: ${question.meaning}`, false);
    }
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = state.typing.lastFeedback;
    return;
  }

  if (state.screen === "challenge-result") {
    const result = state.typing.result;
    learningPanel.hidden = false;
    panelTitle.textContent = "タイムアタック結果";
    panelDescription.textContent = "`challenge` で再挑戦、`typing` で練習、`exit` でトップへ戻れます。";
    if (result) {
      addGoal(`最終タイム: ${formatSeconds(result.finalSeconds)}`, false);
      addGoal(`素の経過: ${formatSeconds(result.elapsedSeconds)}`, false);
      addGoal(`ペナルティ: +${result.penaltySeconds}s`, false);
      addGoal(`正確率: ${Math.round(result.accuracy * 100)}%`, false);
      addGoal(`ランク: ${result.rank}`, false);
    }
    hintButton.disabled = true;
    nextButton.disabled = true;
    hintText.textContent = "";
    return;
  }

  if (state.screen === "game") {
    const mission = missions[state.currentMissionIndex];
    panelTitle.textContent = mission ? mission.title : "Training Complete";
    panelDescription.textContent = mission ? `${mission.description} 離脱する時は exit、進捗確認は progress と入力します。` : "すべてのモックミッションを完了しました。`restart` で最初から遊べます。";
    hintButton.disabled = !mission || state.completedCurrentMission;
    nextButton.disabled = !state.completedCurrentMission;
    if (mission) {
      mission.goals.forEach((goal) => addGoal(goal.label, isGoalDone(goal)));
    }
    return;
  }
}

function addGoal(text, done) {
  const item = document.createElement("div");
  item.className = done ? "goal-item done" : "goal-item";
  const mark = document.createElement("span");
  mark.className = "goal-mark";
  mark.textContent = done ? "OK" : "-";
  const label = document.createElement("span");
  label.textContent = text;
  item.append(mark, label);
  goalList.appendChild(item);
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function startBootSequence() {
  commandInput.disabled = false;
  commandInput.focus();
  appendLine("system", "Linux Command Quest virtual console");
  let index = 0;

  const runNext = () => {
    if (state.screen !== "boot") return;
    if (index >= bootScript.length) {
      showTopMenu();
      return;
    }
    const entry = bootScript[index];
    if (entry.type === "input") {
      typeBootCommand(entry.text, () => {
        index += 1;
        state.bootTimer = window.setTimeout(runNext, 260);
      });
    } else {
      appendLine(entry.type, entry.text);
      render();
      index += 1;
      state.bootTimer = window.setTimeout(runNext, 420);
    }
  };

  state.bootTimer = window.setTimeout(runNext, 500);
}

function typeBootCommand(text, done) {
  let typed = "";
  const prompt = "$";
  const lineIndex = state.lines.length;
  state.lines.push({ kind: "input", text: `${prompt} `, timestamp: Date.now() });
  const tick = () => {
    if (state.screen !== "boot") return;
    typed = text.slice(0, typed.length + 1);
    state.lines[lineIndex].text = `${prompt} ${typed}`;
    render();
    if (typed.length >= text.length) {
      done();
      return;
    }
    state.bootTimer = window.setTimeout(tick, 34);
  };
  tick();
}

function showTopMenu() {
  window.clearTimeout(state.bootTimer);
  stopChallengeTimer();
  state.screen = "top";
  state.lines = [];
  titleArt.forEach((line) => appendLine("success", line));
  appendLine("muted", "");
  appendLine("system", "Training console initialized. Choose a command:");
  appendLine("output", "[1] start     ゲームを始める");
  appendLine("output", "[2] missions  実務ミッションを選ぶ");
  appendLine("output", "[3] manual    遊び方と世界観を読む");
  appendLine("output", "[4] credits   クレジットを見る");
  appendLine("output", "[5] progress  進捗を見る");
  if (state.gameStarted) {
    appendLine("output", "[6] resume    中断したゲームへ戻る");
  }
  appendLine("output", "[7] typing    コマンドタイピング練習");
  appendLine("output", "[8] challenge 本番タイムアタック");
  appendLine("muted", "");
  appendLine("muted", "Tip: missions で障害対応、typing で覚えて、challenge で20問タイムアタック。");
  commandInput.value = "";
  render();
}

function startGame() {
  state.screen = "game";
  state.lines = [];
  state.currentPath = "/home/trainee";
  state.fileSystem = createFileSystem();
  state.executedCommands = [];
  state.currentMissionIndex = 0;
  state.completedMissionIds = [];
  state.hintIndex = 0;
  state.completedCurrentMission = false;
  state.score = 1000;
  state.risk = 0;
  state.gameStarted = true;
  appendLine("system", "Mission environment ready.");
  appendLine("system", "Type help to see available commands.");
  appendLine("muted", "");
  appendLine("success", "Mission 1 loaded: 現在地を確認する");
  hintText.textContent = "";
  render();
}

function openManual() {
  state.manualReturnScreen = state.screen === "game" ? "game" : "top";
  state.screen = "manual";
  state.lines = [];
  manualText.forEach((line) => appendLine(line.startsWith("_") || line.startsWith("|") ? "success" : "output", line));
  hintText.textContent = "終了するには :q! または :wq";
  render();
}

function showProgressScreen(returnScreen) {
  stopChallengeTimer();
  state.progressReturnScreen = returnScreen;
  state.screen = "progress";
  state.lines = [];
  appendLine("success", " ____                                      ");
  appendLine("success", "|  _ \\ _ __ ___   __ _ _ __ ___  ___ ___ ");
  appendLine("success", "| |_) | '__/ _ \\ / _` | '__/ _ \\/ __/ __|");
  appendLine("success", "|  __/| | | (_) | (_| | | |  __/\\__ \\__ \\");
  appendLine("success", "|_|   |_|  \\___/ \\__, |_|  \\___||___/___/");
  appendLine("success", "                  |___/                   ");
  appendLine("muted", "");
  appendLine("system", "Training session progress");
  appendLine("output", `Score: ${state.score}`);
  appendLine("output", `Risk: ${state.risk >= 70 ? "INCIDENT" : state.risk >= 35 ? "WARN" : "LOW"} (${state.risk}/100)`);
  appendLine("output", `Current path: ${state.currentPath}`);
  appendLine("output", `Completed missions: ${state.completedMissionIds.length}/${missions.length}`);
  appendLine("output", `Completed ops missions: ${state.completedOpsMissionIds.length}/${opsMissions.length}`);
  appendLine("muted", "");
  missions.forEach((mission, index) => {
    const status = state.completedMissionIds.includes(mission.id)
      ? "[DONE]"
      : index === state.currentMissionIndex && state.gameStarted
        ? "[NOW ]"
        : "[WAIT]";
    appendLine(status === "[DONE]" ? "success" : status === "[NOW ]" ? "system" : "muted", `${status} ${mission.title}`);
  });
  appendLine("muted", "");
  opsMissions.forEach((mission) => {
    const status = state.completedOpsMissionIds.includes(mission.id)
      ? "[DONE]"
      : mission.id === state.opsMissionId
        ? "[NOW ]"
        : "[WAIT]";
    appendLine(status === "[DONE]" ? "success" : status === "[NOW ]" ? "system" : "muted", `${status} Ops: ${mission.title}`);
  });
  appendLine("muted", "");
  appendLine("output", "exit または back で前の画面へ戻ります。start で基本ミッション、missions で実務ミッション。");
  commandInput.value = "";
  render();
}

function showOpsMissionBoard() {
  stopChallengeTimer();
  state.screen = "ops-board";
  state.lines = [];
  opsArt.forEach((line) => appendLine("success", line));
  appendLine("muted", "");
  appendLine("system", "MISSION BOARD");
  appendLine("output", "監視アラートや障害対応チケットを選択してください。");
  appendLine("muted", "");
  opsMissions.forEach((mission, index) => {
    const done = state.completedOpsMissionIds.includes(mission.id) ? "DONE" : "OPEN";
    appendLine(done === "DONE" ? "success" : "output", `[${index + 1}] ${mission.id.padEnd(16)} ${mission.title}  (${done})`);
    appendLine("muted", `    ${mission.incident}`);
  });
  appendLine("muted", "");
  appendLine("muted", "番号またはミッションIDを入力します。exit でトップへ戻ります。");
  commandInput.value = "";
  render();
}

function startOpsMission(mission) {
  state.screen = "ops-mission";
  state.opsMissionId = mission.id;
  state.opsHintIndex = 0;
  state.opsRuntime = createOpsRuntime();
  state.lines = [];
  hintText.textContent = "";
  appendLine("error", `[ALERT] ${mission.incident}`);
  appendLine("muted", "");
  appendLine("system", "[BACKGROUND]");
  appendLine("output", mission.background);
  appendLine("muted", "");
  appendLine("system", "[REQUEST]");
  appendLine("output", mission.instruction);
  appendLine("muted", "");
  appendLine("system", "[WHAT TO DO]");
  appendLine("output", mission.answerGuide);
  appendLine("muted", "");
  appendLine("system", "[CLEAR CONDITION]");
  appendLine("output", mission.clearCondition);
  appendLine("muted", "");
  appendLine("output", `Mission ID: ${mission.id}`);
  appendLine("output", `Concepts: ${mission.concepts.join(", ")}`);
  appendLine("output", `Commands: ${mission.commands.join(", ")}`);
  appendLine("muted", "");
  appendLine("muted", "help で利用可能コマンド、hint でヒント、back でミッションボード、exit でトップへ戻ります。");
  render();
}

function startTypingPractice() {
  stopChallengeTimer();
  state.typing = createTypingState();
  state.typing.mode = "practice";
  state.typing.questions = [...typingQuestions];
  state.typing.startedAt = Date.now();
  state.screen = "typing";
  showTypingPracticeQuestion();
}

function showTypingPracticeQuestion() {
  state.lines = [];
  const question = getCurrentTypingQuestion();
  appendLine("success", " _____             _               ");
  appendLine("success", "|_   _|   _ _ __ (_)_ __   __ _   ");
  appendLine("success", "  | || | | | '_ \\| | '_ \\ / _` |  ");
  appendLine("success", "  | || |_| | |_) | | | | | (_| |  ");
  appendLine("success", "  |_| \\__, | .__/|_|_| |_|\\__, |  ");
  appendLine("success", "      |___/|_|            |___/   ");
  appendLine("muted", "");
  if (!question) {
    appendLine("success", "Practice complete.");
    appendLine("output", `Correct: ${state.typing.correctCount}/${state.typing.questions.length}`);
    appendLine("output", `Mistakes: ${state.typing.mistakeCount}`);
    appendLine("muted", "typing でもう一度、challenge で本番、exit でトップへ戻れます。");
    render();
    return;
  }
  appendLine("system", `Question ${state.typing.currentIndex + 1}/${state.typing.questions.length}`);
  appendLine("output", `意味: ${question.meaning}`);
  appendLine("output", `コマンド: ${question.command}`);
  appendLine("muted", "");
  appendLine("muted", typingModeNote);
  appendLine("muted", "表示されたコマンドを入力してください。exit で戻ります。");
  render();
}

function startChallenge() {
  state.typing = createTypingState();
  state.typing.mode = "challenge";
  state.typing.questions = createChallengeQuestions();
  state.typing.startedAt = Date.now();
  state.screen = "challenge";
  startChallengeTimer();
  showChallengeQuestion();
}

function createChallengeQuestions() {
  const shuffled = [...typingQuestions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }
  return shuffled.slice(0, Math.min(20, shuffled.length));
}

function showChallengeQuestion() {
  state.lines = [];
  const question = getCurrentTypingQuestion();
  appendLine("success", "  ____ _           _ _                       ");
  appendLine("success", " / ___| |__   __ _| | | ___ _ __   __ _  ___");
  appendLine("success", "| |   | '_ \\ / _` | | |/ _ \\ '_ \\ / _` |/ _ \\");
  appendLine("success", "| |___| | | | (_| | | |  __/ | | | (_| |  __/");
  appendLine("success", " \\____|_| |_|\\__,_|_|_|\\___|_| |_|\\__, |\\___|");
  appendLine("success", "                                  |___/      ");
  appendLine("muted", "");
  if (!question) {
    finishChallenge();
    return;
  }
  appendLine("system", `Question ${state.typing.currentIndex + 1}/${state.typing.questions.length}`);
  appendLine("output", `意味: ${question.meaning}`);
  appendLine("muted", "");
  appendLine("muted", typingModeNote);
  appendLine("muted", "正解コマンドを入力してください。Enter時の不正解は +1秒。exit で中断。");
  render();
}

function finishChallenge() {
  stopChallengeTimer();
  state.typing.endedAt = Date.now();
  const elapsedSeconds = getChallengeElapsedSeconds();
  const penaltySeconds = state.typing.penaltySeconds;
  const finalSeconds = elapsedSeconds + penaltySeconds;
  const inputCount = state.typing.correctCount + state.typing.mistakeCount;
  const accuracy = inputCount === 0 ? 0 : state.typing.correctCount / inputCount;
  const rank = getChallengeRank(finalSeconds, accuracy);
  state.typing.result = {
    elapsedSeconds,
    penaltySeconds,
    finalSeconds,
    correctCount: state.typing.correctCount,
    mistakeCount: state.typing.mistakeCount,
    accuracy,
    rank
  };
  state.screen = "challenge-result";
  state.lines = [];
  appendLine("success", " ____                 _ _   ");
  appendLine("success", "|  _ \\ ___  ___ _   _| | |_ ");
  appendLine("success", "| |_) / _ \\/ __| | | | | __|");
  appendLine("success", "|  _ <  __/\\__ \\ |_| | | |_ ");
  appendLine("success", "|_| \\_\\___||___/\\__,_|_|\\__|");
  appendLine("muted", "");
  appendLine("output", `Final time: ${formatSeconds(finalSeconds)}`);
  appendLine("output", `Elapsed: ${formatSeconds(elapsedSeconds)}`);
  appendLine("output", `Penalty: +${penaltySeconds}s`);
  appendLine("output", `Correct: ${state.typing.correctCount}`);
  appendLine("output", `Wrong: ${state.typing.mistakeCount}`);
  appendLine("output", `Accuracy: ${Math.round(accuracy * 100)}%`);
  appendLine("success", `Rank: ${rank}`);
  appendLine("muted", "");
  appendLine("muted", "challenge で再挑戦、typing で練習、exit でトップへ戻ります。");
  render();
}

function startChallengeTimer() {
  stopChallengeTimer();
  state.challengeTimer = window.setInterval(() => {
    if (state.screen === "challenge") {
      render();
    }
  }, 250);
}

function stopChallengeTimer() {
  if (state.challengeTimer) {
    window.clearInterval(state.challengeTimer);
    state.challengeTimer = null;
  }
}

function handleInput(rawInput) {
  const input = rawInput.trim();
  if (!input) return;
  state.history.push(input);
  state.historyIndex = null;
  commandInput.value = "";

  if (state.screen === "boot") {
    showTopMenu();
    return;
  }

  if (state.screen === "manual") {
    appendPromptedInput(input);
    handleManualInput(input);
    render();
    return;
  }

  appendPromptedInput(input);
  if (state.screen === "progress") {
    handleProgressInput(input);
    render();
    return;
  }

  if (state.screen === "ops-board") {
    handleOpsBoardInput(input);
    render();
    return;
  }

  if (state.screen === "ops-mission") {
    handleOpsMissionInput(input);
    render();
    return;
  }

  if (state.screen === "typing") {
    handleTypingInput(input);
    render();
    return;
  }

  if (state.screen === "challenge") {
    handleChallengeInput(input);
    render();
    return;
  }

  if (state.screen === "challenge-result") {
    handleChallengeResultInput(input);
    render();
    return;
  }

  if (state.screen === "top") {
    handleTopInput(input);
    render();
    return;
  }

  if (state.screen === "game") {
    handleGameInput(input);
    render();
  }
}

function handleTopInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "start" || normalized === "1") {
    startGame();
    return;
  }
  if (normalized === "missions" || normalized === "mission" || normalized === "2") {
    showOpsMissionBoard();
    return;
  }
  if (normalized === "manual" || normalized === "3" || normalized === "vi manual.txt") {
    openManual();
    return;
  }
  if (normalized === "credits" || normalized === "4") {
    appendLine("system", "Linux Command Quest mock");
    appendLine("output", "Created as a browser-only training prototype.");
    appendLine("muted", "start / missions / manual / credits / progress から選択できます。");
    return;
  }
  if (normalized === "progress" || normalized === "5") {
    showProgressScreen("top");
    return;
  }
  if ((normalized === "resume" || normalized === "6") && state.gameStarted) {
    resumeGame();
    return;
  }
  if (normalized === "typing" || normalized === "7") {
    startTypingPractice();
    return;
  }
  if (normalized === "challenge" || normalized === "8") {
    startChallenge();
    return;
  }
  if (normalized === "help") {
    appendLine("output", "available commands: start, missions, manual, vi manual.txt, credits, progress, resume, typing, challenge");
    return;
  }
  appendLine("error", `${input}: command not found`);
  appendLine("warning", "ヒント: start / missions / manual のいずれかを入力してください。");
}

function handleOpsBoardInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "exit" || normalized === "back") {
    showTopMenu();
    return;
  }
  if (normalized === "help") {
    appendLine("output", "番号、ミッションID、または exit を入力できます。例: 1 / runaway-process");
    return;
  }
  const mission = findOpsMission(input);
  if (mission) {
    startOpsMission(mission);
    return;
  }
  appendLine("error", `${input}: mission not found`);
  appendLine("warning", "番号またはミッションIDを入力してください。例: 2 / port-8080");
}

function handleOpsMissionInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "exit") {
    appendLine("system", "Leaving ops mission. Progress is kept in memory.");
    showTopMenu();
    return;
  }
  if (normalized === "back" || normalized === "missions") {
    showOpsMissionBoard();
    return;
  }
  if (normalized === "progress") {
    showProgressScreen("ops-mission");
    return;
  }
  if (normalized === "hint") {
    showOpsHint();
    return;
  }
  if (normalized === "next") {
    if (isOpsMissionCompleted(getCurrentOpsMission())) {
      showOpsMissionBoard();
    } else {
      appendLine("warning", "まだミッションは完了していません。");
    }
    return;
  }

  const parsed = parseCommand(input);
  const danger = detectDangerousCommand(parsed, input);
  if (danger) {
    applyIncident(danger);
    return;
  }
  dispatchOpsCommand(parsed, input);
}

function handleTypingInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "exit") {
    showTopMenu();
    return;
  }
  if (normalized === "challenge") {
    startChallenge();
    return;
  }
  if (normalized === "typing") {
    startTypingPractice();
    return;
  }

  const question = getCurrentTypingQuestion();
  if (!question) {
    appendLine("warning", "練習は完了しています。typing / challenge / exit を入力できます。");
    return;
  }

  if (input === question.command) {
    state.typing.correctCount += 1;
    state.typing.currentIndex += 1;
    state.typing.hintRevealCount = 0;
    state.typing.lastFeedback = "正解です。次のコマンドへ進みます。";
    showTypingPracticeQuestion();
    return;
  }

  state.typing.mistakeCount += 1;
  state.typing.lastFeedback = getProgressiveCommandHint(question.command);
  appendLine("warning", "不一致です。表示されているコマンドを正確に入力しましょう。");
  appendLine("system", state.typing.lastFeedback);
}

function handleChallengeInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "exit") {
    stopChallengeTimer();
    showTopMenu();
    return;
  }

  const question = getCurrentTypingQuestion();
  if (!question) {
    finishChallenge();
    return;
  }

  if (input === question.command) {
    state.typing.correctCount += 1;
    state.typing.currentIndex += 1;
    state.typing.hintRevealCount = 0;
    state.typing.lastFeedback = "Correct.";
    if (state.typing.currentIndex >= state.typing.questions.length) {
      finishChallenge();
    } else {
      showChallengeQuestion();
    }
    return;
  }

  state.typing.mistakeCount += 1;
  state.typing.penaltySeconds += 1;
  state.typing.lastFeedback = `不正解です。+1秒。${getProgressiveCommandHint(question.command)}`;
  appendLine("warning", "Wrong command. Penalty +1s.");
  appendLine("system", state.typing.lastFeedback);
}

function handleChallengeResultInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "challenge") {
    startChallenge();
    return;
  }
  if (normalized === "typing") {
    startTypingPractice();
    return;
  }
  if (normalized === "exit" || normalized === "back") {
    showTopMenu();
    return;
  }
  appendLine("error", `${input}: command not found`);
  appendLine("warning", "challenge / typing / exit を入力してください。");
}

function handleProgressInput(input) {
  const normalized = input.toLowerCase();
  if (normalized === "exit" || normalized === "back" || normalized === ":q!" || normalized === ":wq") {
    if (state.progressReturnScreen === "ops-mission" && state.opsMissionId) {
      state.screen = "ops-mission";
      state.lines = [];
      const mission = getCurrentOpsMission();
      appendLine("system", "Returned to ops mission.");
      if (mission) appendLine("success", `${mission.title} active.`);
      render();
    } else if (state.progressReturnScreen === "ops-board") {
      showOpsMissionBoard();
    } else if (state.progressReturnScreen === "game" && state.gameStarted) {
      resumeGame();
    } else {
      showTopMenu();
    }
    return;
  }
  if (normalized === "start") {
    startGame();
    return;
  }
  if (normalized === "missions") {
    showOpsMissionBoard();
    return;
  }
  appendLine("error", `${input}: command not found`);
  appendLine("warning", "戻るには exit または back を入力してください。");
}

function handleManualInput(input) {
  if (input === ":q!" || input === ":wq") {
    if (state.manualReturnScreen === "game") {
      state.screen = "game";
      state.lines = [];
      appendLine("system", "Returned from manual.txt.");
      appendLine("system", "Type help to see available commands.");
      render();
    } else {
      showTopMenu();
    }
    return;
  }
  if (["i", "a", "o"].includes(input)) {
    appendLine("warning", "manual.txt is readonly. インサートモードはこのモックでは使えません。");
    return;
  }
  appendLine("error", "E492: Not an editor command");
  appendLine("warning", "戻るには :q! または :wq を入力してください。");
}

function handleGameInput(input) {
  if (input.toLowerCase() === "exit") {
    appendLine("system", "Leaving current training session. Progress is kept in memory.");
    showTopMenu();
    return;
  }
  if (input.toLowerCase() === "progress") {
    showProgressScreen("game");
    return;
  }
  if (input.toLowerCase() === "restart") {
    startGame();
    return;
  }
  if (input.toLowerCase() === "next") {
    goNextMission();
    return;
  }

  const parsed = parseCommand(input);
  const danger = detectDangerousCommand(parsed, input);
  if (danger) {
    applyIncident(danger);
    recordCommand(parsed.command, input);
    checkMissionCompletion();
    return;
  }

  dispatchCommand(parsed, input);
  recordCommand(parsed.command, input);
  checkMissionCompletion();
}

function resumeGame() {
  state.screen = "game";
  state.lines = [];
  appendLine("system", "Resumed training session.");
  appendLine("system", "Type help to see available commands. Type exit to return to top menu.");
  const mission = missions[state.currentMissionIndex];
  if (mission) {
    appendLine("success", `${mission.title} active.`);
  } else {
    appendLine("success", "All mock missions complete. restart で最初から遊べます。");
  }
  hintText.textContent = "";
  render();
}

function parseCommand(input) {
  const tokens = input.split(/\s+/).filter(Boolean);
  return { command: tokens[0] || "", args: tokens.slice(1) };
}

function dispatchCommand(parsed, rawInput) {
  const handlers = {
    pwd: executePwd,
    ls: executeLs,
    cd: executeCd,
    cat: executeCat,
    cp: executeCp,
    chmod: executeChmod,
    vi: executeVi,
    clear: executeClear,
    help: executeHelp
  };
  const handler = handlers[parsed.command];
  if (!handler) {
    appendLine("error", `${parsed.command}: command not found`);
    appendLine("warning", "このモックで使えるコマンドは help で確認できます。");
    state.score = Math.max(0, state.score - 10);
    return;
  }
  handler(parsed.args, rawInput);
}

function dispatchOpsCommand(parsed, rawInput) {
  const handlers = {
    pwd: executePwd,
    ls: executeLs,
    cd: executeCd,
    cat: executeCat,
    less: executeReadonlyPager,
    view: executeReadonlyPager,
    grep: executeGrep,
    awk: executeAwk,
    ps: executePs,
    kill: executeKill,
    pkill: executePkill,
    ss: executeSs,
    netstat: executeNetstat,
    dig: executeDig,
    nslookup: executeNslookup,
    df: executeDf,
    du: executeDu,
    find: executeFind,
    sort: executeSort,
    systemctl: executeSystemctl,
    journalctl: executeJournalctl,
    answer: executeAnswer,
    clear: executeClear,
    help: executeOpsHelp
  };
  const handler = handlers[parsed.command];
  if (!handler) {
    appendLine("error", `${parsed.command}: command not found`);
    appendLine("warning", "この実務ミッションで使えるコマンドは help で確認できます。");
    state.score = Math.max(0, state.score - 10);
    return;
  }
  state.opsRuntime.opsCommandHistory.push({ command: parsed.command, rawInput, missionId: state.opsMissionId });
  handler(parsed.args, rawInput);
}

function detectDangerousCommand(parsed, rawInput) {
  const text = rawInput.trim();
  if (parsed.command === "rm") {
    return {
      level: text.includes("-rf") ? "incident" : "warning",
      title: "削除コマンドを検知",
      message: "MVPでは rm は実行されません。削除はインシデント訓練で扱います。",
      penalty: text.includes("-rf") ? 160 : 60
    };
  }
  if (parsed.command === "chmod" && parsed.args.includes("-R") && parsed.args.includes("777")) {
    return {
      level: "incident",
      title: "重大な権限事故",
      message: "chmod -R 777 は広範囲のファイルを誰でも変更可能にする危険操作です。",
      penalty: 180
    };
  }
  if (parsed.command === "chmod" && parsed.args[0] === "777") {
    return {
      level: "warning",
      title: "過剰な権限",
      message: "777 は全員に読み書き実行を許可します。必要最小限の権限を考えましょう。",
      penalty: 80,
      allowAfterWarning: true
    };
  }
  if (/[|;&`$<>]/.test(text)) {
    return {
      level: "warning",
      title: "未対応のシェル構文",
      message: "パイプ、リダイレクト、サブシェルは安全のためMVPでは実行しません。",
      penalty: 40
    };
  }
  return null;
}

function applyIncident(incident) {
  appendLine(incident.level === "incident" ? "error" : "warning", `[${incident.title}] ${incident.message}`);
  appendLine("system", "実OSには影響しません。これは仮想環境内の安全な警告です。");
  state.score = Math.max(0, state.score - incident.penalty);
  state.risk = Math.min(100, state.risk + (incident.level === "incident" ? 45 : 22));
  hintText.textContent = incident.message;
}

function recordCommand(command, rawInput) {
  state.executedCommands.push({ command, rawInput, path: state.currentPath });
}

function executePwd() {
  appendLine("output", state.currentPath);
  state.score += 8;
}

function executeLs(args) {
  const longMode = args[0] === "-l";
  const targetArg = longMode ? args[1] : args[0];
  const targetPath = resolvePath(targetArg || state.currentPath);
  const node = getNode(targetPath);
  if (!node) {
    appendLine("error", `ls: cannot access '${targetArg}': No such file or directory`);
    appendLine("warning", "ヒント: pwd と ls で現在地や候補を確認しましょう。");
    state.score = Math.max(0, state.score - 8);
    return;
  }
  if (node.type === "file") {
    appendLine("output", node.name);
    return;
  }
  const names = Object.keys(node.children).sort();
  if (longMode) {
    names.forEach((name) => {
      const child = node.children[name];
      appendLine("output", `${modeText(child)} ${child.owner} ${child.group} ${name}`);
    });
  } else {
    appendLine("output", names.join("  "));
  }
  state.score += 8;
}

function executeCd(args) {
  if (args.length === 0) {
    state.currentPath = "/home/trainee";
    return;
  }
  const targetPath = resolvePath(args[0]);
  const node = getNode(targetPath);
  if (!node) {
    appendLine("error", `cd: ${args[0]}: No such file or directory`);
    appendLine("warning", "ヒント: ls で移動できるディレクトリを確認しましょう。");
    state.score = Math.max(0, state.score - 8);
    return;
  }
  if (node.type !== "directory") {
    appendLine("error", `cd: ${args[0]}: Not a directory`);
    return;
  }
  state.currentPath = targetPath;
  state.score += 10;
}

function executeCat(args) {
  if (args.length === 0) {
    appendLine("error", "cat: missing operand");
    return;
  }
  const targetPath = resolvePath(args[0]);
  const node = getNode(targetPath);
  if (!node) {
    appendLine("error", `cat: ${args[0]}: No such file or directory`);
    return;
  }
  if (node.type !== "file") {
    appendLine("error", `cat: ${args[0]}: Is a directory`);
    return;
  }
  appendLine("output", node.content);
  state.score += 10;
}

function executeCp(args) {
  if (args.length < 2) {
    appendLine("error", "cp: missing file operand");
    return;
  }
  const sourcePath = resolvePath(args[0]);
  const destPath = resolvePath(args[1]);
  const sourceNode = getNode(sourcePath);
  if (!sourceNode) {
    appendLine("error", `cp: cannot stat '${args[0]}': No such file or directory`);
    return;
  }
  if (sourceNode.type !== "file") {
    appendLine("error", "cp: omitting directory");
    appendLine("warning", "MVPではファイルコピーのみ対応しています。");
    return;
  }
  const parent = getParentNode(destPath);
  if (!parent) {
    appendLine("error", `cp: cannot create regular file '${args[1]}': No such file or directory`);
    return;
  }
  const name = basename(destPath);
  parent.children[name] = { ...sourceNode, name };
  appendLine("success", `${args[0]} -> ${args[1]}`);
  state.score += 24;
}

function executeChmod(args) {
  if (args.length < 2) {
    appendLine("error", "chmod: missing operand");
    return;
  }
  const mode = args[0];
  if (!/^[0-7]{3}$/.test(mode)) {
    appendLine("error", `chmod: invalid mode: '${mode}'`);
    appendLine("warning", "MVPでは 755 のような3桁数値モードに対応しています。");
    return;
  }
  const targetPath = resolvePath(args[1]);
  const node = getNode(targetPath);
  if (!node) {
    appendLine("error", `chmod: cannot access '${args[1]}': No such file or directory`);
    return;
  }
  node.mode = mode;
  appendLine("success", `mode of '${args[1]}' changed to ${mode}`);
  state.score += mode === "777" ? 0 : 24;
}

function executeVi(args) {
  if (args.length === 0) {
    appendLine("error", "vi: missing file operand");
    return;
  }
  const targetPath = args[0] === "manual.txt" ? "/home/trainee/manual.txt" : resolvePath(args[0]);
  const node = getNode(targetPath);
  if (!node) {
    appendLine("error", `vi: ${args[0]}: No such file or directory`);
    return;
  }
  if (node.type !== "file") {
    appendLine("error", `vi: ${args[0]}: Is a directory`);
    return;
  }
  state.manualReturnScreen = "game";
  state.screen = "manual";
  state.lines = [];
  node.content.split("\n").forEach((line) => appendLine("output", line));
  appendLine("muted", "");
  appendLine("muted", `"${args[0]}" [readonly]`);
}

function executeClear() {
  state.lines = [];
}

function executeHelp() {
  appendLine("output", "available commands: pwd, ls, ls -l, cd, cat, cp, chmod, vi, clear, help");
  appendLine("output", "mission commands: next, restart, progress, exit");
  appendLine("muted", "危険操作は実行されず、ゲーム内警告として扱われます。");
}

function executeOpsHelp() {
  appendLine("output", "ops commands: ps, kill, pkill, ss, netstat, dig, nslookup, grep, awk, df, du, find, systemctl, journalctl");
  appendLine("output", "file commands: pwd, ls, cat, less, view, clear");
  appendLine("output", "mission commands: answer, hint, progress, back, exit");
  appendLine("muted", "例: ps / ss / dig api.training.local / grep ERROR /var/log/myapp/app.log / answer node-api");
}

function executeReadonlyPager(args) {
  executeCat(args);
}

function executeGrep(args) {
  if (args.length < 2) {
    appendLine("error", "grep: missing pattern or file");
    return;
  }
  const pattern = args[0];
  const targetPath = resolvePath(args[1]);
  const node = getNode(targetPath);
  if (!node || node.type !== "file") {
    appendLine("error", `grep: ${args[1]}: No such file`);
    return;
  }
  const matches = node.content.split("\n").filter((line) => line.includes(pattern));
  if (matches.length === 0) {
    appendLine("muted", "grep: no matches");
  } else {
    matches.forEach((line) => appendLine("output", line));
  }
  state.score += 14;
}

function executeAwk(args) {
  if (args.length === 0) {
    appendLine("error", "awk: missing program");
    return;
  }
  const target = args[args.length - 1];
  const node = getNode(resolvePath(target));
  if (!node || node.type !== "file") {
    appendLine("error", `awk: cannot open ${target}`);
    return;
  }
  node.content
    .split("\n")
    .filter((line) => line.includes("ERROR"))
    .forEach((line) => appendLine("output", line));
  appendLine("muted", "awk mock: ERROR行のみ表示しました。");
  state.score += 14;
}

function executePs() {
  appendLine("output", "  PID USER       %CPU %MEM COMMAND");
  state.opsRuntime.processes
    .filter((process) => process.status === "running")
    .forEach((process) => {
      appendLine("output", `${process.pid.padStart(5)} ${process.user.padEnd(10)} ${process.cpu.padStart(5)} ${process.mem.padStart(4)} ${process.command}`);
    });
  state.score += 12;
}

function executeKill(args) {
  const pid = args.find((arg) => /^\d+$/.test(arg));
  if (!pid) {
    appendLine("error", "kill: usage: kill [-9] <pid>");
    return;
  }
  const process = state.opsRuntime.processes.find((item) => item.pid === pid);
  if (!process || process.status !== "running") {
    appendLine("error", `kill: (${pid}) - No such process`);
    return;
  }
  process.status = "stopped";
  appendLine("success", `signal sent to ${pid} (${process.command})`);
  state.score += process.command === "runaway-worker" ? 40 : 0;
  if (process.command !== "runaway-worker") {
    applyIncident({
      level: "warning",
      title: "対象外プロセスの停止",
      message: `${process.command} は今回の暴走プロセスではありません。PID確認を徹底しましょう。`,
      penalty: 80
    });
    return;
  }
  completeOpsMission("processStopped");
}

function executePkill(args) {
  const name = args.find((arg) => !arg.startsWith("-"));
  if (!name) {
    appendLine("error", "pkill: missing process name");
    return;
  }
  const process = state.opsRuntime.processes.find((item) => item.command === name && item.status === "running");
  if (!process) {
    appendLine("error", `pkill: no matching process: ${name}`);
    return;
  }
  executeKill([process.pid]);
}

function executeSs() {
  appendLine("output", "Netid State  Local Address:Port  Process");
  state.opsRuntime.ports.forEach((port) => {
    appendLine("output", `${port.proto.padEnd(5)} ${port.state.padEnd(6)} ${port.local.padEnd(19)} users:((${port.app},pid=${port.pid}))`);
  });
  state.score += 12;
}

function executeNetstat() {
  appendLine("output", "Proto Local Address       State   PID/Program name");
  state.opsRuntime.ports.forEach((port) => {
    appendLine("output", `${port.proto.padEnd(5)} ${port.local.padEnd(19)} ${port.state.padEnd(7)} ${port.pid}/${port.app}`);
  });
  state.score += 12;
}

function executeDig(args) {
  const host = args.find((arg) => !arg.startsWith("+")) || "api.training.local";
  const ip = state.opsRuntime.dnsRecords[host];
  if (!ip) {
    appendLine("output", `;; QUESTION SECTION:\n;${host}. IN A`);
    appendLine("warning", ";; no answer");
    return;
  }
  appendLine("output", `;; QUESTION SECTION:\n;${host}. IN A`);
  appendLine("output", `;; ANSWER SECTION:\n${host}. 60 IN A ${ip}`);
  state.score += 12;
}

function executeNslookup(args) {
  const host = args[0] || "api.training.local";
  const ip = state.opsRuntime.dnsRecords[host];
  appendLine("output", "Server:  192.0.2.53");
  appendLine("output", "Address: 192.0.2.53#53");
  appendLine("muted", "");
  if (!ip) {
    appendLine("warning", `** server can't find ${host}: NXDOMAIN`);
    return;
  }
  appendLine("output", `Name:    ${host}`);
  appendLine("output", `Address: ${ip}`);
  state.score += 12;
}

function executeDf() {
  appendLine("output", "Filesystem      Size  Used Avail Use% Mounted on");
  appendLine("output", "/dev/vda1        40G   18G   22G  45% /");
  appendLine("output", "/dev/vdb1        20G   19G  1.0G  95% /var");
  appendLine("output", "tmpfs           2.0G  120M  1.9G   6% /run");
  state.score += 12;
}

function executeDu(args) {
  const target = args[args.length - 1] || ".";
  if (target.includes("/var/log/myapp")) {
    appendLine("output", "120K\t/var/log/myapp/app.log");
    appendLine("output", "9.4G\t/var/log/myapp/archive.log");
    appendLine("output", "9.5G\t/var/log/myapp");
  } else if (target.includes("/var")) {
    appendLine("output", "9.5G\t/var/log/myapp");
    appendLine("output", "780M\t/var/log/nginx");
    appendLine("output", "12G\t/var");
  } else {
    appendLine("output", "24K\t.");
  }
  state.score += 12;
}

function executeFind(args) {
  const target = args[0] || state.currentPath;
  if (target.startsWith("/var")) {
    appendLine("output", "/var/log/myapp/archive.log");
    appendLine("output", "/var/log/myapp/app.log");
    appendLine("output", "/var/log/nginx/access.log");
  } else {
    appendLine("output", `${resolvePath(target)}/readme.txt`);
  }
  state.score += 10;
}

function executeSort(args) {
  if (args.length === 0) {
    appendLine("warning", "sort mock: パイプ入力は未対応です。du の結果を見て大きい行を判断してください。");
    return;
  }
  const node = getNode(resolvePath(args[0]));
  if (!node || node.type !== "file") {
    appendLine("error", `sort: cannot read: ${args[0]}`);
    return;
  }
  node.content.split("\n").filter(Boolean).sort().forEach((line) => appendLine("output", line));
}

function executeSystemctl(args) {
  if (args[0] !== "status" || !args[1]) {
    appendLine("error", "systemctl mock: usage: systemctl status <service>");
    return;
  }
  const serviceName = args[1].replace(/\.service$/, "");
  const service = state.opsRuntime.services[serviceName];
  if (!service) {
    appendLine("error", `Unit ${serviceName}.service could not be found.`);
    return;
  }
  appendLine("output", `● ${serviceName}.service - Training application service`);
  appendLine("output", `   Loaded: ${service.loaded}`);
  appendLine("error", `   Active: ${service.active} (Result: exit-code)`);
  appendLine("output", `   Status: ${service.reason}`);
  state.score += 12;
}

function executeJournalctl(args) {
  const unitIndex = args.findIndex((arg) => arg === "-u");
  const unit = (unitIndex >= 0 ? args[unitIndex + 1] : args[0] || "").replace(/\.service$/, "");
  if (unit !== "myapp") {
    appendLine("warning", "journalctl mock: myapp のログだけを用意しています。");
    return;
  }
  appendLine("output", "Apr 28 09:13:11 quest myapp[2840]: starting application");
  appendLine("error", "Apr 28 09:13:12 quest myapp[2840]: ERROR missing environment file /etc/myapp/env.production");
  appendLine("output", "Apr 28 09:13:12 quest systemd[1]: myapp.service: Failed with result 'exit-code'.");
  state.score += 12;
}

function executeAnswer(args) {
  const mission = getCurrentOpsMission();
  if (!mission) {
    appendLine("warning", "回答対象のミッションがありません。");
    return;
  }
  const answer = args.join(" ").trim();
  if (!answer) {
    appendLine("error", "answer: missing answer text");
    return;
  }
  if (mission.check === "processStopped") {
    appendLine("warning", "このミッションは answer ではなく、対象プロセスを kill または pkill で停止するとクリアです。");
    appendLine("system", mission.answerGuide);
    return;
  }
  if (isExpectedAnswer(mission, answer)) {
    appendLine("success", `answer accepted: ${answer}`);
    completeOpsMission("answer");
    return;
  }
  appendLine("warning", `answer rejected: ${answer}`);
  appendLine("system", `求められている回答: ${mission.clearCondition}`);
  appendLine("system", getOpsProgressiveHint(mission));
  state.score = Math.max(0, state.score - 20);
}

function resolvePath(path) {
  if (!path || path === ".") return state.currentPath;
  const baseParts = path.startsWith("/") ? [] : state.currentPath.split("/").filter(Boolean);
  const parts = path.split("/").filter(Boolean);
  parts.forEach((part) => {
    if (part === ".") return;
    if (part === "..") {
      baseParts.pop();
      return;
    }
    baseParts.push(part);
  });
  return `/${baseParts.join("/")}`;
}

function getNode(path) {
  const normalized = resolvePath(path);
  if (normalized === "/") return state.fileSystem;
  const parts = normalized.split("/").filter(Boolean);
  let node = state.fileSystem;
  for (const part of parts) {
    if (!node || node.type !== "directory" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function getParentNode(path) {
  const parts = resolvePath(path).split("/").filter(Boolean);
  parts.pop();
  return getNode(`/${parts.join("/")}`);
}

function basename(path) {
  const parts = resolvePath(path).split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function modeText(node) {
  const type = node.type === "directory" ? "d" : "-";
  const digits = node.mode.padStart(3, "0").slice(-3);
  const triplets = digits.split("").map((digit) => {
    const value = Number(digit);
    return `${value & 4 ? "r" : "-"}${value & 2 ? "w" : "-"}${value & 1 ? "x" : "-"}`;
  });
  return `${type}${triplets.join("")}`;
}

function isGoalDone(goal) {
  if (goal.type === "commandExecuted") {
    return state.executedCommands.some((entry) => entry.command === goal.command);
  }
  if (goal.type === "commandExecutedInPath") {
    return state.executedCommands.some((entry) => entry.command === goal.command && entry.path === goal.path);
  }
  if (goal.type === "currentPath") {
    return state.currentPath === goal.path;
  }
  if (goal.type === "fileExists") {
    return Boolean(getNode(goal.path));
  }
  if (goal.type === "fileMode") {
    const node = getNode(goal.path);
    return Boolean(node && node.mode === goal.mode);
  }
  return false;
}

function findOpsMission(input) {
  const normalized = input.trim().toLowerCase();
  const index = Number(normalized) - 1;
  if (Number.isInteger(index) && opsMissions[index]) {
    return opsMissions[index];
  }
  return opsMissions.find((mission) => mission.id === normalized || mission.title.toLowerCase() === normalized) || null;
}

function getCurrentOpsMission() {
  if (!state.opsMissionId) return null;
  return opsMissions.find((mission) => mission.id === state.opsMissionId) || null;
}

function isOpsMissionCompleted(mission) {
  return Boolean(mission && state.completedOpsMissionIds.includes(mission.id));
}

function isOpsGoalDone(mission, goal) {
  if (isOpsMissionCompleted(mission)) return true;
  const commands = state.opsRuntime.opsCommandHistory
    .filter((entry) => entry.missionId === mission.id)
    .map((entry) => entry.command);
  if (goal.includes("ps")) return commands.includes("ps");
  if (goal.includes("ss") || goal.includes("netstat")) return commands.includes("ss") || commands.includes("netstat");
  if (goal.includes("dig") || goal.includes("nslookup")) return commands.includes("dig") || commands.includes("nslookup");
  if (goal.includes("ERROR")) return commands.includes("grep") || commands.includes("awk");
  if (goal.includes("df")) return commands.includes("df");
  if (goal.includes("systemctl")) return commands.includes("systemctl");
  if (goal.includes("journalctl")) return commands.includes("journalctl");
  if (goal.includes("answer")) return isOpsMissionCompleted(mission);
  if (goal.includes("kill")) {
    const target = state.opsRuntime.processes.find((process) => process.command === mission.target.name);
    return Boolean(target && target.status === "stopped");
  }
  return false;
}

function isExpectedAnswer(mission, answer) {
  const normalized = normalizeAnswer(answer);
  return mission.target.answer.some((expected) => normalized.includes(normalizeAnswer(expected)));
}

function normalizeAnswer(value) {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function completeOpsMission(checkType) {
  const mission = getCurrentOpsMission();
  if (!mission || isOpsMissionCompleted(mission)) return;
  if (mission.check !== checkType) return;
  state.completedOpsMissionIds.push(mission.id);
  state.score += 90;
  state.risk = Math.max(0, state.risk - 15);
  hintText.textContent = "ミッション完了。next または「次へ」でボードへ戻れます。";
  appendLine("success", "");
  appendLine("success", `[OPS MISSION COMPLETE] ${mission.successMessage}`);
  appendLine("system", "next でミッションボードに戻れます。");
}

function checkMissionCompletion() {
  const mission = missions[state.currentMissionIndex];
  if (!mission || state.completedCurrentMission) return;
  const done = mission.goals.every(isGoalDone);
  if (!done) return;
  state.completedCurrentMission = true;
  if (!state.completedMissionIds.includes(mission.id)) {
    state.completedMissionIds.push(mission.id);
  }
  state.score += 60;
  state.risk = Math.max(0, state.risk - 10);
  appendLine("success", "");
  appendLine("success", `[MISSION COMPLETE] ${mission.completionMessage}`);
  appendLine("system", "次のミッションへ進むには next と入力するか、学習パネルの「次へ」を押してください。");
}

function goNextMission() {
  if (!state.completedCurrentMission) {
    appendLine("warning", "現在のミッションはまだ完了していません。");
    render();
    return;
  }
  state.currentMissionIndex += 1;
  state.hintIndex = 0;
  state.completedCurrentMission = false;
  hintText.textContent = "";
  const mission = missions[state.currentMissionIndex];
  if (!mission) {
    appendLine("success", "All mock missions complete.");
    appendLine("system", "restart で最初から遊べます。");
    render();
    return;
  }
  appendLine("muted", "");
  appendLine("success", `${mission.title} loaded.`);
  render();
}

function showHint() {
  if (state.screen === "ops-mission") {
    showOpsHint();
    return;
  }
  if (state.screen !== "game") return;
  const mission = missions[state.currentMissionIndex];
  if (!mission || state.completedCurrentMission) return;
  const hint = mission.hints[Math.min(state.hintIndex, mission.hints.length - 1)];
  hintText.textContent = hint;
  state.hintIndex = Math.min(state.hintIndex + 1, mission.hints.length - 1);
  state.score = Math.max(0, state.score - 12);
  render();
}

function showOpsHint() {
  const mission = getCurrentOpsMission();
  if (!mission || isOpsMissionCompleted(mission)) return;
  const hint = mission.hints[Math.min(state.opsHintIndex, mission.hints.length - 1)];
  hintText.textContent = hint;
  appendLine("system", `[hint] ${hint}`);
  state.opsHintIndex = Math.min(state.opsHintIndex + 1, mission.hints.length - 1);
  state.score = Math.max(0, state.score - 12);
  render();
}

function getOpsProgressiveHint(mission) {
  const hint = mission.hints[Math.min(state.opsHintIndex, mission.hints.length - 1)];
  state.opsHintIndex = Math.min(state.opsHintIndex + 1, mission.hints.length - 1);
  hintText.textContent = hint;
  return `ヒント: ${hint}`;
}

function handleNextButton() {
  if (state.screen === "ops-mission") {
    if (isOpsMissionCompleted(getCurrentOpsMission())) {
      showOpsMissionBoard();
    }
    return;
  }
  goNextMission();
}

function getCurrentTypingQuestion() {
  return state.typing.questions[state.typing.currentIndex] || null;
}

function getChallengeElapsedSeconds() {
  if (!state.typing.startedAt) return 0;
  const end = state.typing.endedAt || Date.now();
  return Math.max(0, Math.floor((end - state.typing.startedAt) / 1000));
}

function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function getChallengeRank(finalSeconds, accuracy) {
  if (finalSeconds <= 60 && accuracy >= 0.95) return "S";
  if (finalSeconds <= 90 && accuracy >= 0.9) return "A";
  if (finalSeconds <= 120 && accuracy >= 0.8) return "B";
  return "C";
}

function getProgressiveCommandHint(expected) {
  state.typing.hintRevealCount = Math.min(expected.length, state.typing.hintRevealCount + 1);
  const prefix = expected.slice(0, state.typing.hintRevealCount);
  return `ヒント: ${prefix}から始まる${expected.length}文字です`;
}

commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleInput(commandInput.value);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (state.history.length === 0) return;
    if (state.historyIndex === null) {
      state.historyIndex = state.history.length - 1;
    } else {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
    }
    commandInput.value = state.history[state.historyIndex];
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (state.historyIndex === null) return;
    state.historyIndex += 1;
    if (state.historyIndex >= state.history.length) {
      state.historyIndex = null;
      commandInput.value = "";
    } else {
      commandInput.value = state.history[state.historyIndex];
    }
  }
});

hintButton.addEventListener("click", showHint);
nextButton.addEventListener("click", handleNextButton);
window.addEventListener("resize", resizeCanvas);
document.addEventListener("click", () => commandInput.focus());

resizeCanvas();
startBootSequence();
