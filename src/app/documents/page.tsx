"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  FileStack
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { UploadDocumentDialog, type DocumentUploadFormValues } from "@/components/documents/UploadDocumentDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// Enhanced mock data with more document types and realistic data
const initialVisitsDataRaw = [
  { 
    id: "1", 
    date: "2024-05-15", 
    doctorName: "Dr. Priya Sharma", 
    specialty: "Cardiology",
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
        fileSize: "245 KB"
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
        fileSize: "128 KB"
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
        fileSize: "1.2 MB"
      },
    ], 
  },
  { 
    id: "2", 
    date: "2024-04-20", 
    doctorName: "Dr. Rohan Mehra", 
    specialty: "Neurology",
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
        fileSize: "3.5 MB"
      }
    ], 
  },
  { 
    id: "3", 
    date: "2024-03-05", 
    doctorName: "Dr. Ananya Reddy", 
    specialty: "Endocrinology",
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
        fileSize: "320 KB"
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
        fileSize: "180 KB"
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
  specialty?: string;
  visitReason?: string;
  diagnosis?: string;
  fileSize?: string;
  originalVisitDate?: string;
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

export default function DocumentsPage() {
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>(() => transformInitialData(initialVisitsDataRaw));
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();
  const { t } = useLanguage();

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || doc.type.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesType;
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
      fileSize: data.documentFile ? `${(data.documentFile.size / 1024).toFixed(1)} KB` : undefined
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
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Search documents..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={FileSearch}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <FilePlus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
                  onClick={() => setViewDoc(doc)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex items-center justify-center rounded-lg p-2.5 shrink-0">
                        <DocumentTypeIcon type={doc.type} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{doc.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(doc.documentDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        {doc.doctorName && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {doc.doctorName}
                            {doc.specialty && ` • ${doc.specialty}`}
                          </p>
                        )}
                      </div>
                      
                      <Popover open={popoverOpenId === doc.id} onOpenChange={open => setPopoverOpenId(open ? doc.id : null)}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setPopoverOpenId(doc.id); }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1" onClick={e => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 px-2 py-2 text-sm"
                            onClick={() => { setViewDoc(doc); setPopoverOpenId(null); }}
                          >
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 px-2 py-2 text-sm"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" /> Download
                          </Button>
                          <Separator className="my-1" />
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>
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
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first document to get started"}
              </p>
              {!searchQuery && filterType === "all" && (
                <Button className="mt-4 gap-2" onClick={() => setShowUploadDialog(true)}>
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
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <DocumentTypeIcon type={viewDoc.type} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{viewDoc.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{viewDoc.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(viewDoc.documentDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Document Preview */}
              <div className="space-y-4">
                <h3 className="font-medium">Document Preview</h3>
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
                  <h3 className="font-medium mb-3">Document Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="text-sm font-medium">{viewDoc.doctorName || "—"}</p>
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
                  <h3 className="font-medium mb-3">File Information</h3>
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