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

type OrderNotificationEmailProps = {
  order: {
    id: number;
    customerName: string;
    customerEmail: string;
    totalCents: number;
    currency: string;
    items: { title: string; priceCents: number }[];
  };
};

export function OrderNotificationEmail({ order }: OrderNotificationEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>Nueva Orden #{order.id}</Heading>
          <Text>
            {order.customerName} ({order.customerEmail}) completó una compra.
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
        </Container>
      </Body>
    </Html>
  );
}
