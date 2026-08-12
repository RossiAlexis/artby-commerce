import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Row,
  Column,
  Text,
} from "react-email";
import { formatPrice } from "@/lib/utils";

type OrderConfirmationEmailProps = {
  order: {
    id: number;
    customerName: string;
    totalCents: number;
    currency: string;
    items: { title: string; priceCents: number }[];
  };
};

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>¡Gracias por tu compra, {order.customerName}!</Heading>
          <Text>
            Confirmamos tu Orden #{order.id}. Aquí está el resumen de las obras
            que compraste:
          </Text>
          {order.items.map((item, index) => (
            <Row key={index}>
              <Column>
                <Text>{item.title}</Text>
              </Column>
              <Column align="right">
                <Text>{formatPrice(item.priceCents, order.currency)}</Text>
              </Column>
            </Row>
          ))}
          <Hr />
          <Row>
            <Column>
              <Text style={{ fontWeight: "bold" }}>Total</Text>
            </Column>
            <Column align="right">
              <Text style={{ fontWeight: "bold" }}>
                {formatPrice(order.totalCents, order.currency)}
              </Text>
            </Column>
          </Row>
          <Text>
            Nos pondremos en contacto contigo a este correo con los próximos
            pasos.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
