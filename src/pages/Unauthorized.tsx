import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Erişim Reddedildi</h1>
        <p className="text-muted-foreground mb-8">
          Bu sayfayı görüntüleme yetkiniz bulunmuyor.
        </p>
        <Button asChild>
          <Link to="/">Giriş Sayfasına Dön</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
