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

interface WelcomeEmailProps {
  email: string;
  password?: string;
  role: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  email,
  password,
  role,
  loginUrl = "https://event-order.vercel.app", // Default URL, should be env var in prod
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Bienvenue sur Event Order - Vos identifiants de connexion
      </Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 w-116.25">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-7.5 mx-0">
              Bienvenue sur <strong>Event Order</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-6">Bonjour,</Text>
            <Text className="text-black text-[14px] leading-6">
              Votre compte (<strong>{role}</strong>) a été créé avec succès.
            </Text>
            <Section className="bg-gray-100 rounded p-4 my-4">
              <Text className="text-black text-[14px] leading-6 m-0">
                <strong>Email :</strong> {email}
              </Text>
              {password && (
                <Text className="text-black text-[14px] leading-6 m-0 mt-2">
                  <strong>Mot de passe temporaire :</strong> {password}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-6">
              Pour des raisons de sécurité, il vous sera demandé de changer
              votre mot de passe dès votre première connexion.
            </Text>
            <Section className="text-center my-8">
              <a
                href={loginUrl}
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Se connecter
              </a>
            </Section>
            <Text className="text-[#666666] text-[12px] leading-6">
              Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous
              pouvez ignorer cet email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
