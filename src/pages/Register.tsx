import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_PLANS, getDashboardAuthRedirect, type SubscriptionPlan } from "@/lib/api";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    // Your account
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    // Business (associated with your account)
    business_name: z.string().min(2, "Business name is required"),
    business_address: z.string().min(3, "Business address is required"),
    business_phone: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: doRegister } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      business_name: "",
      business_address: "",
      business_phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    if (step === 1) {
      setStep(2);
      return;
    }
    try {
      await doRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        business_name: values.business_name,
        business_address: values.business_address,
        business_phone: values.business_phone || undefined,
        plan_id: selectedPlanId,
      });
      const token = localStorage.getItem("auth_token");
      toast.success("Account created! Redirecting to dashboard…");
      if (token) {
        window.location.href = getDashboardAuthRedirect(token);
      } else {
        window.location.href = import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000";
      }
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Registration failed. Please try again.";
      toast.error(typeof message === "string" ? message : "Registration failed.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              Find<span className="text-primary">X</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {step === 1 ? "Create your business account" : "Choose your plan"}
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Business account" : "Subscription plan"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Enter your account details and your business details so we can associate them."
                  : "Select a plan to get started. You can change it later."}
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">Your account</p>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@business.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password_confirmation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4 border-t pt-6">
                        <p className="text-sm font-medium text-muted-foreground">Business details (linked to your account)</p>
                        <FormField
                          control={form.control}
                          name="business_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Coffee Shop" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="business_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, City, State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="business_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business phone (optional)</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {AUTH_PLANS.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          selected={selectedPlanId === plan.id}
                          onSelect={() => setSelectedPlanId(plan.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <div className="flex w-full gap-2">
                    {step === 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={step === 2 ? "flex-1" : "w-full"}
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? "Creating account…"
                        : step === 1
                          ? "Continue to plans"
                          : "Create account"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-lg border-2 p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        plan.highlighted && "ring-2 ring-primary/30"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Popular
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className="font-semibold">{plan.name}</span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">${plan.price_monthly}</span>
        <span className="text-muted-foreground text-sm">/month</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default Register;
