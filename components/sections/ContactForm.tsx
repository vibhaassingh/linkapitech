"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Tell us a little more"),
  // Honeypot: real users never see or fill this; the server drops any submission
  // that has it set. Kept out of the schema's validation so it never blocks users.
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Contact form (HOMEPAGE-SECTIONS §7). Client-validated, posts to /api/contact,
 * shows an inline success/error state ONLY after a real submit — the source's
 * auto-firing "Thank You" modal is not replicated (PLAN §6).
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
      className="relative rounded-card border border-line bg-bg p-7 md:p-9"
      noValidate
    >
      <div className="grid gap-x-6 sm:grid-cols-2">
        <TextField label="Your name" {...register("name")} error={errors.name?.message} autoComplete="name" />
        <TextField
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          autoComplete="email"
        />
        <TextField label="Company" {...register("company")} autoComplete="organization" />
        <TextField label="Project budget" {...register("budget")} placeholder="Optional" />
      </div>
      <TextArea
        label="Tell us about it"
        {...register("message")}
        error={errors.message?.message}
        placeholder="What systems are you integrating?"
      />

      {/* Honeypot anti-spam field (DESIGN-SYSTEM §5.9). */}
      <div className="pointer-events-none absolute left-[-9999px] top-0 opacity-0" aria-hidden="true">
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "ok" && (
            <span className="text-accent-deep">Sent — we&apos;ll be in touch ✓</span>
          )}
          {status === "err" && (
            <span className="text-[#c0392b]">
              Something went wrong — email partnership@linkapitech.com.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
