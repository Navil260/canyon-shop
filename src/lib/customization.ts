import type { BuildLine, BuildSelection, Customization, CustomOption } from "./types";

export function defaultSelection(def: Customization): BuildSelection {
  return Object.fromEntries(
    def.steps.map((step) => {
      const opt = step.options.find((o) => o.id === step.default)!;
      return [step.key, { option: opt.id, choice: opt.choice?.default }];
    }),
  );
}

// Mirrors public.price_build in the database. The browser uses it for display only;
// the database recalculates the real price at checkout.
export function priceBuild(def: Customization, sel: BuildSelection) {
  const lines: BuildLine[] = def.steps.map((step) => {
    const picked = sel[step.key];
    const opt = step.options.find((o) => o.id === picked?.option) ?? step.options.find((o) => o.id === step.default)!;
    const choice = opt.choice ? picked?.choice ?? opt.choice.default : undefined;
    return { step: step.title, value: choice ? `${opt.name} · ${choice}` : opt.name, price: opt.price };
  });
  return { extra: lines.reduce((sum, l) => sum + l.price, 0), lines };
}

function picked(def: Customization, sel: BuildSelection, key: string) {
  const step = def.steps.find((s) => s.key === key);
  if (!step) return undefined;
  const opt: CustomOption | undefined =
    step.options.find((o) => o.id === sel[key]?.option) ?? step.options.find((o) => o.id === step.default);
  return opt && { opt, choice: sel[key]?.choice ?? opt.choice?.default };
}

// Fill Canyon's render template with the layers for the current build.
// Each {stepKey} placeholder takes the selected option's render layer; colour and
// cockpit have special rules. Returns null when the product has no render template.
export function renderPath(def: Customization, sel: BuildSelection) {
  if (!def.preview) return null;

  return def.preview.replace(/\{(\w+)\}/g, (_, key: string) => {
    const pick = picked(def, sel, key);
    if (!pick) return "";
    if (key === "colour") {
      const accent = pick.opt.accents?.find((a) => a.name === pick.choice) ?? pick.opt.accents?.[0];
      return accent?.render ?? pick.opt.render ?? "";
    }
    if (key === "cockpit" && !pick.opt.render) {
      // A modular bar is stem length + drop shape; a one-piece bar has its own layer
      return `${pick.opt.choiceRenders?.[pick.choice ?? ""]}-${picked(def, sel, "drops")?.opt.render}`;
    }
    return pick.opt.render ?? "";
  });
}
