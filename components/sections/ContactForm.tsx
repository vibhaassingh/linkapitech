"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/site";

/** Mirrors the server schema in app/api/contact/route.ts. */
const schema = z.object({
  firstName: z.string().min(2, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  email: z.string().email("Enter a valid work email"),
  phone: z
    .string()
    .min(7, "Enter a reachable number")
    .optional()
    .or(z.literal("")),
  company: z.string().min(2, "Please enter your company"),
  message: z.string().min(10, "Tell us a little more"),
  // Honeypot: real users never see or fill this; the server drops any submission
  // that has it set. Kept out of validation so it never blocks a real user.
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Success tick. Drawn rather than popped in: the path is one dash the length of
 * the stroke, and the offset runs to 0. It mounts only on success, so the
 * animation plays on mount with no trigger of its own.
 *
 * Reduced motion: the global block collapses `animation-duration` to 0.001ms and
 * `both` holds the `to` frame, so the check is simply already drawn — the
 * confirmation is never withheld from anyone.
 */
const CHECK_ID = "s7-contact-check";
const CHECK_CSS = `
.s7-check{stroke-dasharray:13}
@keyframes s7Check{from{stroke-dashoffset:13}to{stroke-dashoffset:0}}
.s7-check{animation:s7Check .52s var(--ease-out-expo) both}
`;

function SentTick() {
  return (
    <>
      <style href={CHECK_ID} precedence="default">
        {CHECK_CSS}
      </style>
      <svg
        viewBox="0 0 20 20"
        width="16"
        height="16"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.35"
        />
        <path
          className="s7-check"
          d="m5.8 10.4 2.7 2.8 5.7-6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

/**
 * "Book a Demo" form (Figma page 16). Client-validated, posts to /api/contact,
 * and shows an inline result only after a real submit.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  /**
   * Monotonic counter, incremented on every REJECTED submit. Each field replays
   * `.shake` when this changes and it is itself in error, so a second attempt
   * with the same mistake still nudges — a boolean flag could not express that.
   */
  const [shake, setShake] = useState(0);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("bad response");
      setStatus("ok");
      reset();
    } catch {
      setStatus("err");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => setShake((n) => n + 1))}
      className="relative rounded-lg border border-line-soft bg-surface p-7 shadow-card md:p-9"
      noValidate
    >
      <h2 className="heading-3 text-ink">Book a Demo</h2>
      <p className="mb-8 mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">
        Tell us what you&rsquo;re looking to solve and our team will come back
        with a tailored implementation plan.
      </p>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <TextField
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          {...register("firstName")}
          error={errors.firstName?.message}
          shake={shake}
        />
        <TextField
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          {...register("lastName")}
          error={errors.lastName?.message}
          shake={shake}
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
        shake={shake}
      />
      <TextField
        label="Mobile number"
        type="tel"
        placeholder="+91 XXXXX XXXXX"
        autoComplete="tel"
        {...register("phone")}
        error={errors.phone?.message}
        shake={shake}
      />
      <TextField
        label="Company / organisation"
        placeholder="Acme Tech Pvt Ltd"
        autoComplete="organization"
        {...register("company")}
        error={errors.company?.message}
        shake={shake}
      />
      <TextArea
        label="What are you looking to solve?"
        placeholder="Briefly describe your use case…"
        {...register("message")}
        error={errors.message?.message}
        shake={shake}
      />

      {/* Honeypot anti-spam field. */}
      <div
        className="pointer-events-none absolute left-[-9999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting} showArrow={false}>
          {isSubmitting ? "Sending…" : "Book My Demo"}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "ok" && (
            /* --success-text, not --success: the fill colour measures 3.0:1 on
               this white card and only the darkened variant clears AA at 4.5:1
               for text this size. */
            <span className="inline-flex items-center gap-2 font-medium text-[color:var(--success-text)]">
              <SentTick />
              Sent — we&rsquo;ll be in touch.
            </span>
          )}
          {status === "err" && (
            <span className="text-[color:var(--error)]">
              Something went wrong — please email {CONTACT.primaryEmail}.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
