/**
 * 地域ビュー。都道府県 × 転入超過（転入・転出）。
 */

import { use, useMemo, useState } from "react";
import { loadGeo } from "../data/chunks.ts";
import { geoMetrics } from "../data/hierarchy.ts";
import { Segmented } from "../components/Segmented.tsx";
import { TileMap, type Tile } from "../components/TileMap.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const int = new Intl.NumberFormat("ja-JP");

function formatPeople(value: number | null): string {
  if (value === null) return "データなし";
  if (value > 0) return `+${int.format(Math.round(value))}人`;
  if (value < 0) return `−${int.format(Math.round(Math.abs(value)))}人`;
  return "0人";
}

export function GeoView() {
  const { metrics, areas, cube, years } = use(loadGeo());
  const selectable = useMemo(() => geoMetrics(metrics), [metrics]);
  const options = useMemo(
    () => selectable.map((m) => ({ value: m.code, label: m.label })),
    [selectable],
  );

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));
  const [metric, setMetric] = useUrlState<string>("metric", "net", (v) =>
    selectable.some((c) => c.code === v),
  );
  const [area, setArea] = useUrlState<string>("area", "", (v) =>
    v === "" || areas.some((a) => a.code === v && a.code !== "00000"),
  );
  const [hovered, setHovered] = useState<string | null>(null);

  const prefectures = useMemo(() => areas.slice(1), [areas]);
  const currentMeta = selectable.find((m) => m.code === metric) ?? selectable[0]!;
  const values = cube.series("value", "area", { metric, year });

  const tiles = useMemo((): Tile[] => {
    const mode = metric === "net" ? "net" : "flow";
    return prefectures.map((a, i) => {
      const value = values[i + 1] ?? null;
      const certain =
        value !== null && (metric === "net" ? Math.abs(value) >= 1_500 : value >= 3_000);
      return {
        code: a.code,
        label: a.label,
        value,
        certain,
        mode,
      };
    });
  }, [prefectures, values, metric]);

  const ranked = useMemo(
    () =>
      tiles
        .filter((t): t is Tile & { value: number } => t.value !== null)
        .sort((a, b) => b.value - a.value),
    [tiles],
  );

  const focusCode = hovered ?? (area === "" ? null : area);
  const focus =
    focusCode === null ? undefined : tiles.find((t) => t.code === focusCode);

  const pinned = area === "" ? null : area;
  const pinnedTile = pinned === null ? undefined : tiles.find((t) => t.code === pinned);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-6">
      <main className="min-w-0">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex min-w-0 flex-wrap items-baseline gap-3">
            <h1 className="truncate text-[19px] font-semibold tracking-tight">
              {currentMeta.label}
            </h1>
            <p className="tnum shrink-0 text-[13px] text-muted">{year}年</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented options={options} value={metric} onChange={setMetric} label="指標" />
            <YearSelect years={years} value={year} onChange={setYear} />
          </div>
        </header>

        <p className="tnum min-h-9 pb-4 text-[12.5px]">
          {focus !== undefined ? (
            <>
              <span className="font-semibold">{focus.label}</span>
              <span className="text-muted"> {formatPeople(focus.value)}</span>
            </>
          ) : ranked.length >= 2 ? (
            <span className="text-muted">
              最も転入超過が大きい{" "}
              <span className="font-semibold text-ink">
                {ranked[0]!.label} {formatPeople(ranked[0]!.value)}
              </span>
              {"  ／  最も転出超過が大きい "}
              <span className="font-semibold text-ink">
                {ranked.at(-1)!.label} {formatPeople(ranked.at(-1)!.value)}
              </span>
            </span>
          ) : (
            <span className="text-muted">県を選ぶと人数が出る。</span>
          )}
        </p>

        <TileMap
          tiles={tiles}
          hovered={hovered}
          onHover={setHovered}
          pinned={pinned}
          onPin={(code) => setArea(code ?? "")}
        />

        {pinnedTile !== undefined && (
          <div className="mt-5 border-t border-rule pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[14px] font-semibold">{pinnedTile.label}</h2>
              <button
                type="button"
                className="cursor-pointer text-[11px] text-muted transition-colors hover:text-ink"
                onClick={() => setArea("")}
              >
                解除
              </button>
            </div>
            <dl className="mt-2 grid gap-2 sm:grid-cols-3">
              {(["net", "in", "out"] as const).map((code) => {
                const label = selectable.find((m) => m.code === code)?.label ?? code;
                const v = cube.at("value", { metric: code, year, area: pinnedTile.code });
                return (
                  <div key={code}>
                    <dt className="text-[11px] text-faint">{label}</dt>
                    <dd className="tnum text-[15px] font-semibold">{formatPeople(v)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          他都道府県との転入・転出（県内移動は含まない）。日本人移動者。
          地図は47県を同じ大きさの升目に置いた模式図。転入超過は0を境に青と赤。小さい差は塗らない。
        </p>
      </main>
    </div>
  );
}
