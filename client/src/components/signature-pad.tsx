import React, { forwardRef, useRef, useEffect } from 'react';
import * as SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  getTrimmedCanvas: () => HTMLCanvasElement;
}

interface SignaturePadProps {
  onChange?: (dataUrl: string) => void;
  width?: string | number;
  height?: number;
  className?: string;
  value?: string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, width, height = 200, className, value }, ref) => {
    const sigCanvas = useRef<SignatureCanvas.default>(null);
    const [isEmpty, setIsEmpty] = React.useState(true);

    useEffect(() => {
      if (value && sigCanvas.current) {
        sigCanvas.current.fromDataURL(value);
        setIsEmpty(false);
      }
    }, [value]);

    const handleEnd = () => {
      if (sigCanvas.current) {
        const isEmpty = sigCanvas.current.isEmpty();
        setIsEmpty(isEmpty);
        if (!isEmpty && onChange) {
          try {
            const dataUrl = sigCanvas.current.toDataURL('image/png');
            onChange(dataUrl);
          } catch (error) {
            console.error('Erro ao obter assinatura:', error);
          }
        }
      }
    };

    const handleClear = () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
        if (onChange) {
          onChange('');
        }
      }
    };

    React.useImperativeHandle(ref, () => ({
      clear: () => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
          setIsEmpty(true);
        }
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      getTrimmedCanvas: () => {
        if (sigCanvas.current) {
          return sigCanvas.current.getTrimmedCanvas();
        }
        return document.createElement('canvas');
      },
    }));

    return (
      <div className={cn("border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700", className)}>
        <div className="w-full h-[200px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
          <SignatureCanvas.default
            ref={sigCanvas}
            canvasProps={{
              width: width || "100%",
              height: height,
              className: "signature-canvas w-full h-full",
            }}
            onEnd={handleEnd}
            penColor={
              document.documentElement.classList.contains("dark")
                ? "#FFFFFF"
                : "#000000"
            }
            velocityFilterWeight={0.7}
            minWidth={1.5}
            maxWidth={2.5}
            dotSize={2}
            throttle={16}
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Assine com o mouse ou dedo (dispositivos touch)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty}
          >
            Limpar
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
