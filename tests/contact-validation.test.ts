import { describe, expect, it } from "vitest";
import {
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  readContactFormValues,
  validateContactForm,
} from "@/lib/contact-validation";

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("validateContactForm", () => {
  it("accepts a valid email and message, trimming whitespace", () => {
    const result = validateContactForm(
      buildFormData({
        email: "  ana@mail.com ",
        message: "  Quiero cotizar una cocina.\r\n ",
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: { email: "ana@mail.com", message: "Quiero cotizar una cocina." },
    });
  });

  it("rejects an empty email", () => {
    const result = validateContactForm(
      buildFormData({ email: "", message: "Quiero cotizar una cocina." }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Ingresá un mail válido.");
  });

  it("rejects a malformed email", () => {
    const result = validateContactForm(
      buildFormData({ email: "ana@mail", message: "Quiero cotizar una cocina." }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Ingresá un mail válido.");
  });

  it("rejects an email longer than the maximum length", () => {
    const email = `${"a".repeat(EMAIL_MAX_LENGTH)}@mail.com`;
    const result = validateContactForm(
      buildFormData({ email, message: "Quiero cotizar una cocina." }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Ingresá un mail válido.");
  });

  it("rejects a message shorter than the minimum length", () => {
    const result = validateContactForm(
      buildFormData({ email: "ana@mail.com", message: "Hola" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        `Contanos un poco más (mínimo ${MESSAGE_MIN_LENGTH} caracteres).`,
      );
    }
  });

  it("rejects a message longer than the maximum length", () => {
    const result = validateContactForm(
      buildFormData({
        email: "ana@mail.com",
        message: "a".repeat(MESSAGE_MAX_LENGTH + 1),
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        `La consulta es demasiado larga (máximo ${MESSAGE_MAX_LENGTH} caracteres).`,
      );
    }
  });

  it("echoes the submitted values when validation fails", () => {
    const result = validateContactForm(
      buildFormData({ email: "ana@mail", message: "Hola" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.values).toEqual({ email: "ana@mail", message: "Hola" });
    }
  });
});

describe("readContactFormValues", () => {
  it("returns empty strings for missing fields", () => {
    expect(readContactFormValues(new FormData())).toEqual({
      email: "",
      message: "",
    });
  });
});
