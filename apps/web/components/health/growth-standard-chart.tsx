"use client";

import { useMemo, useState } from "react";
import { Activity, Info, Ruler, Scale, SmilePlus } from "lucide-react";
import type { GrowthAssessmentPoint, GrowthChart, GrowthIndicator, GrowthReferencePoint } from "@ninibu/types";
import { formatDate, formatNumber } from "@/lib/format";

const WIDTH = 760;
const HEIGHT = 330;
const PAD = { top: 20, right: 24, bottom: 48, left: 58 };

type IndicatorKey = "weight_for_age" | "height_for_age" | "bmi_for_age" | "head_circumference_for_age";

type IndicatorMeta = {
  label: string;
  shortLabel: string;
  unit: string;
  icon: typeof Scale;
};

const META: Record<IndicatorKey, IndicatorMeta> = {
  weight_for_age: { label: "وزن نسبت به سن", shortLabel: "وزن", unit: "کیلوگرم", icon: Scale },
  height_for_age: { label: "قد نسبت به سن", shortLabel: "قد", unit: "سانتی‌متر", icon: Ruler },
  bmi_for_age: { label: "BMI نسبت به سن", shortLabel: "BMI", unit: "kg/m²", icon: Activity },
  head_circumference_for_age: { label: "دور سر نسبت به سن", shortLabel: "دور سر", unit: "سانتی‌متر", icon: SmilePlus },
};

const KEYS: IndicatorKey[] = ["weight_for_age", "height_for_age", "bmi_for_age", "head_circumference_for_age"];

export function GrowthStandardChart({ chart, childName }: { chart?: GrowthChart; childName: string }) {
  const [active, setActive] = useState<IndicatorKey>("weight_for_age");
  const indicator = chart?.indicators?.[active];
  const meta = META[active];

  if (!chart?.indicators) {
    return <section className="surface-card who-growth-card">
      <div className="who-growth-heading">
        <div><span className="card-icon purple"><Activity size={20} /></span><div><small>مقایسه استاندارد</small><h3>نمودار رشد WHO</h3></div></div>
      </div>
      <div className="who-growth-empty"><Info size={21} /><p>برای نمایش منحنی‌های استاندارد رشد، بک‌اند Growth Intelligence باید فعال باشد.</p></div>
    </section>;
  }

  return <section className="surface-card who-growth-card">
    <div className="who-growth-heading">
      <div><span className="card-icon purple"><Activity size={20} /></span><div><small>{chart.standard?.name ?? "WHO"} · مقایسه با مرجع جهانی</small><h3>نمودار رشد {childName}</h3></div></div>
      <span className="who-growth-standard">WHO</span>
    </div>

    <div className="who-growth-tabs" role="tablist" aria-label="نوع نمودار رشد">
      {KEYS.map((key) => {
        const item = chart.indicators?.[key];
        const ItemIcon = META[key].icon;
        return <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          className={active === key ? "is-active" : ""}
          onClick={() => setActive(key)}
        ><ItemIcon size={15} />{META[key].shortLabel}{item && !item.supported ? <small>—</small> : null}</button>;
      })}
    </div>

    {!indicator?.supported ? <UnsupportedIndicator reason={indicator?.reason} /> : <>
      {indicator.latest ? <LatestSummary indicator={indicator} meta={meta} /> : null}
      {indicator.reference.length ? <GrowthSvg indicator={indicator} meta={meta} /> : <div className="who-growth-empty"><Info size={21} /><p>برای این بازه سنی منحنی مرجع قابل نمایش نیست.</p></div>}
    </>}

    <div className="who-growth-note">
      <Info size={15} />
      <p>خط پررنگ، روند ثبت‌شده {childName} است و خطوط زمینه محدوده‌های مرجع WHO را نشان می‌دهند. این مقایسه برای پایش روند است و جای ارزیابی پزشک را نمی‌گیرد.{active === "height_for_age" ? " در استاندارد WHO تا دو سالگی طول بدن و پس از آن قد ایستاده مبناست." : ""}</p>
    </div>
  </section>;
}

function LatestSummary({ indicator, meta }: { indicator: GrowthIndicator; meta: IndicatorMeta }) {
  const latest = indicator.latest!;
  return <div className="who-growth-summary">
    <div><small>{meta.label}</small><strong>{formatNumber(latest.value, 2)} <em>{meta.unit}</em></strong></div>
    <div><small>صدک تقریبی</small><strong>{formatNumber(latest.percentile, 1)}</strong></div>
    <div><small>Z-score</small><strong dir="ltr">{signed(latest.z_score)}</strong></div>
    <div><small>موقعیت نسبت به مرجع</small><strong className="who-growth-band">{bandLabel(latest.band)}</strong></div>
  </div>;
}

function UnsupportedIndicator({ reason }: { reason?: string }) {
  const text = reason === "child_gender_required"
    ? "برای محاسبه استانداردهای رشد WHO لازم است جنسیت کودک در پروفایل ثبت شود."
    : "این شاخص در سن فعلی کودک مرجع استاندارد قابل محاسبه ندارد.";
  return <div className="who-growth-empty"><Info size={21} /><p>{text}</p></div>;
}

function GrowthSvg({ indicator, meta }: { indicator: GrowthIndicator; meta: IndicatorMeta }) {
  const model = useMemo(() => buildModel(indicator), [indicator]);
  if (!model) return null;

  const { xMin, xMax, yMin, yMax, ticksX, ticksY } = model;
  const x = (value: number) => PAD.left + ((value - xMin) / Math.max(1, xMax - xMin)) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => HEIGHT - PAD.bottom - ((value - yMin) / Math.max(0.0001, yMax - yMin)) * (HEIGHT - PAD.top - PAD.bottom);

  const refPath = (field: keyof GrowthReferencePoint) => pathFor(indicator.reference, (point) => point.age_months, (point) => Number(point[field]), x, y);
  const childPath = pathFor(indicator.points, (point) => point.age_months, (point) => point.value, x, y);

  return <div className="who-growth-chart-wrap">
    <svg className="who-growth-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${meta.label} در مقایسه با منحنی‌های مرجع WHO`}>
      <g className="who-growth-grid">
        {ticksY.map((value) => <g key={`y-${value}`}>
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(value)} y2={y(value)} />
          <text x={PAD.left - 10} y={y(value) + 4} textAnchor="end">{formatNumber(value, 1)}</text>
        </g>)}
        {ticksX.map((value) => <g key={`x-${value}`}>
          <line x1={x(value)} x2={x(value)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
          <text x={x(value)} y={HEIGHT - 22} textAnchor="middle">{ageLabel(value)}</text>
        </g>)}
      </g>

      <path className="who-reference-line is-outer" d={refPath("minus_3_sd")} />
      <path className="who-reference-line" d={refPath("minus_2_sd")} />
      <path className="who-reference-line is-median" d={refPath("median")} />
      <path className="who-reference-line" d={refPath("plus_2_sd")} />
      <path className="who-reference-line is-outer" d={refPath("plus_3_sd")} />

      {childPath ? <path className="who-child-line" d={childPath} /> : null}
      {indicator.points.map((point) => <circle key={`${point.measurement_id}-${point.measured_at}-${point.value}`} className="who-child-point" cx={x(point.age_months)} cy={y(point.value)} r="4.5">
        <title>{`${formatDate(point.measured_at)} · ${formatNumber(point.value, 2)} ${meta.unit} · صدک ${formatNumber(point.percentile, 1)} · Z ${signed(point.z_score)}`}</title>
      </circle>)}

      <text className="who-y-unit" x="15" y="18">{meta.unit}</text>
    </svg>

    <div className="who-growth-legend" aria-label="راهنمای نمودار">
      <span className="child"><i />روند کودک</span>
      <span className="median"><i />میانه WHO</span>
      <span><i />±۲ SD</span>
      <span className="outer"><i />±۳ SD</span>
    </div>
  </div>;
}

function buildModel(indicator: GrowthIndicator) {
  if (!indicator.reference.length) return null;
  const ages = [...indicator.reference.map((p) => p.age_months), ...indicator.points.map((p) => p.age_months)];
  const values = indicator.reference.flatMap((p) => [p.minus_3_sd, p.plus_3_sd]).concat(indicator.points.map((p) => p.value));
  const xMin = Math.min(...ages);
  const xMax = Math.max(...ages);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const yPad = Math.max((rawMax - rawMin) * 0.08, 0.5);
  const yMin = Math.max(0, rawMin - yPad);
  const yMax = rawMax + yPad;
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    ticksX: evenlySpaced(xMin, xMax, 5),
    ticksY: evenlySpaced(yMin, yMax, 5),
  };
}

function pathFor<T>(points: T[], xValue: (point: T) => number, yValue: (point: T) => number, x: (value: number) => number, y: (value: number) => number): string {
  return points.map((point, index) => `${index ? "L" : "M"}${x(xValue(point)).toFixed(2)},${y(yValue(point)).toFixed(2)}`).join(" ");
}

function evenlySpaced(min: number, max: number, count: number): number[] {
  if (max <= min) return [min];
  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

function ageLabel(months: number): string {
  if (months < 24) return `${formatNumber(Math.round(months), 0)} ماه`;
  const years = months / 12;
  return `${formatNumber(years, years >= 5 ? 0 : 1)} سال`;
}

function signed(value: number): string {
  if (value > 0) return `+${formatNumber(value, 2)}`;
  return formatNumber(value, 2);
}

function bandLabel(value: string): string {
  const labels: Record<string, string> = {
    below_minus_3_sd: "پایین‌تر از ‎−۳ SD",
    between_minus_3_and_minus_2_sd: "بین ‎−۳ و ‎−۲ SD",
    within_minus_2_and_plus_2_sd: "داخل بازه ‎±۲ SD",
    between_plus_2_and_plus_3_sd: "بین ‎+۲ و ‎+۳ SD",
    above_plus_3_sd: "بالاتر از ‎+۳ SD",
  };
  return labels[value] ?? value;
}
