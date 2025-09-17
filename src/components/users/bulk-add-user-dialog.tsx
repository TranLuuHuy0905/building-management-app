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
import type { BulkUserCreationData } from '@/lib/types';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BulkAddUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUsersAdded: () => void;
}

const CSV_TEMPLATE_HEADER = "name,apartment,email,password\n";
const CSV_TEMPLATE_BODY = "Nguyen Van A,P-101,nguyenvana@email.com,MatKhau123\nTran Thi B,P-102,tranthib@email.com,Password@456\n";

export function BulkAddUserDialog({ isOpen, onOpenChange, onUsersAdded }: BulkAddUserDialogProps) {
  const { createResidentsInBulk } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{success: number, failed: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setIsSubmitting(false);
    setProgress(0);
    setResults(null);
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
    const blob = new Blob([CSV_TEMPLATE_HEADER, CSV_TEMPLATE_BODY], { type: 'text/csv;charset=utf-8;' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng chọn một tệp CSV." });
        return;
    }
    
    setIsSubmitting(true);
    setResults(null);
    setProgress(5);

    Papa.parse<BulkUserCreationData>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const users = results.data;
            const requiredFields: (keyof BulkUserCreationData)[] = ['name', 'email', 'apartment', 'password'];
            
            const isValid = users.every(user => {
                return requiredFields.every(field => user[field] && String(user[field]).trim() !== '');
            });

            if (!isValid || users.length === 0) {
                 toast({
                    variant: "destructive",
                    title: "Tệp không hợp lệ",
                    description: "Tệp CSV phải chứa các cột 'name', 'email', 'apartment', 'password' và không có dòng trống.",
                });
                setIsSubmitting(false);
                return;
            }
            
            setProgress(30);
            const creationResult = await createResidentsInBulk(users);
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
        },
        error: (error) => {
            console.error("CSV Parsing Error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi xử lý tệp",
                description: "Không thể đọc tệp CSV. Vui lòng kiểm tra định dạng tệp.",
            });
            setIsSubmitting(false);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản hàng loạt</DialogTitle>
          <DialogDescription>
            Tải lên tệp .csv để tạo nhiều tài khoản cư dân cùng lúc.
          </DialogDescription>
        </DialogHeader>
        
        { !results ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Quan trọng!</AlertTitle>
                    <AlertDescription>
                        Việc tạo tài khoản hàng loạt cần xác thực lại mật khẩu của bạn. Trình duyệt có thể hỏi mật khẩu của bạn để tiếp tục.
                    </AlertDescription>
                </Alert>

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
                    </div>
                )}
                
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => handleClose(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button type="submit" disabled={isSubmitting || !file}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Bắt đầu tạo
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
  );
}
