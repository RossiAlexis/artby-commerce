import { Body, Container, Head, Heading, Html, Text } from "react-email";

type TestEmailProps = {
  checkedAt: Date;
};

export function TestEmail({ checkedAt }: TestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>Art by Vero Miller — email wiring check</Heading>
          <Text>
            This is a test email confirming the transactional email pipeline is
            wired up correctly. Sent at {checkedAt.toISOString()}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
