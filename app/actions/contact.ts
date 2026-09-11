"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import {
  HONEYPOT_FIELD,
  readContactFormValues,
  validateContactForm,
  type ContactFormState,
} from "@/lib/contact-validation";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const DEFAULT_TO_EMAIL = "mantemuebles@gmail.com";
const DEFAULT_FROM_EMAIL = "Manté Web <onboarding@resend.dev>";
const SUBJECT = "Nueva consulta desde la web";

const SUCCESS_MESSAGE =
  "¡Gracias! Recibimos tu consulta y te respondemos a la brevedad.";
const SEND_ERROR_MESSAGE =
  "No pudimos enviar tu consulta. Intentá de nuevo o escribinos por WhatsApp.";
const RATE_LIMIT_MESSAGE = "Demasiados intentos. Probá de nuevo en unos minutos.";

// Best-effort: vive en memoria de la instancia, no es un límite global.
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const recent = (submissionsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    submissionsByIp.set(ip, recent);
    return true;
  }

  submissionsByIp.set(ip, [...recent, now]);
  return false;
}

async function getClientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const values = readContactFormValues(formData);

  if (isRateLimited(await getClientIp(), Date.now())) {
    return { status: "error", message: RATE_LIMIT_MESSAGE, values };
  }

  const validation = validateContactForm(formData);

  if (!validation.ok) {
    return { status: "error", message: validation.error, values };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; contact email not sent.");
    return { status: "error", message: SEND_ERROR_MESSAGE, values };
  }

  const { email, message } = validation.data;
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL ?? DEFAULT_TO_EMAIL,
    replyTo: email,
    subject: SUBJECT,
    text: `Mail: ${email}\n\n${message}`,
  });

  if (error) {
    console.error("Resend failed to send contact email:", error);
    return { status: "error", message: SEND_ERROR_MESSAGE, values };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
