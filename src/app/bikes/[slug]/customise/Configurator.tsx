"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { SizePicker } from "@/components/SizePicker";
import { defaultSelection, priceBuild, renderPath } from "@/lib/customization";
import { bikeImage, customRender, usd } from "@/lib/format";
import type { BuildSelection, CustomStep, Customization, Product, ProductSize } from "@/lib/types";

type Tab = { key: string; title: string };

export function Configurator({ product, sizes }: { product: Product; sizes: ProductSize[] }) {
  const def = product.customization as Customization;
  const { add } = useCart();
  const [selection, setSelection] = useState<BuildSelection>(() => defaultSelection(def));
  const [size, setSize] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // Same order as Canyon: Colour, Frame size, components..., Summary
  const [colourStep, ...partSteps] = def.steps;
  const tabs: Tab[] = [
    { key: colourStep.key, title: colourStep.title },
    { key: "size", title: "Frame size" },
    ...partSteps.map((s) => ({ key: s.key, title: s.title })),
    { key: "summary", title: "Summary" },
  ];
  const tab = tabs[tabIndex];
  const step = def.steps.find((s) => s.key === tab.key);

  const { extra, lines } = priceBuild(def, selection);
  const total = product.price_usd + extra;
  const colour = colourStep.options.find((o) => o.id === selection[colourStep.key]?.option)!;
  const accent = colour.accents?.find((a) => a.name === selection[colourStep.key]?.choice) ?? colour.accents?.[0];
  const view = step?.view; // e.g. cockpit step shows a close-up
  const imageFor = (sel: BuildSelection, v?: string) => {
    const path = renderPath(def, sel);
    return path ? customRender(path, v) : bikeImage(product.image_id, 1400);
  };
  const preview = imageFor(selection, view);
  const [loadedPreview, setLoadedPreview] = useState<string | null>(null);

  // Warm the browser cache so switching colours is instant
  useEffect(() => {
    colourStep.options.forEach((o) =>
      (o.accents ?? [{ name: o.choice?.default }]).forEach((a) => {
        new Image().src = imageFor({ ...selection, [colourStep.key]: { option: o.id, choice: a.name } });
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per product
  }, [product.id]);

  // ...and every bar/stem combination once the customer opens a close-up step
  useEffect(() => {
    if (!view || !step) return;
    step.options.forEach((o) =>
      (o.choice?.values ?? [undefined]).forEach((c) => {
        new Image().src = imageFor({ ...selection, [step.key]: { option: o.id, choice: c } }, view);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run per step / frame colour only
  }, [view, step?.key, selection[colourStep.key]?.option, selection[colourStep.key]?.choice]);

  function pick(stepKey: string, option: string, choice?: string) {
    setSelection((prev) => ({ ...prev, [stepKey]: { option, choice } }));
    setAdded(false);
  }

  function addToCart() {
    if (!size) {
      setTabIndex(1);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: `Custom ${product.name}`,
      size,
      priceUsd: total,
      imageId: product.image_id,
      imageUrl: renderPath(def, selection) ? customRender(renderPath(def, selection)!, undefined, 400) : undefined,
      build: selection,
      buildLines: lines,
    });
    setAdded(true);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Preview */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="relative rounded-2xl bg-mist p-6 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={preview}
            src={preview}
            alt={`${product.name} สี ${colour.name}${accent ? ` โลโก้/ผ้าพันแฮนด์ ${accent.name}` : ""}`}
            onLoad={() => setLoadedPreview(preview)}
            className={`w-full transition-opacity duration-300 ${loadedPreview === preview ? "opacity-100" : "opacity-40"}`}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={colour.swatch} alt="" className="h-9 w-9 rounded-full" />
            <div className="text-xs leading-tight">
              <p className="font-semibold">{colour.name}</p>
              <p className="text-muted">{accent ? `Logos & bar tape: ${accent.name}` : colour.group}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex min-w-0 flex-col">
        <p className="text-sm text-muted">
          <Link href={`/bikes/${product.slug}`} className="hover:underline">← {product.name}</Link>
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase">Custom {product.name}</h1>

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line pb-px text-sm">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTabIndex(i)}
              className={`shrink-0 border-b-2 px-2.5 py-2 ${i === tabIndex ? "border-ink font-semibold" : "border-transparent text-muted hover:text-ink"}`}
            >
              {i + 1}. {t.title}
            </button>
          ))}
        </nav>

        <div className="min-h-[360px] py-6">
          {step && <StepPanel step={step} selection={selection} onPick={pick} />}

          {tab.key === "size" && (
            <div>
              <h2 className="text-xl font-semibold">เลือกไซซ์เฟรม</h2>
              <p className="mb-5 mt-1 text-sm text-muted">สต็อกแยกตามไซซ์ — ไซซ์ที่ขีดฆ่าคือหมดแล้ว</p>
              <SizePicker sizes={sizes} value={size} onChange={(s) => { setSize(s); setAdded(false); }} />
            </div>
          )}

          {tab.key === "summary" && (
            <div>
              <h2 className="text-xl font-semibold">สรุปสเปกจักรยานของคุณ</h2>
              <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
                <Row label="ราคาเริ่มต้น" value={product.name} price={usd(product.price_usd)} />
                <Row label="Frame size" value={size ?? "ยังไม่ได้เลือก"} warn={!size} />
                {lines.map((l) => (
                  <Row key={l.step} label={l.step} value={l.value} price={l.price ? `+ ${usd(l.price)}` : undefined} />
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-4 border-t border-line bg-white py-4">
          <div>
            <p className="text-xs text-muted">ราคารวม</p>
            <p className="font-display text-3xl font-bold tabular-nums">{usd(total)}</p>
            {extra > 0 && <p className="text-xs text-muted">รวมตัวเลือกเพิ่ม {usd(extra)}</p>}
          </div>
          <div className="flex items-center gap-2">
            {tabIndex > 0 && (
              <button onClick={() => setTabIndex(tabIndex - 1)} className="btn-outline px-4" aria-label="ย้อนกลับขั้นก่อนหน้า">
                ← ย้อนกลับ
              </button>
            )}
            {tabIndex < tabs.length - 1 && (
              <button onClick={() => setTabIndex(tabIndex + 1)} className="btn-outline px-4" aria-label="ขั้นต่อไป">
                ถัดไป →
              </button>
            )}
            <button onClick={addToCart} className="btn-dark">
              {size ? "เพิ่มลงตะกร้า" : "เลือกไซซ์"}
            </button>
          </div>
        </div>
        {added && (
          <p className="pb-4 text-right text-sm">
            เพิ่มแล้ว ✓ <Link href="/cart" className="font-semibold underline">ไปที่ตะกร้า</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function StepPanel({
  step,
  selection,
  onPick,
}: {
  step: CustomStep;
  selection: BuildSelection;
  onPick: (stepKey: string, option: string, choice?: string) => void;
}) {
  const current = selection[step.key];

  // Colour step: swatches grouped by collection
  if (step.options.some((o) => o.swatch)) {
    const groups = [...new Set(step.options.map((o) => o.group!))];
    const picked = step.options.find((o) => o.id === current.option)!;
    return (
      <div>
        <h2 className="text-xl font-semibold">
          {step.heading}: <span className="font-normal">{picked.name}</span>
        </h2>
        <p className="mt-1 text-sm text-muted">{step.description}</p>
        <div className="mt-4 divide-y divide-line">
          {groups.map((g) => {
            const opts = step.options.filter((o) => o.group === g);
            return (
              <div key={g} className="py-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{g}</span>
                  <span className={opts.some((o) => o.id === picked.id) ? "font-semibold text-emerald-700" : "text-muted"}>
                    {opts.some((o) => o.id === picked.id) ? "เลือกอยู่" : opts[0].price ? `+ ${usd(opts[0].price)}` : "ไม่มีค่าใช้จ่ายเพิ่ม"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {opts.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onPick(step.key, o.id, o.choice?.default)}
                      title={o.name}
                      aria-label={o.name}
                      aria-pressed={o.id === picked.id}
                      className={`rounded-full p-0.5 ring-2 transition ${o.id === picked.id ? "ring-ink" : "ring-transparent hover:ring-line"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.swatch} alt="" className="h-12 w-12 rounded-full" />
                    </button>
                  ))}
                </div>
                {opts.some((o) => o.id === picked.id) && picked.accents && picked.choice && (
                  <div className="mt-4 rounded-xl bg-mist p-4">
                    <p className="text-sm font-semibold">
                      {picked.choice.label}: <span className="font-normal">{current.choice ?? picked.choice.default}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {picked.accents.map((a) => {
                        const active = (current.choice ?? picked.choice!.default) === a.name;
                        return (
                          <button
                            key={a.name}
                            onClick={() => onPick(step.key, picked.id, a.name)}
                            aria-pressed={active}
                            className={`flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-sm ${active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink"}`}
                          >
                            {a.swatch ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.swatch} alt="" className="h-8 w-8 rounded-full" />
                            ) : (
                              <span className="h-8 w-8 rounded-full border border-line bg-mist" />
                            )}
                            {a.name}
                          </button>
                        );
                      })}
                    </div>
                    {picked.accents.length === 1 && (
                      <p className="mt-2 text-xs text-muted">สีนี้มีโลโก้และผ้าพันแฮนด์แบบเดียว</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Component steps: option cards (+ sub-choice such as stem length)
  return (
    <div>
      <h2 className="text-xl font-semibold">{step.heading}</h2>
      <p className="mt-1 text-sm text-muted">{step.description}</p>
      <div className="mt-5 space-y-3">
        {step.options.map((o) => {
          const active = o.id === current.option;
          return (
            <div
              key={o.id}
              className={`rounded-xl border p-4 transition-colors ${active ? "border-ink ring-1 ring-ink" : "border-line hover:border-muted"}`}
            >
              <button className="flex w-full items-start justify-between gap-4 text-left" onClick={() => onPick(step.key, o.id, o.choice?.default)}>
                {o.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.image} alt="" className="h-20 w-20 shrink-0 rounded-lg bg-mist object-contain p-1" />
                )}
                <span className="flex-1">
                  <span className="block font-semibold">{o.name}</span>
                  {o.note && <span className="block text-sm text-muted">{o.note}</span>}
                </span>
                <span className={`shrink-0 text-sm ${active ? "font-semibold text-emerald-700" : "text-muted"}`}>
                  {active ? "เลือกอยู่" : o.price ? `+ ${usd(o.price)}` : "ไม่มีค่าใช้จ่ายเพิ่ม"}
                </span>
              </button>
              {active && o.choice && (
                <div className="mt-4">
                  <p className="text-sm font-medium">
                    {o.choice.label} <span className="text-muted">(แนะนำ {o.choice.default})</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {o.choice.values.map((v) => (
                      <button
                        key={v}
                        onClick={() => onPick(step.key, o.id, v)}
                        className={`rounded-lg border px-3 py-2 text-sm ${current.choice === v ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, price, warn }: { label: string; value: string; price?: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className={`flex-1 ${warn ? "font-semibold text-red-700" : "font-medium"}`}>{value}</dd>
      <dd className="shrink-0 tabular-nums text-muted">{price}</dd>
    </div>
  );
}
