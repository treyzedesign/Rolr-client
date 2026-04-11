"use client";

import { X, Download } from "lucide-react";

interface PDFViewerModalProps {
  pdfUrl: string;
  onClose: () => void;
}

export function PDFViewerModal({ pdfUrl, onClose }: PDFViewerModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download Resume"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-[calc(90vh-8rem)] overflow-auto">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Resume PDF"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
