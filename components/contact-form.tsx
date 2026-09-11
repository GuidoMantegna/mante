"use client";
import { useActionState } from "react";
import { sendContactEmail } from "@/app/actions/contact";
import {
  EMAIL_MAX_LENGTH,
  HONEYPOT_FIELD,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  type ContactFormState,
} from "@/lib/contact-validation";

const INITIAL_STATE: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="relative flex flex-col gap-6 w-full w-sm">
      <fieldset disabled={pending}>
        <label htmlFor="mail">Mail</label>
        <input
          type="email"
          name="email"
          placeholder="tumail@mail.com"
          id="mail"
          required
          maxLength={EMAIL_MAX_LENGTH}
          autoComplete="email"
          defaultValue={state.values?.email ?? ""}
        />
      </fieldset>
      <fieldset disabled={pending}>
        <label htmlFor="message">Consulta</label>
        <textarea
          name="message"
          placeholder="Contanos el motivo de tu consulta"
          id="message"
          rows={4}
          required
          minLength={MESSAGE_MIN_LENGTH}
          maxLength={MESSAGE_MAX_LENGTH}
          defaultValue={state.values?.message ?? ""}
        />
      </fieldset>
      {/* Honeypot: fuera de pantalla (no display:none, muchos bots lo detectan). */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <button
        type="submit"
        disabled={pending}
        className="border border-accent border-b-3 p-1 rounded-xs font-semibold disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? "Enviando…" : "Enviar"}
      </button>
      {state.status === "success" && (
        <p role="status" aria-live="polite" className="text-accent">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
