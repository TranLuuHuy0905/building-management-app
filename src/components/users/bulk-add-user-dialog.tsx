'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileDown, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import type { BulkUserCreationData, User } from '@/lib/types';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ReauthDialog } from './reauth-dialog';
import { getUsers } from '@/lib/services/user-service';

interface BulkAddUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUsersAdded: () => void;
}

const CSV_TEMPLATE_HEADER = "name,apartment,email,phone,password\n";
const CSV_TEMPLATE_BODY = "Nguyen Van A,P-101,nguyenvana@email.com,0901234567,MatKhau123\nTran Thi B,P-102,tranthib@email.com,0907654321,Password@456\n";

export function BulkAddUserDialog({ isOpen, onOpenChange, onUsersAdded }: BulkAddUserDialogProps) {
  const { currentUser, createResidentsInBulk } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{success: number, failed: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [parsedUsers, setParsedUsers] = useState<BulkUserCreationData[]>([]);

  const resetState = () => {
    setFile(null);
    setIsSubmitting(false);
    setProgress(0);
    setResults(null);
    setParsedUsers([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleClose = (open: boolean) => {
    if (!isSubmitting) {
        resetState();
        onOpenChange(open);
    }
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + CSV_TEMPLATE_HEADER + CSV_TEMPLATE_BODY], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "resident_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const validateData = async (users: BulkUserCreationData[]) => {
    if (!currentUser?.buildingName) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể xác định tòa nhà hiện tại." });
        return { isValid: false, message: "" };
    }

    const existingUsers = await getUsers({ buildingName: currentUser.buildingName });
    const existingApartments = new Set(existingUsers.map(u => u.apartment));

    const apartmentsInCsv = new Set<string>();

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const rowNum = i + 2; // +2 for header and 0-based index

        // Check for duplicates within the CSV
        if (apartmentsInCsv.has(user.apartment)) return { isValid: false, message: `Lỗi ở dòng ${rowNum}: Số căn hộ ${user.apartment} bị lặp lại trong tệp.` };
        apartmentsInCsv.add(user.apartment);
        
        // Check against database
        if (existingApartments.has(user.apartment)) return { isValid: false, message: `Lỗi ở dòng ${rowNum}: Số căn hộ ${user.apartment} đã tồn tại trong hệ thống.` };
       
        // Check password length
        if (user.password.length < 6) return { isValid: false, message: `Lỗi ở dòng ${rowNum}: Mật khẩu phải có ít nhất 6 ký tự.` };
    }
    
    return { isValid: true, message: "" };
  }


  const handleFileParseAndValidate = (e: React.FormEvent) => {
     e.preventDefault();
    if (!file) {
        toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng chọn một tệp CSV." });
        return;
    }
    
    Papa.parse<BulkUserCreationData>(file, {
        header: true,
        skipEmptyLines: true,
        async complete(results) {
            const users = results.data;
            const requiredFields: (keyof BulkUserCreationData)[] = ['name', 'email', 'apartment', 'password', 'phone'];
            
            const hasAllColumns = results.meta.fields && requiredFields.every(field => results.meta.fields!.includes(field));

            if (!hasAllColumns || users.length === 0) {
                 toast({
                    variant: "destructive",
                    title: "Tệp không hợp lệ",
                    description: "Tệp CSV phải chứa các cột 'name', 'email', 'apartment', 'phone', 'password' và có ít nhất một dòng dữ liệu.",
                });
                return;
            }

            const { isValid, message } = await validateData(users);

            if (!isValid) {
                toast({
                    variant: "destructive",
                    title: "Dữ liệu không hợp lệ",
                    description: message,
                    duration: 7000,
                });
                return;
            }

            setParsedUsers(users);
            setIsReauthDialogOpen(true);
        },
        error: (error) => {
            console.error("CSV Parsing Error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi xử lý tệp",
                description: "Không thể đọc tệp CSV. Vui lòng kiểm tra định dạng tệp.",
            });
        }
    });
  }

  const handleReauthSuccess = async (adminPassword: string) => {
    setIsReauthDialogOpen(false);
    setIsSubmitting(true);
    setResults(null);
    setProgress(5);
    
    const totalUsers = parsedUsers.length;
    const creationResult = await createResidentsInBulk(parsedUsers, adminPassword, (processedCount) => {
        const newProgress = 30 + (processedCount / totalUsers) * 70;
        setProgress(newProgress);
    });

    setProgress(100);
    setResults(creationResult);

    if(creationResult.success > 0) {
         toast({
            title: "Hoàn tất!",
            description: `Đã tạo thành công ${creationResult.success} tài khoản.`,
        });
        onUsersAdded();
    }
    if(creationResult.failed > 0) {
         toast({
            variant: "destructive",
            title: "Có lỗi xảy ra",
            description: `Đã có lỗi khi tạo ${creationResult.failed} tài khoản. Kiểm tra console để biết thêm chi tiết.`,
        });
    }
    setIsSubmitting(false);
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản hàng loạt</DialogTitle>
          <DialogDescription>
            Tải lên tệp .csv để tạo nhiều tài khoản cư dân cùng lúc.
          </DialogDescription>
        </DialogHeader>
        
        { !results ? (
            <form onSubmit={handleFileParseAndValidate} className="space-y-4">
                <div className="space-y-2">
                    <Label>Bước 1: Tải tệp mẫu</Label>
                    <p className="text-xs text-muted-foreground">Sử dụng tệp mẫu để đảm bảo đúng định dạng dữ liệu.</p>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Tải tệp mẫu.csv
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="csv-file">Bước 2: Tải lên tệp của bạn</Label>
                    <Input 
                        id="csv-file" 
                        type="file" 
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                        required 
                        disabled={isSubmitting}
                    />
                </div>

                {isSubmitting && (
                    <div className="space-y-2 pt-2">
                        <Label>Đang xử lý...</Label>
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground">Quá trình này có thể mất vài phút. Vui lòng không đóng cửa sổ.</p>
                    </div>
                )}
                
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => handleClose(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button type="submit" disabled={isSubmitting || !file}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                           "Kiểm tra & Bắt đầu"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        ) : (
            <div className="space-y-4">
                <h3 className="font-semibold">Kết quả tạo tài khoản</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">Thành công</p>
                        <p className="text-3xl font-bold text-green-700">{results.success}</p>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-red-100 rounded-lg">
                        <p className="text-sm text-red-800">Thất bại</p>
                        <p className="text-3xl font-bold text-red-700">{results.failed}</p>
                    </div>
                </div>
                 <DialogFooter>
                    <Button onClick={() => handleClose(false)}>Đóng</Button>
                </DialogFooter>
            </div>
        )
        }
      </DialogContent>
    </Dialog>
    <ReauthDialog 
        isOpen={isReauthDialogOpen}
        onOpenChange={setIsReauthDialogOpen}
        onReauthSuccess={handleReauthSuccess}
    />
    </>
  );
}
