import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "./TransactionForm";

describe("TransactionForm", () => {
  it("no envía el formulario cuando los campos están vacíos y onCreate no es llamado", async () => {
    const onCreateMock = jest.fn();
    render(<TransactionForm onCreate={onCreateMock} />);

    const submitButton = screen.getByRole("button", {
      name: /crear transacción/i,
    });
    await userEvent.click(submitButton);

    expect(onCreateMock).not.toHaveBeenCalled();
  });

  it("muestra mensajes de error cuando se envía el formulario con campos vacíos", async () => {
    const onCreateMock = jest.fn();
    render(<TransactionForm onCreate={onCreateMock} />);

    const submitButton = screen.getByRole("button", {
      name: /crear transacción/i,
    });
    await userEvent.click(submitButton);

    expect(screen.getByText(/Ingresa un monto válido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ingresa el comercio o giro/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ingresa el nombre del Tenpista/i)
    ).toBeInTheDocument();
  });
});
