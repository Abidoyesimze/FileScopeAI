'use client'
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { 
  Upload, FileText, Database, CheckCircle, AlertCircle, 
  X, ArrowRight, BarChart3, Shield, Zap, 
  FileSpreadsheet, Code, Info, Loader,
  Target, Award, Bell, Download, Copy, Verified, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FilePreview {
  headers: string[];
  sampleRows: string[][];
  totalLines: number;
}

interface SupportedType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}

interface SampleDataset {
  name: string;
  size: string;
  rows: string;
  description: string;
  type: string;
}

interface AnalysisResult {
  metadata: {
    fileName: string;
    uploadDate: string;
    fileSize: string;
    rows: number;
    columns: number;
    processingTime: string;
    ipfsHash: string;
    contractAddress: string;
    blockNumber: string;
  };
  qualityScore: {
    overall: number;
    completeness: number;
    consistency: number;
    accuracy: number;
    validity: number;
  };
  anomalies: {
    total: number;
    high: number;
    medium: number;
    low: number;
    details: Array<{
      column: string;
      type: string;
      count: number;
      severity: string;
      description: string;
      recommendation: string;
    }>;
  };
  biasMetrics: {
    overall: number;
    geographic: { score: number; status: string; description: string };
    demographic: { score: number; status: string; description: string };
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
  }>;
}

const FileScopeApp = () => {
  // Navigation state
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Results states  
  const [copiedHash, setCopiedHash] = useState(false);

  // Wallet connection check
  const { isConnected } = useAccount();
  const router = useRouter();

  // Check wallet connection on mount
  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet to use this feature', {
        duration: 4000,
        icon: '🔒',
      });
      router.push('/');
    }
  }, [isConnected, router]);

  // Supported file types - moved to top level
  const supportedTypes: Record<string, SupportedType> = useMemo(() => ({
    'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'green' },
    'application/json': { icon: Code, label: 'JSON', color: 'blue' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, label: 'XLSX', color: 'orange' }
  }), []);

  // Sample datasets - moved to top level
  const sampleDatasets: SampleDataset[] = useMemo(() => [
    {
      name: "Election Polling Data 2024",
      size: "2.3 MB",
      rows: "15,420",
      description: "Comprehensive polling data from multiple sources",
      type: "CSV"
    },
    {
      name: "Climate Temperature Records",
      size: "8.7 MB", 
      rows: "89,432",
      description: "Global temperature data over the past 50 years",
      type: "JSON"
    }
  ], []);

  // Mock comprehensive analysis results - moved to top level
  const mockAnalysisResults: AnalysisResult = useMemo(() => ({
    metadata: {
      fileName: "election_polling_data_2024.csv",
      uploadDate: "2024-08-04T10:30:00Z",
      fileSize: "2.3 MB",
      rows: 15420,
      columns: 12,
      processingTime: "2.3 minutes",
      ipfsHash: "QmYwAPJzv5CZsnA8rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs",
      contractAddress: "0x742d35cc6639c0532...9877",
      blockNumber: "2,341,567"
    },
    qualityScore: {
      overall: 87,
      completeness: 94.2,
      consistency: 89.5,
      accuracy: 85.3,
      validity: 91.7
    },
    anomalies: {
      total: 23,
      high: 3,
      medium: 12,
      low: 8,
      details: [
        {
          column: "voter_age", 
          type: "Statistical Outlier", 
          count: 8, 
          severity: "high",
          description: "Ages above 150 detected",
          recommendation: "Review data entry process"
        },
        {
          column: "poll_result", 
          type: "Impossible Values", 
          count: 12, 
          severity: "medium",
          description: "Percentages exceeding 100%",
          recommendation: "Validate calculation methods"
        }
      ]
    },
    biasMetrics: {
      overall: 0.15,
      geographic: { score: 0.22, status: "moderate", description: "Urban areas over-represented" },
      demographic: { score: 0.08, status: "low", description: "Age distribution fairly balanced" }
    },
    insights: [
      {
        type: "critical",
        title: "Data Quality Issue",
        description: "3 high-severity anomalies require immediate attention",
        action: "Review highlighted data points before publication"
      },
      {
        type: "success",
        title: "High Completeness Score", 
        description: "94.2% data completeness exceeds industry standard",
        action: "Dataset ready for most analytical use cases"
      }
    ]
  }), []);

  // Navigation Functions - moved before early return
  const navigateToStep = useCallback((step: 'upload' | 'preview' | 'processing' | 'results') => {
    setCurrentStep(step);
    if (step === 'upload') {
      resetUpload();
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadedFile(null);
    setFilePreview(null);
    setError(null);
    setAnalysisResults(null);
  }, []);

  // File Upload Functions - moved before early return
  const generatePreview = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let preview: FilePreview = { headers: [], sampleRows: [], totalLines: 0 };
      
      if (file.type === 'text/csv') {
        const lines = content.split('\n');
        preview = {
          headers: lines[0] ? lines[0].split(',').map((h: string) => h.trim()) : [],
          sampleRows: lines.slice(1, 6).map((row: string) => row.split(',')),
          totalLines: lines.length - 1
        };
      }
      
      setFilePreview(preview);
    };
    
    reader.readAsText(file);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    setError(null);
    
    if (!supportedTypes[file.type]) {
      const errorMsg = `Unsupported file type: ${file.type}. Please upload CSV, JSON, or Excel files.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      const errorMsg = 'File size too large. Please upload files smaller than 100MB.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setUploadedFile(file);
    generatePreview(file);
    setCurrentStep('preview');
    toast.success('File uploaded successfully! Review your data below.');
  }, [supportedTypes, generatePreview]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleSampleDataset = useCallback((dataset: SampleDataset) => {
    // Mock file object for sample dataset
    const mockFile = new File(
      [new Blob(['mock data'])], 
      dataset.name.toLowerCase().replace(/\s+/g, '_') + '.csv',
      { type: 'text/csv' }
    );
    setUploadedFile(mockFile);
    
    // Mock preview data
    setFilePreview({
      headers: ['poll_date', 'candidate', 'party', 'percentage', 'sample_size', 'location'],
      sampleRows: [
        ['2024-07-15', 'John Smith', 'Democratic', '42.3', '1200', 'California'],
        ['2024-07-15', 'Jane Doe', 'Republican', '38.7', '1200', 'California'],
        ['2024-07-16', 'John Smith', 'Democratic', '41.8', '950', 'Texas'],
        ['2024-07-16', 'Jane Doe', 'Republican', '39.2', '950', 'Texas']
      ],
      totalLines: parseInt(dataset.rows.replace(',', ''))
    });
    
    setCurrentStep('preview');
    toast.success(`Using sample dataset: ${dataset.name}`);
  }, []);

  const startAnalysis = useCallback(() => {
    setCurrentStep('processing');
    
    toast.loading('Starting AI analysis...', { id: 'analysis' });
    
    // Simulate AI processing
    setTimeout(() => {
      setAnalysisResults(mockAnalysisResults);
      setCurrentStep('results'); // Navigate to results!
      toast.success('Analysis completed successfully!', { id: 'analysis' });
    }, 3000);
  }, [mockAnalysisResults]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Don't render if wallet is not connected - moved after all hooks
  if (!isConnected) {
    return null;
  }

  // Render different steps based on current state
  const renderContent = () => {
    if (currentStep === 'processing') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analyzing Your Dataset</h1>
              <p className="text-gray-600 dark:text-gray-300">Our AI is processing your data with advanced algorithms</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                  <BarChart3 className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing {uploadedFile?.name}</h2>
                <p className="text-gray-600 mb-8">This usually takes 1-3 minutes depending on dataset size</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">Data Upload Complete</div>
                    <div className="text-sm text-green-700">File successfully stored on IPFS</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Loader className="w-6 h-6 text-blue-600 flex-shrink-0 animate-spin" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">Running AI Analysis</div>
                    <div className="text-sm text-blue-700">Detecting anomalies, bias, and quality issues...</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">Generating Visualizations</div>
                    <div className="text-sm text-gray-500">Creating charts and summary reports</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">Blockchain Verification</div>
                    <div className="text-sm text-gray-500">Storing results on Filecoin with smart contract</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 'results' && analysisResults) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Results Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => navigateToStep('upload')}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{uploadedFile?.name}</h1>
                    <p className="text-sm text-gray-500">Analysis completed successfully</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Verified className="w-5 h-5 text-green-600" />
                    <span>Blockchain Verified</span>
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(analysisResults.qualityScore.overall)}`}>
                    {analysisResults.qualityScore.overall}%
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quality Score</h3>
                <p className="text-gray-600 text-sm">Overall dataset quality</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200">
                    {analysisResults.anomalies.total}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Anomalies</h3>
                <p className="text-gray-600 text-sm">{analysisResults.anomalies.high} require attention</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(Math.round((1 - analysisResults.biasMetrics.overall) * 100))}`}>
                    {Math.round((1 - analysisResults.biasMetrics.overall) * 100)}%
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Bias Score</h3>
                <p className="text-gray-600 text-sm">Lower is better</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600 border border-green-200">
                    {analysisResults.metadata.rows.toLocaleString()}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Dataset Size</h3>
                <p className="text-gray-600 text-sm">{analysisResults.metadata.columns} columns</p>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h3>
              <div className="grid gap-4">
                {analysisResults.insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm mb-2">{insight.description}</p>
                          <p className="text-sm font-medium">Action: {insight.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Blockchain Verification</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Analysis Verified</h4>
                    <p className="text-green-700 text-sm">Permanently stored on Filecoin with cryptographic proof</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">IPFS Hash</h4>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm bg-white p-2 rounded font-mono">
                      {analysisResults.metadata.ipfsHash}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(analysisResults.metadata.ipfsHash)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Smart Contract</h4>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm bg-white p-2 rounded font-mono">
                      {analysisResults.metadata.contractAddress}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(analysisResults.metadata.contractAddress)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready for More?</h3>
                  <p className="text-gray-600">Analyze another dataset or explore public analyses</p>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => navigateToStep('upload')}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Analyze Another
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                    Explore Datasets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 'preview') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Review & Analyze</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Review your data preview and start the AI analysis process
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* File Header */}
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      {uploadedFile?.type && supportedTypes[uploadedFile.type] && (() => {
                        const IconComponent = supportedTypes[uploadedFile.type].icon;
                        return <IconComponent className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{uploadedFile?.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(uploadedFile?.size || 0)}</span>
                        <span>•</span>
                        <span>{filePreview?.totalLines?.toLocaleString()} rows</span>
                        <span>•</span>
                        <span>{filePreview?.headers?.length} columns</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigateToStep('upload')} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Data Preview */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Data Preview</h4>
                {filePreview && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {filePreview.headers.slice(0, 6).map((header, index) => (
                            <th key={index} className="px-4 py-3 text-left font-medium text-gray-900 border-b">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filePreview.sampleRows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-gray-100">
                            {row.slice(0, 6).map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3 text-gray-700">
                                {String(cell).length > 30 ? String(cell).substring(0, 30) + '...' : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Analysis Options */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">AI Analysis Features</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Anomaly Detection</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Bias Assessment</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Quality Scoring</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>Analysis will be stored permanently on Filecoin</span>
                  </div>
                  <button 
                    onClick={startAnalysis}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium flex items-center space-x-2"
                  >
                    <span>Start AI Analysis</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default: Upload step
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Upload Your Dataset</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upload any CSV, JSON, or Excel file to get instant AI-powered analysis with complete transparency on Filecoin
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Upload Area */}
            <div>
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {dragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  or <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                  >
                    browse files
                  </button>
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />

                <div className="flex justify-center space-x-6 mb-8">
                  {Object.entries(supportedTypes).map(([type, config]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <config.icon className={`w-5 h-5 text-${config.color}-600`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Maximum file size: 100MB
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>

            {/* Sample Datasets */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Or try a sample dataset</h3>
              <div className="space-y-4">
                {sampleDatasets.map((dataset, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{dataset.name}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{dataset.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{dataset.size}</span>
                          <span>•</span>
                          <span>{dataset.rows} rows</span>
                          <span>•</span>
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{dataset.type}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSampleDataset(dataset)}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Use Sample
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper functions for results
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getInsightIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = { 
      critical: AlertTriangle, 
      warning: Bell, 
      success: CheckCircle, 
      info: Info 
    };
    return icons[type];
  };

  const getInsightColor = (type: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      success: 'text-green-600 bg-green-50 border-green-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[type];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    toast.success('Hash copied to clipboard!');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <>
      {renderContent()}
      
      {/* Copy notification */}
      {copiedHash && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Hash copied to clipboard!
        </div>
      )}
    </>
  );
};

export default FileScopeApp;