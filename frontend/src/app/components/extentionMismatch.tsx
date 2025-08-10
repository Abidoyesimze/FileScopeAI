import React from 'react';
import { AlertTriangle, FileX, RefreshCcw, Info } from 'lucide-react';

interface ExtensionMismatchWarningProps {
  fileName: string;
  expectedType: string;
  actualType: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const ExtensionMismatchWarning: React.FC<ExtensionMismatchWarningProps> = ({
  fileName,
  expectedType,
  actualType,
  onDismiss,
  onRetry
}) => {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <FileX className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              File Extension Mismatch Detected
            </h3>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-orange-800 dark:text-orange-200">
              <strong>File:</strong> {fileName}
            </p>
            <p className="text-orange-800 dark:text-orange-200">
              <strong>Expected format:</strong> <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded text-sm">{expectedType}</span>
            </p>
            <p className="text-orange-800 dark:text-orange-200">
              <strong>Detected content:</strong> <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded text-sm">{actualType}</span>
            </p>
          </div>
          
          <div className="bg-orange-100 dark:bg-orange-800/50 p-3 rounded-md mb-4">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-orange-700 dark:text-orange-300 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <p className="font-medium mb-1">What happened?</p>
                <p>
                  Your file has a <span className="font-mono">.{expectedType}</span> extension but contains {actualType} content. 
                  The analysis proceeded using the detected content format, but results may not be optimal.
                </p>
                <p className="mt-2 font-medium">Recommended actions:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Rename your file with the correct extension (.{actualType})</li>
                  <li>Convert the file to the expected {expectedType} format</li>
                  <li>Verify the file content matches the intended format</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Upload Corrected File</span>
              </button>
            )}
            
            <button
              onClick={onDismiss}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <span>Continue with Current Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionMismatchWarning;