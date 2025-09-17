import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Tạo tài khoản Quản lý</CardTitle>
          <CardDescription>Bắt đầu quản lý tòa nhà của bạn bằng việc tạo tài khoản.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
