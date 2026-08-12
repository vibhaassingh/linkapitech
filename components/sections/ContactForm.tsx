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
  phone: z.string().min(7, "Enter a reachable number").optional().or(z.literal("")),
  company: z.string().min(2, "Please enter your company"),
  message: z.string().min(10, "Tell us a little more"),
  // Honeypot: real users never see or fill this; the server drops any submission
  // that has it set. Kept out of validation so it never blocks a real user.
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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
      onSubmit={handleSubmit(onSubmit)}
      className="relative rounded-xl border border-line-soft bg-surface p-7 shadow-card md:p-9"
      noValidate
    >
      <h2 className="heading-3 text-ink">Book a Demo</h2>
      <p className="mb-7 mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">
        Tell us what you&rsquo;re looking to solve and our team will come back with a tailored
        implementation plan.
      </p>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <TextField
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          {...register("firstName")}
          error={errors.firstName?.message}
        />
        <TextField
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          {...register("lastName")}
          error={errors.lastName?.message}
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <TextField
        label="Mobile number"
        type="tel"
        placeholder="+91 XXXXX XXXXX"
        autoComplete="tel"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <TextField
        label="Company / organisation"
        placeholder="Acme Tech Pvt Ltd"
        autoComplete="organization"
        {...register("company")}
        error={errors.company?.message}
      />
      <TextArea
        label="What are you looking to solve?"
        placeholder="Briefly describe your use case…"
        {...register("message")}
        error={errors.message?.message}
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

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting} showArrow={false}>
          {isSubmitting ? "Sending…" : "Book My Demo"}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "ok" && (
            <span className="font-medium text-[color:var(--success)]">
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
