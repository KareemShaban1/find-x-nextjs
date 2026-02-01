import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
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
import { getDashboardAuthRedirect } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const user = await login(values.email, values.password);
      const isBusiness = user?.role === "organization_owner" || user?.role === "super_admin";
      if (isBusiness) {
        const token = localStorage.getItem("auth_token");
        const dashboardUrl = token
          ? getDashboardAuthRedirect(token)
          : import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000";
        toast.success("Welcome back! Redirecting to dashboard…", {
          description: "If the page doesn't load, start the dashboard: npm run dev:dashboard",
          duration: 6000,
        });
        window.location.href = dashboardUrl;
      } else {
        toast.success("Welcome back!");
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Login failed. Please check your credentials.";
      toast.error(typeof message === "string" ? message : "Login failed.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              Find<span className="text-primary">X</span>
            </Link>
            <p className="text-muted-foreground text-sm">Sign in to your account</p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Enter your email and password.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@business.com" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Don&apos;t have an account?{" "}
                    <Link to="/register/customer" className="font-medium text-primary hover:underline">
                      Sign up as customer
                    </Link>
                    {" · "}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                      List your business
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

export default Login;
