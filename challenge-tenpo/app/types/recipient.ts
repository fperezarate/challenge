export type Recipient = {
  id: number;
  nombre: string;
  rut: string;
  numeroCuenta: string;
  tipoCuenta: string;
  email: string;
};

/** Input para crear destinatario (tipoCuenta se fija en backend como "Tenpo") */
export type RecipientInput = {
  nombre: string;
  rut: string;
  numeroCuenta: string;
  email: string;
};
