# 日本人はどこへ移り住んできたか

住民基本台帳人口移動報告をもとに、東京一極集中、地方→都市、バブル・震災・コロナによる人口移動を探索するダッシュボード。

Phase 1 骨格。ビュー実装は Phase 2。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: https://japan-data-migration.visualizing.jp

## 開発

```bash
cp .env.example .env   # Phase 2 で ESTAT_APP_ID を設定（必要時）
npm install
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run meta` | e-Stat メタ情報（未接続） |
| `npm run fetch` | e-Stat 生データ取得（未接続） |
| `npm run data` | 配信用 cube 構築（未接続） |
| `npm run verify` | 健全性チェック |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-migration.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
