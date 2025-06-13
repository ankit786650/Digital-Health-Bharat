"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  MoreVertical,
  Upload,
  StickyNote,
  Image as ImageIcon,
  ShieldCheck,
  Package,
  Download,
  Eye,
  Trash2,
  FileSearch,
  FilePlus,
  FileDigit,
  FileCheck,
  FileArchive,
  FileInput,
  FileOutput,
  FileSignature,
  FileSpreadsheet,
  FileX,
  FileBadge,
  FileClock,
  FileHeart,
  FileKey,
  FilePieChart,
  FileScan,
  FileUp,
  FileDown,
  FileBarChart2,
  FileDiff,
  FileJson,
  FileStack,
  Search,
  Filter,
  ChevronDown,
  CalendarDays
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { UploadDocumentDialog, type DocumentUploadFormValues } from "@/components/documents/UploadDocumentDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced mock data with more document types and realistic data
const initialVisitsDataRaw = [
  { 
    id: "1", 
    date: "2024-05-15", 
    doctorName: "Dr. Priya Sharma", 
    specialty: "Cardiology",
    doctorImage: "/doctors/dr-sharma.jpg",
    documents: [
      { 
        id: "doc1", 
        name: "Comprehensive Blood Test Results", 
        type: "Lab Report", 
        icon: FileText, 
        originalFile: null, 
        documentDate: "2024-05-15",
        diagnosis: "Hyperlipidemia",
        visitReason: "Annual Checkup",
        fileSize: "245 KB",
        status: "verified"
      },
      { 
        id: "doc2", 
        name: "Medication List Adjustment", 
        type: "Prescription", 
        icon: FileSignature, 
        originalFile: null, 
        documentDate: "2024-05-15",
        diagnosis: "Hypertension",
        visitReason: "Medication Review",
        fileSize: "128 KB",
        status: "verified"
      },
      { 
        id: "doc3", 
        name: "Chest X-Ray Scan", 
        type: "Imaging", 
        icon: ImageIcon, 
        originalFile: null, 
        documentDate: "2024-05-15",
        diagnosis: "Respiratory Symptoms",
        visitReason: "Follow-up",
        fileSize: "1.2 MB",
        status: "pending"
      },
    ], 
  },
  { 
    id: "2", 
    date: "2024-04-20", 
    doctorName: "Dr. Rohan Mehra", 
    specialty: "Neurology",
    doctorImage: "/doctors/dr-mehra.jpg",
    documents: [
      { 
        id: "doc4", 
        name: "MRI Scan Results", 
        type: "Imaging Report", 
        icon: FileScan, 
        originalFile: null, 
        documentDate: "2024-04-20",
        diagnosis: "Migraine Evaluation",
        visitReason: "Headache Assessment",
        fileSize: "3.5 MB",
        status: "verified"
      }
    ], 
  },
  { 
    id: "3", 
    date: "2024-03-05", 
    doctorName: "Dr. Ananya Reddy", 
    specialty: "Endocrinology",
    doctorImage: "/doctors/dr-reddy.jpg",
    documents: [
      {
        id: "doc5", 
        name: "Diabetes Management Plan", 
        type: "Treatment Plan", 
        icon: FileCheck, 
        originalFile: null, 
        documentDate: "2024-03-05",
        diagnosis: "Type 2 Diabetes",
        visitReason: "Quarterly Review",
        fileSize: "320 KB",
        status: "verified"
      },
      {
        id: "doc6", 
        name: "Blood Sugar Log", 
        type: "Patient Record", 
        icon: FileStack, 
        originalFile: null, 
        documentDate: "2024-03-05",
        diagnosis: "Type 2 Diabetes",
        visitReason: "Quarterly Review",
        fileSize: "180 KB",
        status: "pending"
      }
    ], 
  },
];

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  originalFile: File | null;
  documentDate: string;
  doctorName?: string;
  doctorImage?: string;
  specialty?: string;
  visitReason?: string;
  diagnosis?: string;
  fileSize?: string;
  originalVisitDate?: string;
  status?: "verified" | "pending" | "expired";
};

const transformInitialData = (rawData: typeof initialVisitsDataRaw): DocumentItem[] => {
  const documents: DocumentItem[] = [];
  const currentYear = new Date().getFullYear();

  rawData.forEach(visit => {
    const visitDateParts = visit.date.split('-');
    const adjustedVisitDate = `${currentYear}-${visitDateParts[1]}-${visitDateParts[2]}`;

    visit.documents.forEach(doc => {
      const docDateParts = doc.documentDate.split('-');
      const adjustedDocDate = `${currentYear}-${docDateParts[1]}-${docDateParts[2]}`;
      
      documents.push({
        ...doc,
        documentDate: adjustedDocDate,
        doctorName: visit.doctorName,
        doctorImage: visit.doctorImage,
        specialty: visit.specialty,
        originalVisitDate: adjustedVisitDate,
      });
    });
  });
  
  return documents.sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());
};

const DocumentTypeIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, React.ElementType> = {
    "lab report": FileText,
    "prescription": FileSignature,
    "imaging": ImageIcon,
    "imaging report": FileScan,
    "consultation notes": StickyNote,
    "visit summary": FileText,
    "discharge summary": FileOutput,
    "vaccination document": ShieldCheck,
    "insurance document": FileBadge,
    "treatment plan": FileCheck,
    "patient record": FileStack,
    "medical history": FileClock,
    "test results": FileSearch,
    "referral letter": FileInput,
    "surgical report": FileHeart,
    "allergy list": FileX,
    "progress notes": FileSpreadsheet,
    "billing statement": FileBarChart2,
    "consent form": FileKey,
    "physician orders": FileDigit,
    "procedure report": FilePieChart,
    "therapy notes": FileDiff,
    "diagnostic report": FileJson,
    "other": FileUp
  };

  const IconComponent = iconMap[type.toLowerCase()] || FileText;
  return <IconComponent className="h-5 w-5" />;
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  const statusConfig = {
    verified: { label: "Verified", color: "bg-green-100 text-green-800" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    expired: { label: "Expired", color: "bg-red-100 text-red-800" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

// DocumentCard component for displaying each document in a larger, less compact card
const DocumentCard = ({ 
  doc, 
  onView, 
  onDownload, 
  onDelete 
}: {
  doc: DocumentItem;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-md border-border/70 hover:border-primary/30 h-full flex flex-col"
      onClick={onView}
    >
      <CardContent className="p-5 flex flex-col flex-1 gap-4">
        {/* Header with icon and menu */}
        <div className="flex justify-between items-start">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <DocumentTypeIcon type={doc.type} />
          </div>
          
          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(true);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1" onClick={e => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 px-2 py-2 text-sm hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setIsMenuOpen(false);
                }}
              >
                <Eye className="h-4 w-4" /> View Details
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 px-2 py-2 text-sm hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                  setIsMenuOpen(false);
                }}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
              <Separator className="my-1" />
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setIsMenuOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Document title and status */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-semibold leading-snug line-clamp-2">
              {doc.name}
            </h3>
            <StatusBadge status={doc.status} />
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {doc.type}
          </Badge>
        </div>

        {/* Doctor info */}
        {doc.doctorName && (
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={doc.doctorImage} />
              <AvatarFallback className="text-xs">
                {doc.doctorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.doctorName}</p>
              {doc.specialty && (
                <p className="text-xs text-muted-foreground truncate">
                  {doc.specialty}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadata footer */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {format(parseISO(doc.documentDate), "MMM d, yyyy")}
              </span>
            </div>
            {doc.fileSize && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {doc.fileSize}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DocumentsPage() {
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>(() => transformInitialData(initialVisitsDataRaw));
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const { t } = useLanguage();

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || doc.type.toLowerCase().includes(filterType.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const documentTypes = Array.from(new Set(allDocuments.map(doc => doc.type)));

  const handleDocumentUploadSubmit = (data: DocumentUploadFormValues) => {
    const newDocument: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: data.documentTitle,
      type: data.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: FileText,
      originalFile: data.documentFile,
      documentDate: format(data.documentDate, "yyyy-MM-dd"),
      doctorName: data.doctorName,
      visitReason: data.visitReason,
      diagnosis: data.diagnosis,
      fileSize: data.documentFile ? `${(data.documentFile.size / 1024).toFixed(1)} KB` : undefined,
      status: "pending"
    };

    setAllDocuments(prevDocs => 
      [newDocument, ...prevDocs].sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime())
    );

    toast({
      title: "Document Added",
      description: `"${data.documentTitle}" has been added to your documents.`,
    });
    setShowUploadDialog(false);
  };

  const handleDeleteDocument = (id: string) => {
    setAllDocuments(prev => prev.filter(doc => doc.id !== id));
    setPopoverOpenId(null);
    toast({ title: "Document Deleted", description: "The document has been removed.", variant: "destructive" });
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    if (doc.originalFile) {
      const url = URL.createObjectURL(doc.originalFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      toast({ title: "No file available", description: "This document does not have an uploaded file.", variant: "destructive" });
    }
    setPopoverOpenId(null);
  };

  return (
    <div className="flex flex-1 flex-col bg-background w-full">
      <UploadDocumentDialog
        isOpen={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onSubmitDocument={handleDocumentUploadSubmit}
        userName={t('kishan')}
      />

      <div className="flex flex-col gap-4 p-6 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Medical Documents
          </h1>
          <p className="text-muted-foreground text-sm">
            Securely store and manage all your medical records in one place
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span>{filterType === "all" ? "All Types" : filterType}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{filterStatus === "all" ? "All Status" : filterStatus}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
          >
            <FilePlus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={() => setViewDoc(doc)}
                  onDownload={() => handleDownloadDocument(doc)}
                  onDelete={() => handleDeleteDocument(doc.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <Package className="h-16 w-16 text-muted-foreground" />
                <div className="absolute -bottom-2 -right-2 bg-primary/10 rounded-full p-2">
                  <FileSearch className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first document to get started"}
              </p>
              {!searchQuery && filterType === "all" && filterStatus === "all" && (
                <Button className="mt-4 gap-2 shadow-sm" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* View Details Dialog */}
      {viewDoc && (
        <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-lg">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <DocumentTypeIcon type={viewDoc.type} />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold">{viewDoc.name}</DialogTitle>
                  {/* Replacing DialogDescription with div to avoid <div> inside <p> HTML error */}
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary">{viewDoc.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(viewDoc.documentDate), "MMMM d, yyyy")}
                    </span>
                    <StatusBadge status={viewDoc.status} />
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Document Preview */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Document Preview</h3>
                <div className="border rounded-lg bg-muted/50 aspect-video flex items-center justify-center">
                  {viewDoc.originalFile ? (
                    viewDoc.originalFile.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(viewDoc.originalFile)} 
                        alt="Document preview" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : viewDoc.originalFile.type === 'application/pdf' ? (
                      <iframe 
                        src={URL.createObjectURL(viewDoc.originalFile)} 
                        title="PDF Preview" 
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6">
                      <FileX className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No file attached to this document</p>
                    </div>
                  )}
                </div>
                
                {viewDoc.originalFile && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleDownloadDocument(viewDoc)}
                  >
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                )}
              </div>
              
              {/* Document Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm mb-3">Document Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={viewDoc.doctorImage} />
                          <AvatarFallback>{viewDoc.doctorName?.charAt(0) || "—"}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{viewDoc.doctorName || "—"}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Specialty</p>
                      <p className="text-sm font-medium">{viewDoc.specialty || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Visit Date</p>
                      <p className="text-sm font-medium">
                        {viewDoc.originalVisitDate ? format(parseISO(viewDoc.originalVisitDate), "PPP") : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Visit Reason</p>
                      <p className="text-sm font-medium">{viewDoc.visitReason || "—"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Diagnosis</p>
                      <p className="text-sm font-medium">{viewDoc.diagnosis || "—"}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-sm mb-3">File Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">File Type</p>
                      <p className="text-sm font-medium">
                        {viewDoc.originalFile ? viewDoc.originalFile.type.split('/')[1].toUpperCase() : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">File Size</p>
                      <p className="text-sm font-medium">{viewDoc.fileSize || "—"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Uploaded</p>
                      <p className="text-sm font-medium">
                        {format(parseISO(viewDoc.documentDate), "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}