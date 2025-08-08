'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Grid, List, Calendar, User,
  Database, Eye, Download, CheckCircle, BarChart3, FileText,
  Verified, ArrowRight, ChevronDown, X, Copy, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Uploader {
  address: string;
  name: string;
  reputation: number;
  verified: boolean;
}

interface Metadata {
  size: string;
  rows: number;
  columns: number;
  format: string;
  uploadDate: string;
  lastUpdated: string;
}

interface Analysis {
  qualityScore: number;
  anomalies: number;
  biasScore: number;
  completeness: number;
  verified: boolean;
  ipfsHash: string;
}

interface Stats {
  views: number;
  downloads: number;
  citations: number;
}

interface Dataset {
  id: number;
  title: string;
  description: string;
  category: string;
  uploader: Uploader;
  metadata: Metadata;
  analysis: Analysis;
  stats: Stats;
  tags: string[];
}

// Move datasets outside component to prevent re-creation
const mockDatasets: Dataset[] = [
  {
    id: 1,
    title: "2024 US Presidential Election Polling Data",
    description: "Comprehensive polling data from 50+ sources covering the 2024 presidential race with demographic breakdowns and methodology details.",
    category: "Politics",
    uploader: {
      address: "0x742d35cc...9877",
      name: "DataJournalist",
      reputation: 95,
      verified: true
    },
    metadata: {
      size: "2.3 MB",
      rows: 15420,
      columns: 12,
      format: "CSV",
      uploadDate: "2024-08-04T10:30:00Z",
      lastUpdated: "2024-08-04T10:30:00Z"
    },
    analysis: {
      qualityScore: 87,
      anomalies: 23,
      biasScore: 15,
      completeness: 94.2,
      verified: true,
      ipfsHash: "QmYwAPJzv5CZsnA8rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 1847,
      downloads: 234,
      citations: 12
    },
    tags: ["election", "polling", "demographics", "politics", "2024"]
  },
  {
    id: 2,
    title: "Global Temperature Anomalies 1880-2024",
    description: "NASA GISS temperature data showing global temperature anomalies with geographic distribution and confidence intervals.",
    category: "Climate",
    uploader: {
      address: "0x8765bb...4321",
      name: "ClimateResearcher",
      reputation: 88,
      verified: true
    },
    metadata: {
      size: "8.7 MB",
      rows: 89432,
      columns: 8,
      format: "JSON",
      uploadDate: "2024-08-03T15:20:00Z",
      lastUpdated: "2024-08-03T15:20:00Z"
    },
    analysis: {
      qualityScore: 96,
      anomalies: 5,
      biasScore: 8,
      completeness: 99.1,
      verified: true,
      ipfsHash: "QmZKH7v4CZsnB9rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 3241,
      downloads: 567,
      citations: 45
    },
    tags: ["climate", "temperature", "nasa", "global-warming", "environment"]
  },
  {
    id: 3,
    title: "COVID-19 Public Health Survey Responses",
    description: "Anonymous survey responses from 32,000+ participants covering health behaviors, vaccine attitudes, and economic impacts.",
    category: "Health",
    uploader: {
      address: "0x9876cd...1234",
      name: "PublicHealthOrg",
      reputation: 91,
      verified: true
    },
    metadata: {
      size: "4.1 MB",
      rows: 32156,
      columns: 28,
      format: "XLSX",
      uploadDate: "2024-08-02T09:15:00Z",
      lastUpdated: "2024-08-02T09:15:00Z"
    },
    analysis: {
      qualityScore: 83,
      anomalies: 67,
      biasScore: 22,
      completeness: 87.3,
      verified: true,
      ipfsHash: "QmPQJ8x5DZsnC0rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 892,
      downloads: 145,
      citations: 8
    },
    tags: ["covid-19", "health", "survey", "public-health", "pandemic"]
  },
  {
    id: 4,
    title: "Cryptocurrency Market Data Q2 2024",
    description: "High-frequency trading data for top 100 cryptocurrencies including price, volume, and market cap with technical indicators.",
    category: "Finance",
    uploader: {
      address: "0x1234ef...5678",
      name: "CryptoAnalyst",
      reputation: 72,
      verified: false
    },
    metadata: {
      size: "12.4 MB",
      rows: 125847,
      columns: 15,
      format: "CSV",
      uploadDate: "2024-08-01T14:45:00Z",
      lastUpdated: "2024-08-01T14:45:00Z"
    },
    analysis: {
      qualityScore: 78,
      anomalies: 142,
      biasScore: 18,
      completeness: 91.7,
      verified: false,
      ipfsHash: "QmRTY9z6EZsnD1rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 2156,
      downloads: 412,
      citations: 3
    },
    tags: ["cryptocurrency", "bitcoin", "trading", "market-data", "finance"]
  },
  {
    id: 5,
    title: "Urban Air Quality Index 2024",
    description: "Real-time air quality measurements from 200+ cities worldwide including PM2.5, NO2, and ozone levels with weather correlations.",
    category: "Environment",
    uploader: {
      address: "0x5678gh...9012",
      name: "EnvironmentalData",
      reputation: 94,
      verified: true
    },
    metadata: {
      size: "6.8 MB",
      rows: 78234,
      columns: 18,
      format: "CSV",
      uploadDate: "2024-07-31T11:20:00Z",
      lastUpdated: "2024-07-31T11:20:00Z"
    },
    analysis: {
      qualityScore: 92,
      anomalies: 34,
      biasScore: 12,
      completeness: 96.8,
      verified: true,
      ipfsHash: "QmWER5x7FZsnE2rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 1567,
      downloads: 289,
      citations: 18
    },
    tags: ["air-quality", "pollution", "urban", "environment", "health"]
  },
  {
    id: 6,
    title: "E-commerce Customer Behavior Analytics",
    description: "Anonymized customer journey data from major e-commerce platform including purchase patterns, cart abandonment, and demographics.",
    category: "Business",
    uploader: {
      address: "0x3456ij...7890",
      name: "EcommerceInsights",
      reputation: 79,
      verified: false
    },
    metadata: {
      size: "15.2 MB",
      rows: 246789,
      columns: 22,
      format: "JSON",
      uploadDate: "2024-07-30T16:30:00Z",
      lastUpdated: "2024-07-30T16:30:00Z"
    },
    analysis: {
      qualityScore: 85,
      anomalies: 89,
      biasScore: 25,
      completeness: 88.4,
      verified: false,
      ipfsHash: "QmQAZ6y8GZsnF3rdHaSmTRBPVLHHN5wYJsf9tR6ZGBQs"
    },
    stats: {
      views: 934,
      downloads: 167,
      citations: 5
    },
    tags: ["ecommerce", "customer-behavior", "analytics", "retail", "business"]
  }
];

const DatasetExplorer = () => {
  // Hydration fix states
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [filters, setFilters] = useState({
    minQuality: 0,
    maxQuality: 100,
    dateRange: 'all',
    verified: 'all',
    fileType: 'all'
  });

  // Wallet connection check
  const { isConnected } = useAccount();
  const router = useRouter();

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Check wallet connection after component mounts
  useEffect(() => {
    if (mounted && !isLoading && !isConnected) {
      toast.error('Please connect your wallet to use this feature', {
        duration: 4000,
        icon: '🔒',
      });
      router.push('/');
    }
  }, [mounted, isLoading, isConnected, router]);

  // Show loading state during hydration and initial load
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Dataset Explorer...</p>
        </div>
      </div>
    );
  }

  // Don't render if wallet is not connected
  if (!isConnected) {
    return null;
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: mockDatasets.length },
    { id: 'politics', name: 'Politics', count: 1 },
    { id: 'climate', name: 'Climate', count: 1 },
    { id: 'health', name: 'Health', count: 1 },
    { id: 'finance', name: 'Finance', count: 1 },
    { id: 'environment', name: 'Environment', count: 1 },
    { id: 'business', name: 'Business', count: 1 }
  ];

  // Filter and sort datasets
  const filteredDatasets = mockDatasets
    .filter(dataset => {
      if (searchQuery && !dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedCategory !== 'all' && dataset.category.toLowerCase() !== selectedCategory) {
        return false;
      }
      if (dataset.analysis.qualityScore < filters.minQuality || dataset.analysis.qualityScore > filters.maxQuality) {
        return false;
      }
      if (filters.verified !== 'all' && 
          ((filters.verified === 'verified' && !dataset.analysis.verified) ||
           (filters.verified === 'unverified' && dataset.analysis.verified))) {
        return false;
      }
      if (filters.fileType !== 'all' && dataset.metadata.format.toLowerCase() !== filters.fileType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return b.analysis.qualityScore - a.analysis.qualityScore;
        case 'popular':
          return b.stats.views - a.stats.views;
        case 'downloads':
          return b.stats.downloads - a.stats.downloads;
        default:
          return new Date(b.metadata.uploadDate).getTime() - new Date(a.metadata.uploadDate).getTime();
      }
    });

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const DatasetCard = ({ dataset }: { dataset: Dataset }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {dataset.category}
            </span>
            {dataset.analysis.verified && (
              <Verified className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getQualityColor(dataset.analysis.qualityScore)}`}>
            {dataset.analysis.qualityScore}%
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {dataset.title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {dataset.description}
        </p>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3" />
            <span>{formatNumber(dataset.metadata.rows)} rows</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{dataset.metadata.format}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(dataset.stats.views)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{formatNumber(dataset.stats.downloads)}</span>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{dataset.analysis.anomalies}</div>
            <div className="text-xs text-gray-500">Anomalies</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{dataset.analysis.biasScore}%</div>
            <div className="text-xs text-gray-500">Bias</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{dataset.analysis.completeness}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-900">{dataset.uploader.name}</div>
            <div className="text-xs text-gray-500">{formatDate(dataset.metadata.uploadDate)}</div>
          </div>
        </div>
        
        <button 
          onClick={() => setSelectedDataset(dataset)}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const DatasetListItem = ({ dataset }: { dataset: Dataset }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{dataset.title}</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {dataset.category}
            </span>
            {dataset.analysis.verified && (
              <Verified className="w-4 h-4 text-green-600" />
            )}
            <div className={`px-2 py-1 rounded text-xs font-medium ${getQualityColor(dataset.analysis.qualityScore)}`}>
              {dataset.analysis.qualityScore}%
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {dataset.description}
          </p>

          <div className="flex items-center space-x-6 text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>{formatNumber(dataset.metadata.rows)} rows • {dataset.metadata.columns} cols</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{dataset.metadata.format} • {dataset.metadata.size}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{dataset.uploader.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(dataset.metadata.uploadDate)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <span>{formatNumber(dataset.stats.views)} views</span>
            <span>{formatNumber(dataset.stats.downloads)} downloads</span>
            <span>{dataset.stats.citations} citations</span>
            <span>{dataset.analysis.anomalies} anomalies</span>
            <span>{dataset.analysis.biasScore}% bias</span>
          </div>
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          <button 
            onClick={() => setSelectedDataset(dataset)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Analysis</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dataset Explorer</h1>
                  <p className="text-sm text-gray-500">Browse and discover verified datasets</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Verified className="w-4 h-4 text-green-600" />
                  <span>Blockchain Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Toggle and Sort */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="quality">Highest Quality</option>
                    <option value="popular">Most Popular</option>
                    <option value="downloads">Most Downloaded</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-colors ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.name}</span>
                            <span className="text-xs">{category.count}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Score Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Score</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Minimum</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.minQuality}
                          onChange={(e) => setFilters({...filters, minQuality: parseInt(e.target.value)})}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-600">{filters.minQuality}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Verification</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'all', name: 'All Datasets' },
                        { id: 'verified', name: 'Verified Only' },
                        { id: 'unverified', name: 'Unverified' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setFilters({...filters, verified: option.id})}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.verified === option.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">File Type</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'all', name: 'All Types' },
                        { id: 'csv', name: 'CSV' },
                        { id: 'json', name: 'JSON' },
                        { id: 'xlsx', name: 'Excel' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setFilters({...filters, fileType: option.id})}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.fileType === option.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="flex-1">
              {filteredDatasets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No datasets found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredDatasets.map(dataset => (
                    viewMode === 'grid' 
                      ? <DatasetCard key={dataset.id} dataset={dataset} />
                      : <DatasetListItem key={dataset.id} dataset={dataset} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dataset Detail Modal */}
        {selectedDataset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              <div className="max-h-[80vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDataset.title}</h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded">
                          {selectedDataset.category}
                        </span>
                        {selectedDataset.analysis.verified && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Verified className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        )}
                        <div className={`px-3 py-1 rounded text-sm font-medium ${getQualityColor(selectedDataset.analysis.qualityScore)}`}>
                          Quality: {selectedDataset.analysis.qualityScore}%
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedDataset(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{selectedDataset.description}</p>
                  </div>

                  {/* Dataset Information - IMPROVED TEXT SIZES */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Dataset Information</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">File Size:</span>
                          <span className="font-bold text-gray-900 text-base">{selectedDataset.metadata.size}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Rows:</span>
                          <span className="font-bold text-gray-900 text-base">{formatNumber(selectedDataset.metadata.rows)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Columns:</span>
                          <span className="font-bold text-gray-900 text-base">{selectedDataset.metadata.columns}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Format:</span>
                          <span className="font-bold text-gray-900 text-base">{selectedDataset.metadata.format}</span>
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Views:</span>
                          <span className="font-bold text-gray-900 text-base">{formatNumber(selectedDataset.stats.views)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Downloads:</span>
                          <span className="font-bold text-gray-900 text-base">{formatNumber(selectedDataset.stats.downloads)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Citations:</span>
                          <span className="font-bold text-gray-900 text-base">{selectedDataset.stats.citations}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-700 text-base font-medium">Upload Date:</span>
                          <span className="font-bold text-gray-900 text-base">{formatDate(selectedDataset.metadata.uploadDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Results - IMPROVED TEXT SIZES */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">AI Analysis Results</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                        <div className="text-4xl font-black text-gray-900 mb-2">{selectedDataset.analysis.qualityScore}%</div>
                        <div className="text-base font-semibold text-gray-700">Quality Score</div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                        <div className="text-4xl font-black text-gray-900 mb-2">{selectedDataset.analysis.anomalies}</div>
                        <div className="text-base font-semibold text-gray-700">Anomalies</div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                        <div className="text-4xl font-black text-gray-900 mb-2">{selectedDataset.analysis.biasScore}%</div>
                        <div className="text-base font-semibold text-gray-700">Bias Score</div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                        <div className="text-4xl font-black text-gray-900 mb-2">{selectedDataset.analysis.completeness}%</div>
                        <div className="text-base font-semibold text-gray-700">Completeness</div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Verification */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Blockchain Verification</h3>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-900 text-lg">Analysis Verified on Filecoin</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-base text-green-700 font-medium">IPFS Hash:</span>
                          <code className="text-sm bg-white px-3 py-2 rounded font-mono flex-1">
                            {selectedDataset.analysis.ipfsHash}
                          </code>
                          <button className="text-green-600 hover:text-green-700 p-1">
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedDataset.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-base font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Uploader Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Uploaded By</h3>
                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 text-lg">{selectedDataset.uploader.name}</span>
                          {selectedDataset.uploader.verified && (
                            <Verified className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-base text-gray-600 mb-1">
                          Reputation: {selectedDataset.uploader.reputation}/100
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {selectedDataset.uploader.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="text-base text-gray-600">
                      Last updated {formatDate(selectedDataset.metadata.lastUpdated)}
                    </div>
                    <div className="flex space-x-4">
                      <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 transition-colors flex items-center space-x-2 text-base font-medium">
                        <Download className="w-5 h-5" />
                        <span>Download Dataset</span>
                      </button>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-base font-medium">
                        <BarChart3 className="w-5 h-5" />
                        <span>View Full Analysis</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default DatasetExplorer;