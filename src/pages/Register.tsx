import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

const schema = z.object({
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  company: z.string().min(1, "Şirket adı zorunludur"),
  role: z.enum(["Customer", "Supplier"]),
});

type FormValues = z.infer<typeof schema>;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "Customer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await apiClient.post("auth/register", values);
      if (values.role === "Supplier") {
        toast.info("Kaydınız admin onayına gönderildi. Onaylandıktan sonra giriş yapabilirsiniz.");
        navigate("/");
      } else {
        toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
        navigate("/");
      }
    } catch {
      toast.error("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Hesap Oluştur
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Aşağıdaki bilgileri doldurun
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-float border border-border/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Rol Seçimi */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Hesap Türü</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["Customer", "Supplier"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-center h-10 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                      selectedRole === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      value={r}
                      {...register("role")}
                      className="sr-only"
                    />
                    {r === "Customer" ? "Müşteri" : "Tedarikçi"}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm font-medium">Ad</Label>
                <Input
                  id="firstName"
                  placeholder="Ad"
                  {...register("firstName")}
                  className="h-10 bg-secondary/50 border-border/50"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm font-medium">Soyad</Label>
                <Input
                  id="lastName"
                  placeholder="Soyad"
                  {...register("lastName")}
                  className="h-10 bg-secondary/50 border-border/50"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="isim@sirket.com"
                {...register("email")}
                className="h-10 bg-secondary/50 border-border/50"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 8 karakter"
                {...register("password")}
                className="h-10 bg-secondary/50 border-border/50"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="company" className="text-sm font-medium">Şirket</Label>
              <Input
                id="company"
                placeholder="Şirket adı"
                {...register("company")}
                className="h-10 bg-secondary/50 border-border/50"
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-medium mt-2"
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Zaten hesabınız var mı?{" "}
            <Link to="/" className="text-primary hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
