import { Body, Container, Head, Heading, Hr, Html, Text } from "react-email";

type ContactMessageEmailProps = {
  name: string;
  email: string;
  message: string;
};

export function ContactMessageEmail({
  name,
  email,
  message,
}: ContactMessageEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>Nuevo mensaje de contacto</Heading>
          <Text>
            {name} ({email}) escribió:
          </Text>
          <Hr />
          <Text>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
