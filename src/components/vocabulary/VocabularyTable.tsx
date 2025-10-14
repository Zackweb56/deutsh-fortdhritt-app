import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

type SortField = 'german' | 'pronunciation' | 'translation' | 'dateAdded';
type SortDirection = 'asc' | 'desc';

export const VocabularyTable = () => {
  const { vocabulary, deleteVocabulary } = useApp();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    let filtered = vocabulary.filter(item =>
      item.german.toLowerCase().includes(search.toLowerCase()) ||
      item.pronunciation.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'dateAdded') {
        aVal = new Date(a.dateAdded).getTime().toString();
        bVal = new Date(b.dateAdded).getTime().toString();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [vocabulary, search, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteVocabulary(deleteId);
      toast.success('تم حذف المفردة');
      setDeleteId(null);
    }
  };

  const handleExportPDF = async () => {
    if (vocabulary.length === 0) {
      toast.error('لا توجد مفردات للتصدير');
      return;
    }

    try {
      // Create PDF with RTL support
      const doc = new jsPDF();

      // Load Amiri font for Arabic support (base64 encoded)
      // Note: In production, you'd want to load this from a file
      const amiriFontBase64 = await fetch(
        'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf'
      )
        .then(res => res.blob())
        .then(blob => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        })
        .then(dataUrl => dataUrl.split(',')[1]);

      doc.addFileToVFS('Amiri-Regular.ttf', amiriFontBase64);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.setFont('Amiri');

      // Add title
      doc.setFontSize(18);
      doc.text('قائمة المفردات الألمانية', doc.internal.pageSize.width - 10, 15, { 
        align: 'right' 
      });

      // Prepare table data
      const tableData = vocabulary.map(item => [
        item.translation,
        item.pronunciation,
        item.german,
      ]);

      // Add table
      autoTable(doc, {
        head: [['الترجمة', 'النطق', 'الألمانية']],
        body: tableData,
        startY: 25,
        styles: {
          font: 'Amiri',
          fontSize: 12,
          halign: 'right',
        },
        headStyles: {
          // Use a neutral/dark header color instead of bright blue to better match the app theme
          // (slate/navy tone)
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          // Use normal style because we only registered the regular font variant.
          fontStyle: 'normal',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Save the PDF
      doc.save('vocabulary.pdf');
      toast.success('تم تصدير المفردات بنجاح');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('فشل تصدير المفردات');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المفردات..."
            className="pr-10"
          />
        </div>
        <LockOverlay isLocked={isLimitedAccess()} message="التصدير محجوب — تواصل عبر واتساب لفتح الوصول الكامل">
          <Button onClick={handleExportPDF} className="gap-2 bg-neutral-800 text-neutral-foreground">
            <Download className="h-4 w-4" />
            <span>تصدير PDF</span>
          </Button>
        </LockOverlay>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('german')}
                  className="gap-1"
                >
                  الألمانية
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('pronunciation')}
                  className="gap-1"
                >
                  النطق
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('translation')}
                  className="gap-1"
                >
                  الترجمة
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('dateAdded')}
                  className="gap-1"
                >
                  التاريخ
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right w-20">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {search ? 'لا توجد نتائج' : 'لم تتم إضافة أي مفردات بعد'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium" dir="ltr">
                    {item.german}
                  </TableCell>
                  <TableCell className="text-muted-foreground" dir="ltr">
                    {item.pronunciation || '-'}
                  </TableCell>
                  <TableCell>{item.translation}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Intl.DateTimeFormat('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric', numberingSystem: 'latn' }).format(new Date(item.dateAdded))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المفردة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
