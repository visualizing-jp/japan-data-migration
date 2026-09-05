import { useUrlState } from "./hooks/useUrlState.ts";

const VIEWS = [
  { id: "era", label: "時代", hint: "長期推移", ready: true },
  { id: "geo", label: "地域", hint: "転入超過", ready: true },
  { id: "events", label: "出来事", hint: "イベント注記", ready: true },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function App() {
  const [view, setView] = useUrlState<ViewId>("view", "era", (v) =>
    VIEWS.some((x) => x.id === v && x.ready),
  );

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-6 pt-5">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">
              日本人はどこへ移り住んできたか
            </h1>
            <p className="text-[11px] text-muted">
              住民基本台帳人口移動報告
            </p>
          </div>
          <nav className="flex gap-1 -mb-px" aria-label="ビュー">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.ready}
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`cursor-pointer border-b-2 px-3 pt-1 pb-2 text-[13px] transition-colors duration-150 disabled:cursor-not-allowed disabled:text-faint ${
                  view === v.id
                    ? "border-accent font-semibold text-ink"
                    : "border-transparent text-muted hover:text-ink disabled:hover:text-faint"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[10px] font-normal text-faint">
                  {v.ready ? v.hint : "準備中"}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

<main className="mx-auto w-full max-w-[1240px] px-6 py-16">
  <p className="text-[13px] text-ink">「日本人はどこへ移り住んできたか」のビュー実装は Phase 2 で進めます。</p>
  <p className="mt-2 text-[12px] text-muted">
    いまは骨格のみ。主な統計は「住民基本台帳人口移動報告」。可視化の核: 東京一極集中、地方→都市、バブル・震災・コロナによる人口移動
  </p>
  <p className="mt-4 text-[11px] text-faint">選択中のタブ: {view}</p>
</main>

      <footer className="mx-auto w-full max-w-[1240px] px-6 pt-2 pb-10 text-[11px] leading-relaxed text-faint">
        出典: 住民基本台帳人口移動報告（詳細は docs/data-sources.md。表IDは調査後に確定）。
        <a
          href="https://visualizing.jp/"
          className="mt-2 block w-fit transition-colors duration-150 hover:text-muted"
        >
          visualizing.jp
        </a>
      </footer>
    </div>
  );
}
