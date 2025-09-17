import { LoginForm } from "@/components/auth/login-form";
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
          <CardTitle className="text-3xl font-bold font-headline">Building Buddy</CardTitle>
          <CardDescription>Quản lý tòa nhà thông minh</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter>
            <div className="w-full text-center text-sm text-muted-foreground p-4 bg-secondary rounded-lg">
                <p className="font-semibold">Tài khoản demo:</p>
                <p>Cư dân: 0901234567</p>
                <p>Quản lý: 0901234568</p>
                <p>Kỹ thuật: 0901234569</p>
                <p className="mt-2 font-medium">Mã OTP: 123456</p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
