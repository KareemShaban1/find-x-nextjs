import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Contact = () => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Simulate API call – replace with your contact endpoint when ready
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(t("contact.successMessage"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error(t("contact.errorMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-12 md:py-20">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>

        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              {t("contact.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-semibold">{t("contact.sendMessage")}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contact.name")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("contact.namePlaceholder")}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contact.email")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("contact.emailPlaceholder")}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("contact.subject")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("contact.subjectPlaceholder")}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.message")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.messagePlaceholder")}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    <Send className="h-4 w-4" />
                    {submitting ? t("contact.sending") : t("contact.send")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold">{t("contact.getInTouch")}</h2>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{t("contact.emailLabel")}</p>
                      <a
                        href="mailto:support@findx.com"
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        support@findx.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{t("contact.phoneLabel")}</p>
                      <a
                        href="tel:1-800-FINDX"
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        1-800-FINDX
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{t("contact.addressLabel")}</p>
                      <p className="text-muted-foreground">
                        {t("contact.address")}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
