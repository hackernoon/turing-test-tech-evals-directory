import React, { useState, useEffect, useMemo } from 'react';
import { Search, Menu, X, Filter, ExternalLink, Clock, Users, Brain, Eye, Music, MessageCircle, Gamepad2, FileText, TrendingUp, Star, ChevronDown, ArrowRight } from 'lucide-react';

// Helper functions for data generation and scoring
const getDescriptionForCategory = (category) => {
  const descriptions = {
    'Chat': 'Participate in a live chat and try to determine which participant is human and which is AI.',
    'Image-Face': 'Choose which face is a real human photo versus an AI-generated face.',
    'Image-Art': 'Determine whether the artwork was created by a human or by an AI.',
    'Text-Poetry/Joke': 'Read a poem or joke and decide whether it was written by a human or an AI.',
    'Text-Article': 'Read a short article and decide whether it was written by a human or an AI.',
    'Audio': 'Listen to audio clips and determine which ones are real human speech and which are AI-generated voice clones.',
    'Reasoning': 'Resolve ambiguous pronouns using commonsense reasoning to choose the correct antecedent.',
    'Statement': 'Examine a statement and decide whether it was written by a human or an AI.',
    'Video': 'Watch video clips and identify which are real versus AI-generated deepfakes.'
  };
  return descriptions[category] || 'Test your ability to distinguish between human and AI-generated content.';
};

const getInputTypeForCategory = (category) => {
  if (category.includes('Image') || category.includes('Art')) return 'image';
  if (category === 'Audio') return 'audio';
  if (category === 'Video') return 'video';
  return 'text';
};

const getDifficultyFromCategory = (category) => {
  if (category === 'Reasoning') return 'Hard';
  if (category.includes('Image-Face')) return 'Hard';
  if (category === 'Audio') return 'Medium';
  if (category === 'Chat') return 'Easy';
  return 'Medium';
};

const generateTagsFromCategory = (category) => {
  const tagMap = {
    'Chat': ['GAME', 'SOCIAL', 'LLM'],
    'Image-Face': ['VISUAL', 'DEEPFAKE', 'GAN'],
    'Image-Art': ['VISUAL', 'ART', 'GAN'],
    'Text-Poetry/Joke': ['TEXT-GENERATION', 'POETRY', 'LLM'],
    'Text-Article': ['TEXT-GENERATION', 'MEDIA', 'LLM'],
    'Audio': ['AUDIO', 'DEEPFAKE', 'VOICE'],
    'Reasoning': ['TEXT-GENERATION', 'RESEARCH', 'LLM'],
    'Statement': ['TEXT-GENERATION', 'RESEARCH', 'LLM'],
    'Video': ['VISUAL', 'DEEPFAKE', 'VIDEO']
  };
  return tagMap[category] || ['TEXT-GENERATION', 'LLM'];
};

const getTypeFromCategory = (category) => {
  if (category === 'Audio') return 'Audio';
  if (category.includes('Image') || category === 'Video') return 'Visual';
  if (category === 'Chat') return 'Social';
  if (category === 'Reasoning') return 'Classic';
  return 'Modern LLM';
};

// Generate trustworthiness score based on multiple factors
const calculateTrustworthiness = (test) => {
  let score = 0;
  
  // Source Authority (0-25 points)
  if (test.source_type === 'edu' || test.platform?.includes('edu') || test.platform?.includes('berkeley')) {
    score += 25; // Academic institution
  } else if (test.platform?.includes('google') || test.platform?.includes('openai') || test.platform?.includes('microsoft')) {
    score += 20; // Tech company
  } else if (test.source_type === 'research_center' || test.platform?.includes('wikipedia')) {
    score += 18; // Research organization
  } else if (test.source_type === 'github' || test.source_type === 'gitlab' || test.source_type === 'huggingface') {
    score += 15; // Open source
  } else {
    score += 10; // Individual/other
  }
  
  // Methodology Transparency (0-25 points)
  if (test.description?.length > 150) {
    score += 25; // Detailed methodology
  } else if (test.description?.length > 100) {
    score += 15; // Basic methodology
  } else if (test.description?.length > 50) {
    score += 10; // Minimal description
  } else {
    score += 5; // Vague description
  }
  
  // Scale & Validation (0-25 points) - inferred from platform reputation
  if (test.platform?.includes('wikipedia') || test.platform?.includes('berkeley') || test.source_type === 'edu') {
    score += 25; // Large, validated datasets
  } else if (test.platform?.includes('github') || test.platform?.includes('huggingface')) {
    score += 20; // Medium datasets
  } else if (test.source_type === 'quiz_game' || test.platform?.includes('game')) {
    score += 10; // Small datasets
  } else {
    score += 15; // Unknown but assumed medium
  }
  
  // Technical Rigor (0-25 points)
  if (test.source_type === 'edu' || test.platform?.includes('berkeley')) {
    score += 25; // Peer reviewed
  } else if (test.source_type === 'github' || test.source_type === 'huggingface') {
    score += 20; // Technical documentation
  } else if (test.format === 'Analysis' || test.category === 'Reasoning') {
    score += 15; // Basic technical info
  } else {
    score += 10; // Minimal technical details
  }
  
  return Math.min(score, 100); // Cap at 100
};

// Convert score to letter grade
const getGradeFromScore = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  return 'C-';
};

// Generate comprehensive mock data based on CSV structure
const generateMockData = () => {
  const mockTests = [];
  const categories = ['Chat', 'Image-Face', 'Image-Art', 'Text-Poetry/Joke', 'Text-Article', 'Audio', 'Reasoning', 'Statement', 'Video'];
  const platforms = ['www.humanornot.ai', 'whichfaceisreal.com', 'humanoraigame.com', 'turingtest.live', 'ai-art-turing-test.com', 'real-or-ai-game.com'];
  const testNames = [
    'Human or Not?', 'Which Face is Real?', 'AI or Human?', 'The Fake News Challenge', 'Turing Test Hub',
    'Audio Deepfake Detection', 'Real vs AI Art', 'ChatBot Challenge', 'Voice Clone Test', 'Poetry Detector',
    'Article AI Detector', 'Computational Reasoning', 'Visual Turing Test', 'Music Generation Test', 'Code AI Detector'
  ];
  
  // Generate 1601 tests
  for (let i = 1; i <= 1601; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const baseName = testNames[Math.floor(Math.random() * testNames.length)];
    
    const test = {
      id: i,
      test_name: Math.random() > 0.7 ? `${baseName} #${i}` : baseName,
      category: category,
      description: getDescriptionForCategory(category),
      format: Math.random() > 0.5 ? 'Multiple choice' : 'Conversation',
      input_type: getInputTypeForCategory(category),
      duration: ['2 min', 'Quick', '1 min', '3 min', '5 min'][Math.floor(Math.random() * 5)],
      source_url: platforms[Math.floor(Math.random() * platforms.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      free: 'Yes',
      source_type: ['other', 'quiz_game', 'edu', 'github'][Math.floor(Math.random() * 4)],
      trending: Math.random() > 0.95,
      difficulty: getDifficultyFromCategory(category),
      tags: generateTagsFromCategory(category),
      platformType: 'Web',
      accessModel: 'Free',
      creatorType: 'Individual',
      typeCategory: getTypeFromCategory(category),
      year: ['2024', '2023', '2022', '2021'][Math.floor(Math.random() * 4)]
    };
    
    // Calculate trustworthiness scores
    test.trustworthiness = calculateTrustworthiness(test);
    test.grade = getGradeFromScore(test.trustworthiness);
    
    mockTests.push(test);
  }
  
  return mockTests;
};

// Bold primary colors inspired by Mondrian/Miro/HuggingFace
const colors = {
  yellow: '#FFD700',
  blue: '#4285F4', 
  red: '#EA4335',
  green: '#34A853',
  orange: '#FF6B35',
  purple: '#9C27B0',
  dark: '#1a1a1a',
  light: '#ffffff',
  gray: '#6B7280'
};

const cardColors = [
  colors.yellow,
  colors.blue,
  colors.red,
  colors.green,
  colors.orange,
  colors.purple
];

// Get color for grade with proper academic color scheme
const getGradeColor = (grade) => {
  if (grade === 'A+') return '#22c55e'; // Green
  if (grade === 'A') return '#16a34a';   // Dark Green
  if (grade === 'A-') return '#15803d';  // Darker Green
  if (grade === 'B+') return '#3b82f6'; // Blue
  if (grade === 'B') return '#2563eb';   // Dark Blue
  if (grade === 'B-') return '#1d4ed8'; // Darker Blue
  if (grade === 'C+') return '#f59e0b'; // Amber
  if (grade === 'C') return '#d97706';   // Dark Amber
  return '#dc2626'; // Red for C- and below
};

function TuringTestApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedAccess, setSelectedAccess] = useState('All');
  const [selectedCreator, setSelectedCreator] = useState('All');
  const [showTrending, setShowTrending] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testsData, setTestsData] = useState(generateMockData());
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(100);
  const [selectedTrust, setSelectedTrust] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedInput, setSelectedInput] = useState('All');

  // Filter options
  const typeOptions = ['All', 'Audio', 'Classic', 'Game', 'Modern LLM', 'Social', 'Visual'];
  const difficultyOptions = ['All', 'Easy', 'Hard', 'Historical', 'Medium'];
  const platformOptions = ['All', 'API', 'Desktop', 'Mobile', 'Research Paper', 'Web'];
  const accessOptions = ['All', 'Academic', 'Free', 'Freemium', 'Open Source', 'Paid'];
  const creatorOptions = ['All', 'Academic', 'Corporate', 'Individual', 'Open Source'];

  const filteredTests = useMemo(() => {
    if (!testsData.length) return [];
    
    const filtered = testsData.filter(test => {
      const matchesSearch = test.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'All' || test.typeCategory === selectedType;
      const matchesDifficulty = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
      const matchesPlatform = selectedPlatform === 'All' || test.platformType === selectedPlatform;
      const matchesAccess = selectedAccess === 'All' || test.accessModel === selectedAccess;
      const matchesCreator = selectedCreator === 'All' || test.creatorType === selectedCreator;
      const matchesTrending = !showTrending || test.trending;
      
      // New filters
      const matchesTrust = selectedTrust === 'All' || 
                          (selectedTrust === 'A' && test.grade?.startsWith('A')) ||
                          (selectedTrust === 'B' && test.grade?.startsWith('B')) ||
                          (selectedTrust === 'C' && (test.grade?.startsWith('C') || test.grade === 'D' || test.grade === 'F'));
      const matchesYear = selectedYear === 'All' || test.year === selectedYear;
      const matchesFormat = selectedFormat === 'All' || test.format === selectedFormat;
      const matchesInput = selectedInput === 'All' || test.input_type === selectedInput;
      
      return matchesSearch && matchesType && matchesDifficulty && matchesPlatform && 
             matchesAccess && matchesCreator && matchesTrending && matchesTrust && 
             matchesYear && matchesFormat && matchesInput;
    });
    
    return filtered;
  }, [searchTerm, selectedType, selectedDifficulty, selectedPlatform, selectedAccess, 
      selectedCreator, showTrending, testsData, selectedTrust, selectedYear, selectedFormat, selectedInput]);

  // Paginated tests for display
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * testsPerPage;
    const endIndex = startIndex + testsPerPage;
    return filteredTests.slice(startIndex, endIndex);
  }, [filteredTests, currentPage, testsPerPage]);

  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const trendingTests = testsData.filter(test => test.trending).slice(0, 13);

  // Function to apply filter and go to home
  const applyFilterAndGoHome = (filterType, filterValue) => {
    // Reset all filters first
    setSelectedType('All');
    setSelectedDifficulty('All');
    setSelectedPlatform('All');
    setSelectedAccess('All');
    setSelectedCreator('All');
    setSelectedTrust('All');
    setSelectedYear('All');
    setSelectedFormat('All');
    setSelectedInput('All');
    
    // Apply the specific filter
    switch (filterType) {
      case 'category':
        setSelectedType(filterValue);
        break;
      case 'difficulty':
        setSelectedDifficulty(filterValue);
        break;
      case 'duration':
        // Map duration to a general filter - not directly filterable
        break;
      case 'access':
        setSelectedAccess(filterValue);
        break;
      case 'trust':
        setSelectedTrust(filterValue);
        break;
      default:
        break;
    }
    
    // Navigate to home
    setCurrentView('home');
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedDifficulty, selectedPlatform, selectedAccess, 
      selectedCreator, showTrending, selectedTrust, selectedYear, selectedFormat, selectedInput]);

  // Simple filter component using HTML select
  const FilterSelect = ({ label, value, options, onChange, color = 'bg-white' }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border-2 border-black rounded-none font-mono font-bold text-sm ${color} text-black appearance-none cursor-pointer focus:outline-none focus:ring-0`}
      >
        <option value="All">All {label}</option>
        {options.filter(option => option !== 'All').map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
    </div>
  );

  const TestCard = ({ test, index }) => {
    const cardColor = cardColors[index % cardColors.length];
    const isLightColor = cardColor === colors.yellow;
    const textColor = isLightColor ? colors.dark : colors.light;
    const gradeColor = getGradeColor(test.grade);
    
    // Create a cleaner test name
    const displayName = test.test_name?.replace(/#\d+$/, '') || 'Turing Test';
    const cleanName = displayName.length > 40 ? displayName.substring(0, 37) + '...' : displayName;
    
    // Extract domain from source_url
    const getDomainName = (url) => {
      if (!url) return 'Unknown';
      try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
      } catch {
        return url.substring(0, 20) + '...';
      }
    };
    
    return (
      <div 
        className="bg-white border-2 border-black rounded-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
        onClick={() => {
          setSelectedTest(test);
          setCurrentView('test');
        }}
        style={{ 
          borderTopColor: cardColor,
          borderTopWidth: '8px'
        }}
      >
        <div className="p-6 text-black">
          {/* Year and Grade badges */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span 
              className="px-2 py-1 rounded text-xs font-bold font-mono"
              style={{ backgroundColor: gradeColor, color: 'white' }}
            >
              {test.grade}
            </span>
            <span className="text-lg font-bold font-mono text-gray-600">
              {test.year}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold font-mono mb-4 pr-20 leading-tight uppercase text-black">
            {cleanName}
          </h3>
          
          {/* Source type and hosted info */}
          <div className="mb-4">
            <span className="text-sm font-mono font-bold text-black">
              WEB | CORPORATE
            </span>
            <div className="text-xs font-mono text-gray-600 mt-1">
              Hosted @ {getDomainName(test.source_url)}
            </div>
          </div>
          
          {/* Description */}
          <p className="font-mono text-sm leading-relaxed mb-6 text-gray-700 line-clamp-4">
            {test.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {test.tags?.slice(0, 3).map((tag, tagIndex) => (
              <a 
                key={tagIndex}
                href={`https://hackernoon.com/search?q=${encodeURIComponent(tag.toLowerCase().replace(/-/g, ' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs font-bold font-mono rounded-sm bg-black text-white hover:bg-gray-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </a>
            ))}
          </div>
          
          {/* Take test button */}
          <button 
            className="w-full py-3 bg-black text-white font-bold font-mono rounded-none hover:bg-gray-800 transition-colors flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              const urls = test.source_url?.split(';') || [];
              window.open(urls[0]?.trim(), '_blank');
            }}
          >
            TAKE THE TEST
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const TestDetailView = ({ test }) => {
    const cardColor = cardColors[0];
    const [showMoreSimilar, setShowMoreSimilar] = useState(false);
    
    // Find similar tests based on category and tags
    const similarTests = useMemo(() => {
      const similar = testsData
        .filter(t => t.id !== test.id)
        .filter(t => {
          if (t.category === test.category) return true;
          const overlap = t.tags?.some(tag => test.tags?.includes(tag));
          return overlap;
        })
        .sort((a, b) => {
          const aCategory = a.category === test.category ? 1 : 0;
          const bCategory = b.category === test.category ? 1 : 0;
          return bCategory - aCategory;
        })
        .slice(0, 9);
      return similar;
    }, [test, testsData]);
    
    const displayedSimilar = showMoreSimilar ? similarTests : similarTests.slice(0, 3);
    
    const SimilarTestCard = ({ similarTest, index }) => {
      const cardColor = cardColors[index % cardColors.length];
      const gradeColor = getGradeColor(similarTest.grade);
      const cleanName = (similarTest.test_name?.replace(/#\d+$/, '') || 'Turing Test').substring(0, 25) + '...';
      
      return (
        <div 
          className="bg-white border-2 border-black rounded-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
          onClick={() => setSelectedTest(similarTest)}
          style={{ 
            borderTopColor: cardColor,
            borderTopWidth: '4px'
          }}
        >
          <div className="p-4 text-black">
            <div className="absolute top-2 right-2">
              <div 
                className="px-1 py-0.5 rounded text-xs font-bold font-mono"
                style={{ backgroundColor: gradeColor, color: 'white' }}
              >
                {similarTest.grade}
              </div>
            </div>
            
            <h4 className="text-sm font-bold font-mono mb-2 pr-8 leading-tight uppercase text-black">
              {cleanName}
            </h4>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {similarTest.tags?.slice(0, 2).map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className="px-2 py-0.5 text-xs font-bold font-mono rounded-sm bg-black text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <button 
              className="w-full py-2 bg-black text-white font-bold font-mono rounded-none text-xs transition-all duration-200 hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                const urls = similarTest.source_url?.split(';') || [];
                window.open(urls[0]?.trim(), '_blank');
              }}
            >
              TAKE TEST
            </button>
          </div>
        </div>
      );
    };
    
    return (
      <div className="flex">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-gray-200 text-black font-bold font-mono rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← BACK TO TESTS
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 bg-green-300 text-black rounded-lg hover:bg-green-400 transition-colors border-2 border-black lg:hidden"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8" style={{ borderTop: `8px solid ${cardColor}` }}>
              <div className="flex items-start space-x-6 mb-8">
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cardColor }}
                >
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold font-mono text-gray-900 mb-4">
                    {test.test_name}
                  </h1>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button 
                      onClick={() => applyFilterAndGoHome('category', test.typeCategory)}
                      className="px-3 py-2 text-sm font-bold text-white rounded-lg font-mono hover:opacity-80 transition-colors cursor-pointer"
                      style={{ backgroundColor: cardColor }}
                    >
                      {test.category?.toUpperCase() || 'TEST'}
                    </button>
                    <button 
                      onClick={() => applyFilterAndGoHome('difficulty', test.difficulty)}
                      className="px-3 py-2 text-sm font-bold bg-gray-800 text-white rounded-lg font-mono hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      {test.difficulty?.toUpperCase() || 'MEDIUM'}
                    </button>
                    <span className="px-3 py-2 text-sm font-bold bg-blue-500 text-white rounded-lg font-mono">
                      {test.duration?.toUpperCase() || '2 MIN'}
                    </span>
                    <button 
                      onClick={() => applyFilterAndGoHome('access', 'Free')}
                      className="px-3 py-2 text-sm font-bold bg-green-500 text-white rounded-lg font-mono hover:bg-green-600 transition-colors cursor-pointer"
                    >
                      FREE
                    </button>
                    <button 
                      onClick={() => applyFilterAndGoHome('trust', test.grade?.charAt(0))}
                      className="px-3 py-2 text-sm font-bold text-white rounded-lg font-mono hover:opacity-80 transition-colors cursor-pointer"
                      style={{ backgroundColor: getGradeColor(test.grade) }}
                    >
                      {test.grade} TRUST
                    </button>
                    {test.trending && (
                      <span className="px-3 py-2 text-sm font-bold bg-red-500 text-white rounded-lg font-mono flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        TRENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-mono mb-4">DESCRIPTION</h2>
                <p className="text-lg font-mono leading-relaxed text-gray-700">
                  {test.description}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold font-mono mb-3">TEST DETAILS</h3>
                  <div className="space-y-2 font-mono">
                    <div><span className="font-bold">Format:</span> {test.format}</div>
                    <div><span className="font-bold">Input Type:</span> {test.input_type?.toUpperCase() || 'TEXT'}</div>
                    <div><span className="font-bold">Duration:</span> {test.duration || '2 min'}</div>
                    <div><span className="font-bold">Platform:</span> {test.platform}</div>
                    <div><span className="font-bold">Source Type:</span> {test.source_type}</div>
                    <div><span className="font-bold">Trustworthiness:</span> {test.trustworthiness}/100 ({test.grade})</div>
                    <div><span className="font-bold">Hosted @</span> {(() => {
                      if (!test.source_url) return 'Unknown';
                      try {
                        const domain = new URL(test.source_url).hostname;
                        return domain.replace('www.', '');
                      } catch {
                        return test.source_url.substring(0, 30) + '...';
                      }
                    })()}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono mb-3">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {test.tags?.map((tag, index) => (
                      <a 
                        key={index}
                        href={`https://hackernoon.com/search?q=${encodeURIComponent(tag.toLowerCase().replace(/-/g, ' '))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-black text-white text-sm font-bold font-mono rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t-2 border-gray-200 pt-8 mb-8">
                <button 
                  onClick={() => {
                    const urls = test.source_url?.split(';') || [];
                    window.open(urls[0]?.trim(), '_blank');
                  }}
                  className="w-full px-8 py-4 bg-black text-white text-xl font-bold font-mono rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  TAKE THE TEST
                  <ExternalLink className="w-6 h-6 ml-3" />
                </button>
              </div>
              
              {similarTests.length > 0 && (
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-mono">SIMILAR TURING TESTS</h2>
                    {similarTests.length > 3 && (
                      <button
                        onClick={() => setShowMoreSimilar(!showMoreSimilar)}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-mono font-bold text-sm transition-colors"
                      >
                        {showMoreSimilar ? 'SHOW LESS' : 'SHOW MORE'}
                        <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showMoreSimilar ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {displayedSimilar.map((similarTest, index) => (
                      <SimilarTestCard key={similarTest.id} similarTest={similarTest} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <footer className="bg-black text-white py-12 mt-16 rounded-lg">
              <div className="max-w-4xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold font-mono mb-4">BUILT WITH 💚 AT HACKERNOON</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <a href="https://hackernoon.ai/ml-tools?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">ML Tools</a>
                      <a href="https://hackernoon.ai/?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">HackerNoon AI</a>
                      <a href="https://hackernoon.com/c/ai?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">AI Expert Blogs</a>
                      <a href="https://hackernoon.com?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">HackerNoon</a>
                      <a href="https://abstraction.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Abstraction</a>
                      <a href="https://fewshot.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Few Shot</a>
                      <a href="https://mediabias.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Media Bias</a>
                      <a href="https://textmodels.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Text Models</a>
                      <a href="https://computational.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Computational</a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono mb-4">LEGAL</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <a href="https://hackernoon.com/terms?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Terms</a>
                      <a href="https://hackernoon.com/privacy?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Privacy</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
        
        <div className={`fixed inset-y-0 right-0 z-50 w-1/2 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0`} 
             style={{ backgroundColor: '#a7f3d0' }}>
          <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-12 lg:hidden">
              <h2 className="text-3xl font-bold font-mono text-black">MENU</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-blue-500 text-white rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-8 mb-16">
              <button 
                onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
                className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
              >
                HOME
              </button>
              <button 
                onClick={() => { setCurrentView('about'); setIsMenuOpen(false); }}
                className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
              >
                ABOUT THE HISTORICAL, PRESENT DAY, AND FUTURE IMPLICATIONS OF THE TURING TEST
              </button>
            </nav>
            
            <div className="mb-16">
              <h3 className="text-2xl font-bold font-mono text-black mb-8">TRENDING TURING TESTS</h3>
              <div className="space-y-6">
                {trendingTests.map(test => (
                  <button 
                    key={test.id}
                    onClick={() => {
                      setSelectedTest(test);
                      setCurrentView('test');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-lg font-mono text-black hover:text-blue-600 transition-colors"
                  >
                    {test.test_name?.replace(/#\d+$/, '') || 'Turing Test'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="space-y-6 text-lg font-mono text-black">
                <a href="https://hackernoon.ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.ai</a>
                <a href="https://hackernoon.tech?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.tech</a>
                <a href="https://hackernoon.com?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.com</a>
                <a href="https://hackernoon.com/c/ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">AI Expert Blogs</a>
                <a href="https://hackernoon.com/techbeat?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">Tech Beat Blogs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AboutView = () => (
    <div className="flex">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-200 text-black font-bold font-mono rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← BACK TO HOME
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 bg-green-300 text-black rounded-lg hover:bg-green-400 transition-colors border-2 border-black lg:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8" style={{ borderTop: `8px solid ${colors.blue}` }}>
            <h1 className="text-4xl font-bold font-mono mb-8">ABOUT THE TURING TEST</h1>
            
            <div className="prose prose-lg max-w-none font-mono">
              <p className="text-lg leading-relaxed mb-6">
                The Turing Test is a 1950 thought experiment by Alan Turing designed to determine a machine's ability to exhibit intelligent behavior indistinguishable from a human. In the standard test, a human interrogator asks questions to both a human and a computer through a text-based interface. If the interrogator cannot reliably tell which is the human and which is the machine, the computer is considered to have passed the test.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                This deceptively simple concept has become one of the most influential ideas in artificial intelligence, philosophy of mind, and computer science. Turing proposed this test as a practical alternative to the philosophically complex question "Can machines think?" by reframing it as "Can machines act indistinguishably from humans in conversation?"
              </p>
              
              <div className="flex items-center mb-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">HOW THE TEST WORKS</h2>
                  <p className="text-base leading-relaxed mb-4">
                    The test operates on a simple but profound premise: if a machine can engage in conversations that are indistinguishable from those of a human, then it can be said to think. This behavioral approach sidesteps complex philosophical questions about consciousness and focuses on observable performance.
                  </p>
                </div>
                <div className="w-full max-w-md ml-6">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <rect x="10" y="20" width="30" height="40" fill="#4285F4" stroke="#1a1a1a" strokeWidth="2"/>
                    <rect x="80" y="20" width="30" height="40" fill="#4285F4" stroke="#1a1a1a" strokeWidth="2"/>
                    <rect x="45" y="70" width="30" height="40" fill="#FFD700" stroke="#1a1a1a" strokeWidth="2"/>
                    <text x="25" y="45" fontSize="8" fill="white" textAnchor="middle">HUMAN</text>
                    <text x="95" y="45" fontSize="8" fill="white" textAnchor="middle">AI</text>
                    <text x="60" y="95" fontSize="6" fill="black" textAnchor="middle">INTERROGATOR</text>
                    <line x1="60" y1="70" x2="25" y2="60" stroke="#1a1a1a" strokeWidth="2"/>
                    <line x1="60" y1="70" x2="95" y2="60" stroke="#1a1a1a" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              
              <ul className="mb-8 space-y-3">
                <li><strong>Participants:</strong> The test involves a human interrogator and two participants in separate rooms or terminals: one human and one machine (computer).</li>
                <li><strong>The "Imitation Game":</strong> The interrogator engages in a text-based conversation with both participants, asking questions to test their mental abilities, knowledge, reasoning, and personality.</li>
                <li><strong>The Goal:</strong> The interrogator's objective is to identify which participant is the human and which is the machine through careful questioning and analysis of responses.</li>
                <li><strong>Passing the Test:</strong> If the interrogator fails to distinguish the computer from the human respondent consistently, the machine is declared to have passed the test and demonstrated human-like intelligence.</li>
                <li><strong>Time Constraints:</strong> Traditional implementations often include time limits to prevent overly lengthy interrogations that might favor human fatigue over machine consistency.</li>
              </ul>
              
              <div className="flex items-center mb-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">HISTORY AND SIGNIFICANCE</h2>
                  <p className="text-base leading-relaxed mb-4">
                    Alan Turing, often called the father of computer science, proposed this test during the early days of computing when machines were primarily seen as calculators. His vision extended far beyond simple computation to imagine machines capable of genuine intellectual discourse.
                  </p>
                  <p className="text-base leading-relaxed mb-4">
                    The test emerged from Turing's broader work in mathematical logic, computation theory, and his groundbreaking contributions during World War II, including his role in breaking the Enigma code. His interdisciplinary approach combined mathematics, philosophy, biology, and early computer science.
                  </p>
                </div>
                <div className="w-full max-w-md ml-6">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <rect x="20" y="30" width="80" height="60" fill="#34A853" stroke="#1a1a1a" strokeWidth="2"/>
                    <rect x="25" y="35" width="70" height="20" fill="#1a1a1a"/>
                    <rect x="25" y="60" width="70" height="20" fill="#1a1a1a"/>
                    <circle cx="30" cy="20" r="8" fill="#FFD700" stroke="#1a1a1a" strokeWidth="2"/>
                    <text x="60" y="47" fontSize="6" fill="#34A853" textAnchor="middle">ENIGMA CODE</text>
                    <text x="60" y="72" fontSize="6" fill="#34A853" textAnchor="middle">BREAKING</text>
                    <text x="30" y="25" fontSize="6" fill="black" textAnchor="middle">1942</text>
                    <path d="M 10 100 Q 40 95 70 100 Q 90 105 110 100" stroke="#FF6B35" strokeWidth="3" fill="none"/>
                    <text x="60" y="110" fontSize="8" fill="#FF6B35" textAnchor="middle">WWII Victory</text>
                  </svg>
                </div>
              </div>
              
              <ul className="mb-8 space-y-3">
                <li><strong>Turing's Original Concept:</strong> Proposed by Alan Turing in his 1950 paper "Computing Machinery and Intelligence," the test, originally called the "Imitation Game," was a way to answer the question "Can machines think?" by focusing on whether a machine could "imitate human responses so as to fool a human interrogator".</li>
                <li><strong>Benchmark for AI:</strong> The Turing Test became a seminal concept and a historical benchmark for the field of artificial intelligence, inspiring decades of research and development in natural language processing and machine intelligence.</li>
                <li><strong>Cultural Impact:</strong> Beyond academia, the test has influenced popular culture, appearing in countless science fiction works, films, and philosophical discussions about the nature of consciousness and artificial intelligence.</li>
                <li><strong>Evolution of AI:</strong> With the rise of large language models like GPT, Claude, and other transformer-based systems, the test's relevance has been re-evaluated. Some AI models can convincingly simulate human conversation, humor, and wit, leading to claims that they have passed or come close to passing the test.</li>
                <li><strong>Modern Variations:</strong> Contemporary implementations include various modifications such as restricted domains, visual elements, and multi-modal interactions that extend beyond pure text-based conversation.</li>
              </ul>
              
              <div className="flex items-center mb-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">LIMITATIONS AND MODERN PERSPECTIVE</h2>
                  <p className="text-base leading-relaxed mb-4">
                    While revolutionary for its time, the Turing Test faces significant criticisms in the modern AI landscape. Critics argue that the test measures performance rather than genuine understanding, and that sophisticated pattern matching might achieve passing scores without true intelligence.
                  </p>
                  <p className="text-base leading-relaxed mb-4">
                    The "Chinese Room" argument by philosopher John Searle challenges whether symbol manipulation (however sophisticated) can constitute genuine understanding, suggesting that passing the Turing Test might not indicate true machine consciousness or intelligence.
                  </p>
                </div>
                <div className="w-full max-w-md ml-6">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="45" fill="#9C27B0" stroke="#1a1a1a" strokeWidth="2"/>
                    <path d="M 30 45 Q 60 20 90 45" stroke="white" strokeWidth="3" fill="none"/>
                    <path d="M 30 75 Q 60 100 90 75" stroke="white" strokeWidth="3" fill="none"/>
                    <circle cx="45" cy="50" r="3" fill="white"/>
                    <circle cx="75" cy="50" r="3" fill="white"/>
                    <rect x="55" y="55" width="10" height="15" fill="white"/>
                    <text x="60" y="85" fontSize="8" fill="white" textAnchor="middle">AI LIMITS</text>
                    <path d="M 20 20 L 30 30" stroke="#FF6B35" strokeWidth="2"/>
                    <path d="M 90 20 L 100 30" stroke="#FF6B35" strokeWidth="2"/>
                    <text x="15" y="15" fontSize="6" fill="#FF6B35">?</text>
                    <text x="105" y="15" fontSize="6" fill="#FF6B35">?</text>
                  </svg>
                </div>
              </div>
              
              <ul className="mb-8 space-y-3">
                <li><strong>Reliance on Human Testers:</strong> A key limitation is its dependence on the human interrogator's ability to effectively identify AI. Skilled questioners may reveal AI limitations more easily than casual users.</li>
                <li><strong>Focus on Language:</strong> The test's primary focus on linguistic and conversational abilities may not capture the full spectrum of machine intelligence or consciousness, potentially overlooking other forms of intelligence.</li>
                <li><strong>Cultural and Linguistic Bias:</strong> The test's effectiveness may vary significantly across different cultures, languages, and social contexts, potentially favoring certain types of responses over others.</li>
                <li><strong>Gaming the System:</strong> Modern AI systems might pass the test through sophisticated mimicry rather than genuine understanding, raising questions about what the test actually measures.</li>
                <li><strong>Broader Context:</strong> While a landmark in AI, there is a growing sentiment among researchers that focus should shift to developing specific "general sciences of cognition" to assess other aspects of intelligence, such as reasoning, vision, creativity, and generalization.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-6">FURTHER (FREE) READING ON THE TURING TEST:</h2>
              <div className="space-y-3 mb-8">
                <a href="https://hackernoon.com/an-ai-passed-the-turing-test-and-that-should-freak-you-out" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • An AI Passed the Turing Test—And That Should Freak You Out
                </a>
                <a href="https://hackernoon.com/is-the-turing-test-still-the-best-way-to-tell-machines-and-humans-apart" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Is the Turing Test Still the Best Way to Tell Machines and Humans Apart?
                </a>
                <a href="https://hackernoon.com/can-dreamllm-surpass-the-30-turing-test-requirement" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Can DreamLLM Surpass the 30% Turing Test Requirement?
                </a>
                <a href="https://hackernoon.com/running-the-turing-test-on-myself" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Running the Turing Test on myself
                </a>
                <a href="https://hackernoon.com/evidence-that-ai-will-soon-pass-the-turing-test-or-maybe-it-already-has" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Evidence That AI Will Soon Pass the Turing Test (or maybe it already has)
                </a>
                <a href="https://hackernoon.com/what-constitutes-artificial-intelligence-is-it-the-turing-test" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • What Constitutes Artificial Intelligence? Is It The Turing Test?
                </a>
                <a href="https://hackernoon.com/wow-this-bot-passed-the-turing-test-by-simulating-a-dude-on-tinder" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Wow! This Bot Passed the Turing Test by Simulating a Dude on Tinder
                </a>
                <a href="https://hackernoon.com/how-to-tell-if-ai-really-is-a-revolution" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • How to Tell if AI Really is a Revolution
                </a>
                <a href="https://hackernoon.com/ai-intelligence-or-imitation-of-intelligence" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • AI: Intelligence or Imitation of Intelligence?
                </a>
                <a href="https://hackernoon.com/philosophers-challenge-the-idea-that-ai-lacks-true-understanding" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Philosophers Challenge the Idea That AI Lacks True Understanding
                </a>
                <a href="https://hackernoon.com/can-ai-make-memes" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Can AI Make Memes?
                </a>
                <a href="https://hackernoon.com/heres-why-your-ai-has-bad-humor" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Here's Why Your AI Has Bad Humor
                </a>
                <a href="https://hackernoon.com/ai-captcha-fails-are-the-internets-new-comedy-show" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • AI CAPTCHA Fails Are the Internet's New Comedy Show!
                </a>
                <a href="https://hackernoon.com/the-chinese-room-argument-challenging-the-turing-tests-validity" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • The Chinese Room Argument: Challenging the Turing Test's Validity
                </a>
                <a href="https://hackernoon.com/alan-turing-the-man-behind-the-test-that-defined-ai" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Alan Turing: The Man Behind the Test That Defined AI
                </a>
                <a href="https://hackernoon.com/beyond-the-turing-test-modern-ai-evaluation-benchmarks" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • Beyond the Turing Test: Modern AI Evaluation Benchmarks
                </a>
                <a href="https://hackernoon.com/the-visual-turing-test-detecting-deepfakes-and-ai-generated-media" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • The Visual Turing Test: Detecting Deepfakes and AI-Generated Media
                </a>
                <a href="https://hackernoon.com/conversational-ai-how-close-are-we-to-passing-the-turing-test" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-colors">
                  • Conversational AI: How Close Are We to Passing the Turing Test?
                </a>
                <a href="https://hackernoon.com/the-ethics-of-ai-consciousness-when-machines-seem-human" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • The Ethics of AI Consciousness: When Machines Seem Human
                </a>
                <a href="https://hackernoon.com/the-future-of-ai-from-turing-tests-to-artificial-general-intelligence" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline font-mono">
                  • The Future of AI: From Turing Tests to Artificial General Intelligence
                </a>
              </div>
            </div>
          </div>
          
          <footer className="bg-black text-white py-12 mt-16 rounded-lg">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold font-mono mb-4">BUILT WITH 💚 AT HACKERNOON</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <a href="https://hackernoon.ai/ml-tools?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">ML Tools</a>
                    <a href="https://hackernoon.ai/?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">HackerNoon AI</a>
                    <a href="https://hackernoon.com/c/ai?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">AI Expert Blogs</a>
                    <a href="https://hackernoon.com?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">HackerNoon</a>
                    <a href="https://abstraction.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Abstraction</a>
                    <a href="https://fewshot.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Few Shot</a>
                    <a href="https://mediabias.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Media Bias</a>
                    <a href="https://textmodels.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Text Models</a>
                    <a href="https://computational.tech?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Computational</a>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono mb-4">LEGAL</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <a href="https://hackernoon.com/terms?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Terms</a>
                    <a href="https://hackernoon.com/privacy?ref=hackernoonturingtest" className="block hover:text-blue-400 transition-colors">Privacy</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      <div className={`fixed inset-y-0 right-0 z-50 w-1/2 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0`} 
           style={{ backgroundColor: '#a7f3d0' }}>
        <div className="p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-12 lg:hidden">
            <h2 className="text-3xl font-bold font-mono text-black">MENU</h2>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-blue-500 text-white rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-8 mb-16">
            <button 
              onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
              className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
            >
              HOME
            </button>
            <button 
              onClick={() => { setCurrentView('about'); setIsMenuOpen(false); }}
              className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
            >
              ABOUT THE HISTORICAL, PRESENT DAY, AND FUTURE IMPLICATIONS OF THE TURING TEST
            </button>
          </nav>
          
          <div className="mb-16">
            <h3 className="text-2xl font-bold font-mono text-black mb-8">TRENDING TURING TESTS</h3>
            <div className="space-y-6">
              {trendingTests.map(test => (
                <button 
                  key={test.id}
                  onClick={() => {
                    setSelectedTest(test);
                    setCurrentView('test');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-lg font-mono text-black hover:text-blue-600 transition-colors"
                >
                  {test.test_name?.replace(/#\d+$/, '') || 'Turing Test'}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="space-y-6 text-lg font-mono text-black">
              <a href="https://hackernoon.ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.ai</a>
              <a href="https://hackernoon.tech?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.tech</a>
              <a href="https://hackernoon.com?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.com</a>
              <a href="https://hackernoon.com/c/ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">AI Expert Blogs</a>
              <a href="https://hackernoon.com/techbeat?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">Tech Beat Blogs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentView === 'test' && selectedTest) {
    return <TestDetailView test={selectedTest} />;
  }

  if (currentView === 'about') {
    return <AboutView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-mono uppercase mb-4 text-gray-500">
                Turing Test Tech Evals
              </h1>
              <h2 className="text-5xl md:text-8xl lg:text-9xl font-black font-mono uppercase leading-none mb-6 text-black">
                DIRECTORY OF THE INTERNET'S MOST COMPELLING TURING TESTS
              </h2>
              <div className="text-left">
                <p className="text-lg md:text-xl font-mono">
                  <span className="text-gray-500">Curated by</span> <a href="https://hackernoon.com?ref=hackernoonturingtest" className="text-green-700 hover:underline font-bold">HackerNoon</a>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-4 p-3 bg-green-300 text-black rounded-lg hover:bg-green-400 transition-colors border-2 border-black"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowTrending(!showTrending)}
                  className={`px-6 py-3 border-2 border-black rounded-none font-mono font-bold text-lg transition-colors whitespace-nowrap ${
                    showTrending ? 'bg-red-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  TRENDING: {showTrending ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {/* Horizontal Filters - 3 per row layout */}
              <div className="grid grid-cols-3 gap-3">
                <FilterSelect
                  label="TYPE"
                  value={selectedType}
                  options={typeOptions}
                  onChange={setSelectedType}
                  color="bg-blue-100"
                />
                <FilterSelect
                  label="DIFFICULTY"
                  value={selectedDifficulty}
                  options={difficultyOptions}
                  onChange={setSelectedDifficulty}
                  color="bg-red-100"
                />
                <FilterSelect
                  label="PLATFORM"
                  value={selectedPlatform}
                  options={platformOptions}
                  onChange={setSelectedPlatform}
                  color="bg-purple-100"
                />
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <FilterSelect
                  label="TRUST"
                  value={selectedTrust}
                  options={['All', 'A', 'B', 'C']}
                  onChange={setSelectedTrust}
                  color="bg-green-100"
                />
                <FilterSelect
                  label="ACCESS"
                  value={selectedAccess}
                  options={accessOptions}
                  onChange={setSelectedAccess}
                  color="bg-yellow-100"
                />
                <FilterSelect
                  label="CREATOR"
                  value={selectedCreator}
                  options={creatorOptions}
                  onChange={setSelectedCreator}
                  color="bg-orange-100"
                />
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <FilterSelect
                  label="YEAR"
                  value={selectedYear}
                  options={['All', '2024', '2023', '2022', '2021']}
                  onChange={setSelectedYear}
                  color="bg-indigo-100"
                />
                <FilterSelect
                  label="FORMAT"
                  value={selectedFormat}
                  options={['All', 'Multiple choice', 'Conversation', 'Analysis', 'Game']}
                  onChange={setSelectedFormat}
                  color="bg-pink-100"
                />
                <FilterSelect
                  label="INPUT"
                  value={selectedInput}
                  options={['All', 'text', 'image', 'audio', 'video', 'mixed']}
                  onChange={setSelectedInput}
                  color="bg-teal-100"
                />
              </div>
            </div>

            {/* Results Count with Pagination Info */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xl font-bold font-mono">
                SHOWING {((currentPage - 1) * testsPerPage) + 1}-{Math.min(currentPage * testsPerPage, filteredTests.length)} OF {filteredTests.length} TESTS
              </p>
              {totalPages > 1 && (
                <div className="text-sm font-mono text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>

            {/* Test Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedTests.map((test, index) => (
                <TestCard key={test.id} test={test} index={index} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 font-bold font-mono rounded-lg border-2 border-black transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  ← PREVIOUS
                </button>
                
                <div className="flex space-x-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 font-bold font-mono rounded-lg border-2 transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-black hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 font-bold font-mono rounded-lg border-2 border-black transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  NEXT →
                </button>
              </div>
            )}

            {paginatedTests.length === 0 && filteredTests.length === 0 && (
              <div className="text-center py-16">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold font-mono mb-2">NO TESTS FOUND</h3>
                <p className="font-mono text-gray-600">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - 50% width like TheVerge */}
        <div className={`fixed inset-y-0 right-0 z-50 w-1/2 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0`} 
             style={{ backgroundColor: '#a7f3d0' }}>
          <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-12 lg:hidden">
              <h2 className="text-3xl font-bold font-mono text-black">MENU</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-blue-500 text-white rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-8 mb-16">
              <button 
                onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
                className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
              >
                HOME
              </button>
              <button 
                onClick={() => { setCurrentView('about'); setIsMenuOpen(false); }}
                className="block w-full text-left text-3xl font-bold font-mono text-black hover:text-blue-600 transition-colors"
              >
                ABOUT THE HISTORICAL, PRESENT DAY, AND FUTURE IMPLICATIONS OF THE TURING TEST
              </button>
            </nav>
            
            <div className="mb-16">
              <h3 className="text-2xl font-bold font-mono text-black mb-8">TRENDING TURING TESTS</h3>
              <div className="space-y-6">
                {trendingTests.map(test => (
                  <button 
                    key={test.id}
                    onClick={() => {
                      setSelectedTest(test);
                      setCurrentView('test');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-lg font-mono text-black hover:text-blue-600 transition-colors"
                  >
                    {test.test_name?.replace(/#\d+$/, '') || 'Turing Test'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="space-y-6 text-lg font-mono text-black">
                <a href="https://hackernoon.ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.ai</a>
                <a href="https://hackernoon.tech?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.tech</a>
                <a href="https://hackernoon.com?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">HackerNoon.com</a>
                <a href="https://hackernoon.com/c/ai?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">AI Expert Blogs</a>
                <a href="https://hackernoon.com/techbeat?ref=hackernoonturingtest" className="block hover:text-blue-600 transition-colors">Tech Beat Blogs</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold font-mono mb-4">BUILT WITH 💚 AT HACKERNOON</h3>
              <div className="space-y-2 text-sm font-mono">
                <a href="https://hackernoon.ai/ml-tools" className="block hover:text-blue-400 transition-colors">ML Tools</a>
                <a href="https://hackernoon.ai/" className="block hover:text-blue-400 transition-colors">HackerNoon AI</a>
                <a href="https://hackernoon.com/c/ai" className="block hover:text-blue-400 transition-colors">AI Category</a>
                <a href="https://hackernoon.com" className="block hover:text-blue-400 transition-colors">HackerNoon</a>
                <a href="https://abstraction.tech" className="block hover:text-blue-400 transition-colors">Abstraction</a>
                <a href="https://fewshot.tech" className="block hover:text-blue-400 transition-colors">Few Shot</a>
                <a href="https://mediabias.tech" className="block hover:text-blue-400 transition-colors">Media Bias</a>
                <a href="https://textmodels.tech" className="block hover:text-blue-400 transition-colors">Text Models</a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold font-mono mb-4">LEGAL</h3>
              <div className="space-y-2 text-sm font-mono">
                <a href="https://hackernoon.com/terms" className="block hover:text-blue-400 transition-colors">Terms</a>
                <a href="https://hackernoon.com/privacy" className="block hover:text-blue-400 transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TuringTestApp;