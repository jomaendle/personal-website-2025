import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface NewsletterWelcomeProps {
  email: string;
}

export default function NewsletterWelcome({ email }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Jo's newsletter - Thanks for subscribing!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>Jo Mändle</Text>
          </Section>

          <Hr style={hr} />

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>Welcome aboard!</Text>

            <Text style={paragraph}>
              Thanks for subscribing to my newsletter. I'm excited to have you
              here!
            </Text>

            <Text style={paragraph}>
              I'm Jo, a software engineer passionate about web development,
              modern JavaScript, and building great user experiences. Through
              this newsletter, I share my thoughts on web technologies,
              development best practices, and occasional insights from my
              journey in tech.
            </Text>

            <Text style={paragraph}>
              You'll receive updates whenever I publish new articles—no spam,
              just quality content delivered straight to your inbox. Expect deep
              dives into React, Next.js, TypeScript, and the latest trends
              shaping the web.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://jomaendle.com/blog">
                Explore the Blog
              </Button>
            </Section>

            <Text style={paragraph}>
              Looking forward to sharing this journey with you!
            </Text>

            <Text style={signature}>
              Best,
              <br />
              Jo
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you subscribed to Jo's
              newsletter.
            </Text>
            <Text style={footerText}>
              Want to unsubscribe?{" "}
              <Link
                href={`https://jomaendle.com/api/unsubscribe?email=${email}`}
                style={footerLink}
              >
                Click here
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const header = {
  padding: "20px 48px 0",
};

const headerText = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333333",
  margin: "0",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const content = {
  padding: "0 48px 20px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#333333",
  margin: "0 0 16px",
  lineHeight: "32px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#666666",
  margin: "0 0 16px",
};

const signature = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#666666",
  margin: "24px 0 0",
};

const buttonContainer = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#051725",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  padding: "0 48px 20px",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#8898aa",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#2997ff",
  textDecoration: "underline",
};
