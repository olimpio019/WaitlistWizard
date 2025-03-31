import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onChange?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  className?: string;
  value?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  getDataUrl: () => string;
  isEmpty: () => boolean;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, width, height = 200, className, value }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useImperativeHandle(ref, () => ({
      clear: () => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
          setIsEmpty(true);
          if (onChange) onChange("");
        }
      },
      getDataUrl: () => {
        return sigCanvas.current?.isEmpty()
          ? ""
          : sigCanvas.current?.toDataURL("image/png") || "";
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() || true;
      },
    }));

    const handleClear = () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
        if (onChange) onChange("");
      }
    };

    const handleEnd = () => {
      if (sigCanvas.current) {
        setIsEmpty(sigCanvas.current.isEmpty());
        if (onChange && !sigCanvas.current.isEmpty()) {
          onChange(sigCanvas.current.toDataURL("image/png"));
        }
      }
    };

    // If a value is provided, try to load it
    useEffect(() => {
      if (value && sigCanvas.current) {
        // Create a temporary image to load the data URL
        const img = new Image();
        img.onload = () => {
          const ctx = sigCanvas.current?.getCanvas().getContext("2d");
          if (ctx) {
            // Clear current canvas
            sigCanvas.current?.clear();
            // Draw the image
            ctx.drawImage(img, 0, 0);
            setIsEmpty(false);
          }
        };
        img.src = value;
      }
    }, [value]);

    return (
      <div className={cn("border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700", className)}>
        <div className="w-full h-48 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
          <SignatureCanvas
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
          />
        </div>
        <div className="mt-2 flex justify-end space-x-2">
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
