
'use client';
import { RegisterForm } from "@/components/auth/register-form";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && currentUser) {
            const homePage = currentUser.role === 'admin' ? '/admin/home' : 
                         currentUser.role === 'resident' ? '/resident/home' :
                         '/technician/home';
            router.replace(homePage);
        }
    }, [currentUser, loading, router]);


    if(loading || currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                    <Building2 className="w-8 h-8" />
                </div>
                <CardTitle className="text-3xl font-bold font-headline">Building Buddy</CardTitle>
                <CardDescription>Giải pháp quản lý tòa nhà thông minh</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                        <TabsTrigger value="register">Đăng ký Quản lý</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đăng nhập</CardTitle>
                                <CardDescription>Sử dụng tài khoản đã được cấp để truy cập.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LoginForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="register">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tạo tài khoản Quản lý</CardTitle>
                                <CardDescription>Bắt đầu quản lý tòa nhà của bạn bằng việc tạo tài khoản.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RegisterForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
