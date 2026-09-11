import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ContactFormState } from "@/lib/contact-validation";

const sendMock = vi.fn();
const headersMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

const IDLE: ContactFormState = { status: "idle" };

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

const VALID_FIELDS = {
  email: "ana@mail.com",
  message: "Quiero cotizar una cocina a medida.",
};

async function loadAction(ip = "203.0.113.1") {
  headersMock.mockResolvedValue(new Headers({ "x-forwarded-for": ip }));
  // El limitador de intentos vive en memoria del módulo: cada test parte de cero.
  vi.resetModules();
  const { sendContactEmail } = await import("@/app/actions/contact");
  return sendContactEmail;
}

describe("sendContactEmail", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "destino@mail.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Web <web@mail.com>");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    sendMock.mockReset();
    headersMock.mockReset();
  });

  it("sends the email with the visitor's address as reply-to and returns success", async () => {
    const sendContactEmail = await loadAction();

    const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      from: "Web <web@mail.com>",
      to: "destino@mail.com",
      replyTo: "ana@mail.com",
      subject: "Nueva consulta desde la web",
      text: "Mail: ana@mail.com\n\nQuiero cotizar una cocina a medida.",
    });
    expect(state.status).toBe("success");
    expect(state.message).toBeTruthy();
    expect(state.values).toBeUndefined();
  });

  it("silently drops submissions with the honeypot filled", async () => {
    const sendContactEmail = await loadAction();

    const state = await sendContactEmail(
      IDLE,
      buildFormData({ ...VALID_FIELDS, website: "http://spam.example" }),
    );

    expect(sendMock).not.toHaveBeenCalled();
    expect(state.status).toBe("success");
  });

  it("returns a validation error with the submitted values and does not send", async () => {
    const sendContactEmail = await loadAction();

    const state = await sendContactEmail(
      IDLE,
      buildFormData({ email: "ana@mail", message: "Hola" }),
    );

    expect(sendMock).not.toHaveBeenCalled();
    expect(state).toEqual({
      status: "error",
      message: "Ingresá un mail válido.",
      values: { email: "ana@mail", message: "Hola" },
    });
  });

  it("returns an error state when Resend fails", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "boom" },
    });
    const sendContactEmail = await loadAction();

    const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/No pudimos enviar/);
    expect(state.values).toEqual(VALID_FIELDS);
    expect(console.error).toHaveBeenCalled();
  });

  it("returns an error state when the API key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const sendContactEmail = await loadAction();

    const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));

    expect(sendMock).not.toHaveBeenCalled();
    expect(state.status).toBe("error");
    expect(state.values).toEqual(VALID_FIELDS);
  });

  it("rate-limits the fourth submission from the same IP", async () => {
    const sendContactEmail = await loadAction();

    for (let attempt = 0; attempt < 3; attempt++) {
      const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));
      expect(state.status).toBe("success");
    }

    const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));

    expect(sendMock).toHaveBeenCalledTimes(3);
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/Demasiados intentos/);
    expect(state.values).toEqual(VALID_FIELDS);
  });

  it("does not rate-limit a different IP", async () => {
    const sendContactEmail = await loadAction();

    for (let attempt = 0; attempt < 3; attempt++) {
      await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));
    }
    headersMock.mockResolvedValue(
      new Headers({ "x-forwarded-for": "198.51.100.7, 10.0.0.1" }),
    );

    const state = await sendContactEmail(IDLE, buildFormData(VALID_FIELDS));

    expect(state.status).toBe("success");
    expect(sendMock).toHaveBeenCalledTimes(4);
  });
});
