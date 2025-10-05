import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/ui/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jo Mändle",
};

export default function ContactPage() {
  return (
    <div className="page-container">
      <main
        className="glass-container mx-auto flex max-w-3xl flex-col gap-8"
        style={{ viewTransitionName: "main-content" }}
      >
        <ContactForm />
        <Footer />
      </main>
    </div>
  );
}
