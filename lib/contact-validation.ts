export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;
export const HONEYPOT_FIELD = "website";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormValues = {
  email: string;
  message: string;
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  values?: ContactFormValues;
};

export type ContactValidationResult =
  | { ok: true; data: ContactFormValues }
  | { ok: false; error: string; values: ContactFormValues };

export function readContactFormValues(formData: FormData): ContactFormValues {
  return {
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? "")
      .replace(/\r/g, "")
      .trim(),
  };
}

export function validateContactForm(
  formData: FormData,
): ContactValidationResult {
  const values = readContactFormValues(formData);
  const { email, message } = values;

  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Ingresá un mail válido.", values };
  }

  if (message.length < MESSAGE_MIN_LENGTH) {
    return {
      ok: false,
      error: `Contanos un poco más (mínimo ${MESSAGE_MIN_LENGTH} caracteres).`,
      values,
    };
  }

  if (message.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `La consulta es demasiado larga (máximo ${MESSAGE_MAX_LENGTH} caracteres).`,
      values,
    };
  }

  return { ok: true, data: values };
}
