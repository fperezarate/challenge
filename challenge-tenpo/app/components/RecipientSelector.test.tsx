import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipientSelector } from "./RecipientSelector";
import type { Recipient } from "@/app/types/recipient";

describe("RecipientSelector", () => {
  const baseRecipient: Recipient = {
    id: 1,
    nombre: "Juan Pérez",
    rut: "11.111.111-1",
    numeroCuenta: "123456789",
    email: "juan@example.com",
    tipoCuenta: "Tenpo",
  };

  it("muestra mensaje cuando no hay destinatarios y permite abrir el diálogo de creación", async () => {
    const onSelect = jest.fn();
    const onCreateRecipient = jest.fn().mockResolvedValue(baseRecipient);

    render(
      <RecipientSelector
        recipients={[]}
        selectedRecipient={null}
        onSelect={onSelect}
        onCreateRecipient={onCreateRecipient}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText(/No tienes destinatarios\. Crea uno para realizar una transacción\./i),
    ).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: /crear destinatario/i });
    await userEvent.click(createButton);

    // Al menos verificamos que se abre el diálogo con el título del formulario
    await waitFor(() => {
      expect(screen.getByText(/Nuevo destinatario/i)).toBeInTheDocument();
    });
  });

  it("renderiza el select cuando hay destinatarios y llama a onSelect al cambiar", async () => {
    const onSelect = jest.fn();
    const onCreateRecipient = jest.fn();

    const recipients: Recipient[] = [
      baseRecipient,
      {
        ...baseRecipient,
        id: 2,
        nombre: "María López",
        numeroCuenta: "987654321",
        email: "maria@example.com",
      },
    ];

    render(
      <RecipientSelector
        recipients={recipients}
        selectedRecipient={null}
        onSelect={onSelect}
        onCreateRecipient={onCreateRecipient}
        isLoading={false}
      />,
    );

    const select = screen.getByLabelText(/seleccionar destinatario/i);
    await userEvent.selectOptions(select, "2");

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        nombre: "María López",
        numeroCuenta: "987654321",
      }),
    );
  });
}

