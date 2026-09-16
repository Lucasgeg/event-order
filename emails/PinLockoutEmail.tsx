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

interface PinLockoutEmailProps {
  organisationName: string;
  lockedUntil: Date;
  ipAddress: string;
}

export const PinLockoutEmail = ({
  organisationName,
  lockedUntil,
  ipAddress,
}: PinLockoutEmailProps) => {
  const formattedDate = lockedUntil.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <Html>
      <Head />
      <Preview>Accès admin verrouillé après plusieurs codes PIN erronés</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 w-116.25">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-7.5 mx-0">
              Accès admin verrouillé
            </Heading>
            <Text className="text-black text-[14px] leading-6">Bonjour,</Text>
            <Text className="text-black text-[14px] leading-6">
              Plusieurs codes PIN erronés ont été saisis pour l&apos;espace
              admin de <strong>{organisationName}</strong>. L&apos;accès est
              verrouillé jusqu&apos;au <strong>{formattedDate}</strong>.
            </Text>
            <Section className="bg-gray-100 rounded p-4 my-4">
              <Text className="text-black text-[14px] leading-6 m-0">
                <strong>Adresse IP de la tentative :</strong> {ipAddress}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-6">
              Si c&apos;est vous (ou un membre de votre équipe) qui vous êtes
              trompé de code, vous pouvez ignorer cet email et réessayer une
              fois le verrouillage terminé.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-6">
              Si ces tentatives ne vous semblent pas familières, pensez à
              changer votre code PIN dès que possible.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PinLockoutEmail;
