import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContactFormState } from "@/lib/contact-validation";

const sendContactEmailMock = vi.fn();

vi.mock("@/app/actions/contact", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmailMock(...args),
}));

import { ContactForm } from "@/components/contact-form";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function fillAndSubmit(email: string, message: string) {
  fireEvent.change(screen.getByLabelText("Mail"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Consulta"), {
    target: { value: message },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Enviar" }).closest("form")!);
}

describe("ContactForm", () => {
  afterEach(() => {
    sendContactEmailMock.mockReset();
  });

  it("renders named email and message fields plus an off-screen honeypot", () => {
    const { container } = render(<ContactForm />);

    expect(screen.getByLabelText("Mail")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Mail")).toBeRequired();
    expect(screen.getByLabelText("Consulta")).toHaveAttribute("name", "message");
    expect(screen.getByLabelText("Consulta")).toBeRequired();

    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).not.toHaveAttribute("required");
  });

  it("shows a loading state and disables the form while the action is pending", async () => {
    const { promise, resolve } = deferred<ContactFormState>();
    sendContactEmailMock.mockReturnValue(promise);
    render(<ContactForm />);

    await act(async () => {
      fillAndSubmit("ana@mail.com", "Quiero cotizar una cocina a medida.");
    });

    const button = screen.getByRole("button", { name: "Enviando…" });
    expect(button).toBeDisabled();
    expect(screen.getByLabelText("Mail")).toBeDisabled();
    expect(screen.getByLabelText("Consulta")).toBeDisabled();

    await act(async () => {
      resolve({ status: "success", message: "¡Gracias!" });
    });

    expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled();
  });

  it("passes the submitted values to the action", async () => {
    sendContactEmailMock.mockResolvedValue({ status: "success", message: "ok" });
    render(<ContactForm />);

    await act(async () => {
      fillAndSubmit("ana@mail.com", "Quiero cotizar una cocina a medida.");
    });

    expect(sendContactEmailMock).toHaveBeenCalledTimes(1);
    const formData = sendContactEmailMock.mock.calls[0][1] as FormData;
    expect(formData.get("email")).toBe("ana@mail.com");
    expect(formData.get("message")).toBe("Quiero cotizar una cocina a medida.");
    expect(formData.get("website")).toBe("");
  });

  it("shows the success message and clears the fields after sending", async () => {
    sendContactEmailMock.mockResolvedValue({
      status: "success",
      message: "¡Gracias! Recibimos tu consulta.",
    });
    render(<ContactForm />);

    await act(async () => {
      fillAndSubmit("ana@mail.com", "Quiero cotizar una cocina a medida.");
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "¡Gracias! Recibimos tu consulta.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Mail")).toHaveValue("");
    expect(screen.getByLabelText("Consulta")).toHaveValue("");
  });

  it("shows the error message and keeps the submitted values", async () => {
    sendContactEmailMock.mockResolvedValue({
      status: "error",
      message: "No pudimos enviar tu consulta.",
      values: {
        email: "ana@mail.com",
        message: "Quiero cotizar una cocina a medida.",
      },
    });
    render(<ContactForm />);

    await act(async () => {
      fillAndSubmit("ana@mail.com", "Quiero cotizar una cocina a medida.");
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos enviar tu consulta.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Mail")).toHaveValue("ana@mail.com");
    expect(screen.getByLabelText("Consulta")).toHaveValue(
      "Quiero cotizar una cocina a medida.",
    );
  });
});
