'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Download, CheckCircle, 
  BarChart3, Shield, Database, 
  FileText, AlertTriangle, Zap, Eye, Hash, ExternalLink, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
  qualityScore: number;
  anomalies: number;
  biasScore: number;
  completeness: number;
  accuracy: number;
  totalRows: number;
  totalColumns: number;
  processingTime: string;
  blockchainHash: string;
  ipfsHash: string;
  timestamp: string;
}

const ResultsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

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

  // Don't render if wallet is not connected
  if (!isConnected) {
    return null;
  }

  // Mock analysis results - in real app, this would come from API
  const results: AnalysisResult = {
    qualityScore: 87,
    anomalies: 23,
    biasScore: 12,
    completeness: 94,
    accuracy: 96,
    totalRows: 15420,
    totalColumns: 8,
    processingTime: '2m 34s',
    blockchainHash: '0x7a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c2d3e4f5a6b7c8d9e0f1a2b',
    ipfsHash: 'QmX7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5',
    timestamp: '2025-01-15T14:30:25Z'
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analysis Complete
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your dataset has been analyzed and verified on the blockchain. 
            Here are the comprehensive results and insights.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getQualityBg(results.qualityScore)}`}>
                <BarChart3 className={`w-6 h-6 ${getQualityColor(results.qualityScore)}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {results.qualityScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {results.anomalies}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Anomalies Found</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {results.biasScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bias Score</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {results.processingTime}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Processing Time</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'details', label: 'Detailed Analysis', icon: BarChart3 },
                { id: 'blockchain', label: 'Blockchain Verification', icon: Hash },
                { id: 'export', label: 'Export & Share', icon: Download }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quality Assessment */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quality Assessment</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">Overall Quality</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${results.qualityScore >= 90 ? 'bg-green-500' : results.qualityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{width: `${results.qualityScore}%`}}
                            ></div>
                          </div>
                          <span className={`font-bold ${getQualityColor(results.qualityScore)}`}>
                            {results.qualityScore}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">Completeness</span>
                        <span className="font-bold text-green-600">{results.completeness}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">Accuracy</span>
                        <span className="font-bold text-green-600">{results.accuracy}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Dataset Summary</h4>
                        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                          <div>• {results.totalRows.toLocaleString()} total rows</div>
                          <div>• {results.totalColumns} columns</div>
                          <div>• {results.anomalies} anomalies detected</div>
                          <div>• {results.biasScore}% bias detected</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Recommendations</h4>
                        <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                          <div>• Review {results.anomalies} flagged anomalies</div>
                          <div>• Consider bias mitigation strategies</div>
                          <div>• Dataset quality is above industry average</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Analysis</h3>
                
                {/* Anomaly Details */}
                <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
                  <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Anomaly Detection Results
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">{results.anomalies}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Anomalies</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">3</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">20</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minor Issues</div>
                    </div>
                  </div>
                </div>

                {/* Bias Analysis */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Bias Assessment
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 dark:text-blue-200">Overall Bias Score</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">{results.biasScore}%</span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${results.biasScore}%`}}
                      ></div>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {results.biasScore < 20 ? 'Low bias detected' : results.biasScore < 50 ? 'Moderate bias detected' : 'High bias detected'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blockchain' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Blockchain Verification</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">Verification Status</h4>
                      </div>
                      <p className="text-green-800 dark:text-green-200 mb-4">
                        Your analysis has been successfully verified and stored on the Filecoin blockchain.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">Block Number:</span>
                          <span className="font-mono text-green-900 dark:text-green-100">#2,341,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">Timestamp:</span>
                          <span className="font-mono text-green-900 dark:text-green-100">{formatDate(results.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">IPFS Hash</h4>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                        {results.ipfsHash}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Hash</h4>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                        {results.blockchainHash}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Verification Links</h4>
                      <div className="space-y-3">
                        <a 
                          href="#" 
                          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View on Filecoin Explorer</span>
                        </a>
                        <a 
                          href="#" 
                          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View on IPFS Gateway</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Export & Share</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Download Reports</h4>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-blue-900 dark:text-blue-100">Full Analysis Report (PDF)</span>
                          </div>
                          <Download className="w-4 h-4 text-blue-600" />
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            <span className="text-green-900 dark:text-green-100">Data Quality Summary (CSV)</span>
                          </div>
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Hash className="w-5 h-5 text-purple-600" />
                            <span className="text-purple-900 dark:text-purple-100">Blockchain Certificate (JSON)</span>
                          </div>
                          <Download className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Results</h4>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white">Generate Public Link</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white">View Public Page</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">API Access</h4>
                      <p className="text-blue-800 dark:text-blue-200 mb-4 text-sm">
                        Access your analysis results programmatically via our API.
                      </p>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Get API Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/upload">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Analyze Another Dataset</span>
            </button>
          </Link>
          
          <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share Results</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 