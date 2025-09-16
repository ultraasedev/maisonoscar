'use client';

import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';

import { Download, RefreshCw, Check, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureDataUrl: string) => void;
  signerName: string;
  documentTitle?: string;
}

export const SignaturePad = ({ isOpen, onClose, onSign, signerName, documentTitle = 'Contrat de location' }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current && isOpen) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Configuration du canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        setContext(ctx);
        clearCanvas();
      }
    }
  }, [isOpen]);

  const clearCanvas = () => {
    if (canvasRef.current && context) {
      const canvas = canvasRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fond blanc
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Ligne de signature
      context.strokeStyle = '#e5e7eb';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(20, canvas.height - 40);
      context.lineTo(canvas.width - 20, canvas.height - 40);
      context.stroke();
      
      // Texte indicatif
      context.font = '12px system-ui';
      context.fillStyle = '#9ca3af';
      context.fillText('Signez ci-dessus', canvas.width / 2 - 40, canvas.height - 20);
      
      // Reset style pour signature
      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      
      setHasSignature(false);
    }
  };

  const getCoordinates = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const { x, y } = getCoordinates(e);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
    
    // Empêcher le scroll sur mobile
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
    
    // Empêcher le scroll sur mobile
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const handleSign = () => {
    if (!canvasRef.current || !hasSignature) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSign(dataUrl);
    onClose();
  };

  const downloadSignature = () => {
    if (!canvasRef.current || !hasSignature) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature_${signerName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Signature électronique</DialogTitle>
          <DialogDescription className="text-gray-600">
            {documentTitle} - Signataire : {signerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Canvas de signature */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-64 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Edit3 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Instructions :</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Utilisez votre souris ou votre doigt pour signer</li>
                  <li>La signature doit être claire et lisible</li>
                  <li>Vous pouvez effacer et recommencer si nécessaire</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Effacer
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadSignature}
              disabled={!hasSignature}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </Button>
            
            <Button
              onClick={handleSign}
              disabled={!hasSignature}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800"
            >
              <Check className="w-4 h-4" />
              Valider la signature
            </Button>
          </div>

          {/* Avertissement légal */}
          <div className="text-xs text-gray-500 text-center">
            En signant ce document, vous certifiez avoir lu et accepté les termes du contrat.
            Cette signature électronique a la même valeur légale qu'une signature manuscrite.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};