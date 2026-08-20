import { z } from "zod";

export const iranMobileSchema = z.string().trim().regex(/^(?:\+98|0098|98|0)?9\d{9}$/, "شماره موبایل معتبر نیست");
export const otpSchema = z.string().trim().regex(/^\d{6}$/, "کد تایید باید ۶ رقم باشد");
export const passwordSchema = z.string()
  .refine((value) => value.trim().length > 0, "رمز عبور نمی‌تواند فقط شامل فاصله باشد")
  .refine((value) => Array.from(value).length >= 8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "رمز عبور برای ذخیره امن بیش از حد طولانی است");

export const growthMeasurementSchema = z.object({
  measured_at: z.string().min(1, "تاریخ اندازه‌گیری الزامی است"),
  weight_kg: z.coerce.number().positive().max(300).optional().or(z.literal("")),
  height_cm: z.coerce.number().positive().max(250).optional().or(z.literal("")),
  head_circumference_cm: z.coerce.number().positive().max(100).optional().or(z.literal(""))
}).superRefine((value, ctx) => {
  if (value.weight_kg === "" && value.height_cm === "" && value.head_circumference_cm === "") {
    ctx.addIssue({ code: "custom", message: "حداقل یک مقدار رشد وارد کنید", path: ["weight_kg"] });
  }
});

export const vaccinationQuickSchema = z.object({
  vaccine_name: z.string().trim().min(2, "نام واکسن الزامی است").max(150),
  dose_number: z.coerce.number().int().min(1).max(20),
  administered_at: z.string().min(1, "تاریخ تزریق الزامی است"),
  next_dose_due_at: z.string().optional()
});

export const medicalVisitQuickSchema = z.object({
  visited_at: z.string().min(1, "تاریخ ویزیت الزامی است"),
  visit_type: z.enum(["routine_checkup", "illness", "emergency", "follow_up", "vaccination", "consultation", "hospitalization", "other"]),
  doctor_name: z.string().trim().max(150).optional(),
  chief_complaint: z.string().trim().max(2000).optional()
});

export function normalizeIranMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0098")) return `+98${digits.slice(4)}`;
  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return `+98${digits}`;
}
