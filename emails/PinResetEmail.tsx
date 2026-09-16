import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface PinResetEmailProps {
  organisationName: string;
  resetUrl: string;
}

export const PinResetEmail = ({
  organisationName,
  resetUrl,
}: PinResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation du code PIN admin</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 w-116.25">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-7.5 mx-0">
              Réinitialiser votre code PIN
            </Heading>
            <Text className="text-black text-[14px] leading-6">Bonjour,</Text>
            <Text className="text-black text-[14px] leading-6">
              Une demande de réinitialisation du code PIN admin de{" "}
              <strong>{organisationName}</strong> a été effectuée. Ce lien est
              valable 15 minutes.
            </Text>
            <Section className="text-center my-8">
              <a
                href={resetUrl}
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Définir un nouveau code PIN
              </a>
            </Section>
            <Text className="text-[#666666] text-[12px] leading-6">
              Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous
              pouvez ignorer cet email : votre code PIN actuel reste actif.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PinResetEmail;
