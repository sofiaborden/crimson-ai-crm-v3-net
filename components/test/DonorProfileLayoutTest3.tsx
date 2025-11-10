import React, { useState, useMemo, useEffect } from 'react';
import { Donor } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SmartTag from '../ui/SmartTag';
import { GiftModal } from '../profile/GiftModal';
import CodesManager from '../profile/CodesManager';
import { formatCurrency, formatPhone } from '../../utils/formatters';

// Enhanced Smart Bio Component with multiple data sources
// Original version - 2025-01-06: included fecGivingSummary field
interface SmartBioData {
  perplexityHeadlines: string[];
  wealthSummary: string;
  sources: Array<{ name: string; url: string }>;
  perplexityCitations: Array<{ title: string; url: string }>;
  confidence: 'High' | 'Medium' | 'Low';
  lastGenerated: string;
}

// Wealth mapping based on i360 WEALTHFINDER_CODE
const WEALTH_MAPPING = {
  'A': { range: '$1.2M–$1.8M', tier: 'Top Wealth Tier: A', median: '$1.8M' },
  'B': { range: '$900k–$1.2M', tier: 'Wealth Tier: B', median: '$1.2M' },
  'C': { range: '$800k–$900k', tier: 'Wealth Tier: C', median: '$900k' },
  'D': { range: '$700k–$800k', tier: 'Wealth Tier: D', median: '$800k' },
  'E': { range: '$600k–$700k', tier: 'Wealth Tier: E', median: '$700k' },
  'F': { range: '$400k–$600k', tier: 'Wealth Tier: F', median: '$500k' },
  'G': { range: '$300k–$400k', tier: 'Wealth Tier: G', median: '$400k' },
  'H': { range: '$200k–$300k', tier: 'Wealth Tier: H', median: '$300k' },
  'I': { range: '$180k–$200k', tier: 'Wealth Tier: I', median: '$200k' },
  'J': { range: '$160k–$180k', tier: 'Wealth Tier: J', median: '$180k' },
  'K': { range: '$140k–$160k', tier: 'Wealth Tier: K', median: '$160k' },
  'L': { range: '$120k–$140k', tier: 'Wealth Tier: L', median: '$140k' },
  'M': { range: '$100k–$120k', tier: 'Wealth Tier: M', median: '$120k' },
  'N': { range: '$80k–$100k', tier: 'Wealth Tier: N', median: '$100k' },
  'O': { range: '$60k–$80k', tier: 'Wealth Tier: O', median: '$80k' },
  'P': { range: '$30k–$60k', tier: 'Wealth Tier: P', median: '$60k' },
  'Q': { range: '$20k–$30k', tier: 'Wealth Tier: Q', median: '$30k' },
  'R': { range: '$10k–$20k', tier: 'Wealth Tier: R', median: '$20k' },
  'S': { range: '$2k–$10k', tier: 'Wealth Tier: S', median: '$10k' },
  'T': { range: 'Below $10k', tier: 'Lowest Wealth Tier: T', median: '$2k' }
};

// Mock wealth data for existing profiles
const getMockWealthCode = (donorName: string): string | null => {
  if (donorName.includes('Joseph') || donorName.includes('Banks')) return 'A';
  if (donorName.includes('Sofia') || donorName.includes('Amaya')) return 'B';
  if (donorName.includes('Brooke') || donorName.includes('Taylor')) return 'C';
  if (donorName.includes('Charles') || donorName.includes('Logan')) return 'D';
  return Math.random() > 0.3 ? ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)] : null;
};

// Enhanced Data interface and mock data (from original DonorProfile.tsx)
interface EnrichedData {
  age: number;
  gender: string;
  householdIncome: string;
  homeowner: boolean;
  education: string;
  maritalStatus: string;
  voterRegistration: string;
  party: string;
  politicalEngagement: number;
  volunteerPropensity: number;
  eventAttendancePropensity: number;
  givingCapacity: string;
  dataSource?: string;
  lastUpdated?: string;
}

// Mock enriched data - in real app this would come from i360/L2/etc
const getEnrichedData = (donorId: string): EnrichedData | null => {
  // Simulate having enriched data for some donors
  const hasEnrichedData = Math.random() > 0.3; // 70% chance of having data
  if (!hasEnrichedData) return null;

  return {
    age: 45 + Math.floor(Math.random() * 30),
    gender: Math.random() > 0.5 ? 'Female' : 'Male',
    householdIncome: ['$50-75K', '$75-100K', '$100-150K', '$150-200K', '$200K+'][Math.floor(Math.random() * 5)],
    homeowner: Math.random() > 0.3,
    education: ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD'][Math.floor(Math.random() * 5)],
    maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'][Math.floor(Math.random() * 4)],
    voterRegistration: 'Active',
    party: ['Republican', 'Democrat', 'Independent', 'Unaffiliated'][Math.floor(Math.random() * 4)],
    politicalEngagement: 40 + Math.floor(Math.random() * 60),
    volunteerPropensity: 30 + Math.floor(Math.random() * 70),
    eventAttendancePropensity: 25 + Math.floor(Math.random() * 75),
    givingCapacity: ['Low', 'Medium', 'High', 'Very High'][Math.floor(Math.random() * 4)],
    dataSource: 'i360 Political Data',
    lastUpdated: '2024-01-15'
  };
};
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ChevronDownIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ClipboardDocumentIcon,
  FlagIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  AddressBookIcon,
  CampaignIcon,
  PrinterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  MoreIcon,
  XMarkIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  CheckIcon,
  TrashIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  ArrowPathIcon,
  EyeSlashIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '../../constants';

// Generate Perplexity headlines using backend API route
const generatePerplexityHeadlines = async (donor: Donor): Promise<{headlines: string[], citations: Array<{title: string, url: string}>}> => {
  try {
    console.log('🔍 Generating bio for:', donor.name, 'at', donor.employment?.employer || 'Unknown employer');

    // Call our backend API server instead of Perplexity directly
    const apiUrl = `${import.meta.env.VITE_API_URL || 'https://crimson-ai-crm-v3-net.onrender.com'}/api/generate-bio`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: donor.name,
        occupation: donor.employment?.occupation,
        employer: donor.employment?.employer,
        location: donor.primaryAddress ? `${donor.primaryAddress.city}, ${donor.primaryAddress.state}` : donor.address,
        email: donor.email,
        industry: donor.employment?.industry,
        // LOCALHOST TESTING: Request search_results instead of JSON sources
        useSearchResults: true,
        testingMode: 'localhost'
      })
    });

    console.log('🔍 Backend API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔍 Backend API Error:', errorData);
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Backend API Success:', data);

    if (data.success && data.headlines && data.headlines.length > 0) {
      console.log('✅ Successfully generated headlines via backend API');

      // Log citation source information for debugging
      console.log('🔍 Citation source:', data.citationSource);
      console.log('🔍 Citation count:', data.citationCount);
      console.log('🔍 Has search results:', data.hasSearchResults);
      console.log('🔍 Has JSON sources:', data.hasJsonSources);

      return {
        headlines: data.headlines,
        citations: data.citations || []
      };
    } else {
      throw new Error('No headlines returned from backend API');
    }

  } catch (error) {
    console.error('❌ Perplexity API error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });

    console.log('🔄 Using fallback headlines due to API error');

    // Return realistic fallback data based on employment information
    if (donor.employment) {
      const fallbackHeadlines = [
        `${donor.name} serves as ${donor.employment.occupation} at ${donor.employment.employer}.`,
        `Professional with experience in ${donor.employment.industry || 'their field'}.`,
        `Based in ${donor.primaryAddress?.city || 'their location'} with established career background.`
      ];
      console.log('🔄 Employment-based fallback:', fallbackHeadlines);
      return {
        headlines: fallbackHeadlines,
        citations: []
      };
    }

    // Generic fallback for profiles without employment data
    const genericFallback = [
      `${donor.name} is a professional with established community connections.`,
      `Active in their local area with potential for civic engagement.`,
      `Profile available for further research and outreach opportunities.`
    ];
    console.log('🔄 Generic fallback:', genericFallback);
    return {
      headlines: genericFallback,
      citations: []
    };
  }
};

// Generate wealth summary from i360 data
const generateWealthSummary = (donor: Donor): string => {
  const wealthCode = getMockWealthCode(donor.name);

  if (!wealthCode || !WEALTH_MAPPING[wealthCode as keyof typeof WEALTH_MAPPING]) {
    return '';
  }

  const wealthData = WEALTH_MAPPING[wealthCode as keyof typeof WEALTH_MAPPING];
  return `Estimated wealth: ${wealthData.range} (${wealthData.tier})`;
};

// Enterprise AI Insights component for Test 3 profiles
const EnterpriseAIInsights: React.FC<{ donor: Donor }> = ({ donor }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'bio'>('insights');
  const [showDialRModal, setShowDialRModal] = useState(false);
  const [showDialRTooltip, setShowDialRTooltip] = useState(false);
  const [selectedList, setSelectedList] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // Enhanced Smart Bio state
  const [smartBioData, setSmartBioData] = useState<SmartBioData | null>(null);
  const [isGeneratingSmartBio, setIsGeneratingSmartBio] = useState(false);
  const [showSmartBioConfirmModal, setShowSmartBioConfirmModal] = useState(false);
  const [smartBioError, setSmartBioError] = useState('');
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [originalBioText, setOriginalBioText] = useState<string[]>([]);
  const [editedBioText, setEditedBioText] = useState<string[]>([]);

  // Citation hide/exclude state
  const [hiddenCitations, setHiddenCitations] = useState<Set<string>>(new Set());
  const [permanentlyHiddenCitations, setPermanentlyHiddenCitations] = useState<Set<string>>(new Set());
  const [showHiddenSources, setShowHiddenSources] = useState(false);
  const [showHideCitationModal, setShowHideCitationModal] = useState(false);
  const [citationToHide, setCitationToHide] = useState<{title: string; url: string} | null>(null);

  // User feedback system state
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [showQuickActionsDropdown, setShowQuickActionsDropdown] = useState(false);

  // Load permanently hidden citations from localStorage on component mount
  useEffect(() => {
    const savedHiddenCitations = localStorage.getItem(`hiddenCitations_${donor.id}`);
    if (savedHiddenCitations) {
      try {
        const hiddenUrls = JSON.parse(savedHiddenCitations);
        setPermanentlyHiddenCitations(new Set(hiddenUrls));
      } catch (error) {
        console.error('Failed to load hidden citations from localStorage:', error);
      }
    }
  }, [donor.id]);

  // Citation hide/exclude functions
  const handleHideCitation = (citation: {title: string; url: string}) => {
    setCitationToHide(citation);
    setShowHideCitationModal(true);
  };

  const confirmHideCitation = (permanent: boolean) => {
    if (!citationToHide) return;

    if (permanent) {
      // Add to permanently hidden citations
      const newPermanentlyHidden = new Set(permanentlyHiddenCitations);
      newPermanentlyHidden.add(citationToHide.url);
      setPermanentlyHiddenCitations(newPermanentlyHidden);

      // Save to localStorage
      const hiddenUrls = Array.from(newPermanentlyHidden);
      localStorage.setItem(`hiddenCitations_${donor.id}`, JSON.stringify(hiddenUrls));
    } else {
      // Add to session-only hidden citations
      const newHidden = new Set(hiddenCitations);
      newHidden.add(citationToHide.url);
      setHiddenCitations(newHidden);
    }

    setShowHideCitationModal(false);
    setCitationToHide(null);
  };

  const handleRestoreCitation = (url: string, permanent: boolean) => {
    if (permanent) {
      const newPermanentlyHidden = new Set(permanentlyHiddenCitations);
      newPermanentlyHidden.delete(url);
      setPermanentlyHiddenCitations(newPermanentlyHidden);

      // Update localStorage
      const hiddenUrls = Array.from(newPermanentlyHidden);
      localStorage.setItem(`hiddenCitations_${donor.id}`, JSON.stringify(hiddenUrls));
    } else {
      const newHidden = new Set(hiddenCitations);
      newHidden.delete(url);
      setHiddenCitations(newHidden);
    }
  };

  // Get visible and hidden citations
  const getVisibleCitations = () => {
    if (!smartBioData?.perplexityCitations) return [];
    return smartBioData.perplexityCitations.filter(citation =>
      !hiddenCitations.has(citation.url) && !permanentlyHiddenCitations.has(citation.url)
    );
  };

  const getHiddenCitations = () => {
    if (!smartBioData?.perplexityCitations) return [];
    return smartBioData.perplexityCitations.filter(citation =>
      hiddenCitations.has(citation.url) || permanentlyHiddenCitations.has(citation.url)
    ).map(citation => ({
      ...citation,
      isPermanent: permanentlyHiddenCitations.has(citation.url)
    }));
  };

  // User feedback functions
  const handlePositiveFeedback = () => {
    if (feedbackGiven) return; // Prevent multiple submissions

    setFeedbackGiven('positive');
    setShowFeedbackToast(true);

    // Store feedback data
    const feedbackData = {
      donorId: donor.id,
      timestamp: new Date().toISOString(),
      feedbackType: 'positive',
      bioGenerated: smartBioData?.lastGenerated
    };

    // Save to localStorage for localhost testing
    const existingFeedback = JSON.parse(localStorage.getItem('smartBioFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('smartBioFeedback', JSON.stringify(existingFeedback));

    console.log('✅ Positive feedback recorded:', feedbackData);

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setShowFeedbackToast(false), 3000);
  };

  const handleNegativeFeedback = () => {
    if (feedbackGiven) return; // Prevent multiple submissions

    setFeedbackGiven('negative');
    setShowFeedbackModal(true);
  };

  const submitNegativeFeedback = () => {
    const feedbackData = {
      donorId: donor.id,
      timestamp: new Date().toISOString(),
      feedbackType: 'negative',
      comment: feedbackComment.trim(),
      bioGenerated: smartBioData?.lastGenerated
    };

    // Save to localStorage for localhost testing
    const existingFeedback = JSON.parse(localStorage.getItem('smartBioFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('smartBioFeedback', JSON.stringify(existingFeedback));

    console.log('📝 Negative feedback recorded:', feedbackData);

    setShowFeedbackModal(false);
    setFeedbackComment('');
    setShowFeedbackToast(true);

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setShowFeedbackToast(false), 3000);
  };

  // Bio Review Process Functions
  const handleEditBio = () => {
    setIsEditingBio(true);
    console.log('✏️ Editing bio');
  };

  const handleResetBio = () => {
    setEditedBioText(originalBioText);
    if (smartBioData) {
      const updatedBioData = {
        ...smartBioData,
        perplexityHeadlines: originalBioText
      };
      setSmartBioData(updatedBioData);
    }
    console.log('🔄 Bio reset to original Perplexity content');
  };

  const handleSaveEditedBio = () => {
    if (smartBioData) {
      const updatedBioData = {
        ...smartBioData,
        perplexityHeadlines: editedBioText
      };
      setSmartBioData(updatedBioData);
      setIsEditingBio(false);
      console.log('✅ Edited bio saved:', editedBioText);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBio(false);
    setEditedBioText(smartBioData?.perplexityHeadlines || []);
    console.log('❌ Edit cancelled');
  };

  // Quick Actions Toolbar Functions
  const handleCopyToClipboard = async () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const fullText = `${bioText}\n\n${smartBioData.wealthSummary ? `Wealth: ${smartBioData.wealthSummary}` : ''}`;

      try {
        await navigator.clipboard.writeText(fullText);
        console.log('✅ Bio copied to clipboard');
      } catch (error) {
        console.error('❌ Failed to copy to clipboard:', error);
      }
    }
  };

  const handleExportAsPDF = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const content = `
        Smart Bio - ${donor.name}
        Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}

        ${bioText}

        ${smartBioData.wealthSummary ? `Wealth Summary: ${smartBioData.wealthSummary}` : ''}

        Sources:
        ${smartBioData.perplexityCitations.map((citation, index) =>
          `${index + 1}. ${citation.title}: ${citation.url}`
        ).join('\n')}
      `;

      // Create a new window with the content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Smart Bio - ${donor.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
                .sources { margin-top: 30px; }
                .sources h3 { color: #333; }
                .sources ol { padding-left: 20px; }
              </style>
            </head>
            <body>
              <h1>Smart Bio - ${donor.name}</h1>
              <div class="meta">Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}</div>
              <p>${bioText}</p>
              ${smartBioData.wealthSummary ? `<p><strong>Wealth Summary:</strong> ${smartBioData.wealthSummary}</p>` : ''}
              <div class="sources">
                <h3>Sources:</h3>
                <ol>
                  ${smartBioData.perplexityCitations.map(citation =>
                    `<li><strong>${citation.title}:</strong> <a href="${citation.url}" target="_blank">${citation.url}</a></li>`
                  ).join('')}
                </ol>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleEmailBio = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const subject = `Smart Bio - ${donor.name}`;
      const body = `Smart Bio for ${donor.name}
Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}

${bioText}

${smartBioData.wealthSummary ? `Wealth Summary: ${smartBioData.wealthSummary}` : ''}

Sources:
${smartBioData.perplexityCitations.map((citation, index) =>
  `${index + 1}. ${citation.title}: ${citation.url}`
).join('\n')}`;

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  const handleReportIssue = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const subject = 'Incorrect Bio';
      const body = `I would like to report an issue with the generated bio for the following donor:

Name: ${donor.name}
Email: ${donor.email || 'Not provided'}
Organization: ${donor.employment?.employer || 'Not provided'}

Generated Bio:
${bioText}

[Please describe the issue with the bio]

Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}`;

      const mailtoLink = `mailto:Support@cmdi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  // Enhanced Smart Bio generation with multiple data sources
  const generateEnhancedSmartBio = async () => {
    setIsGeneratingSmartBio(true);
    setSmartBioError('');

    try {
      // Run all API calls in parallel with timeout handling
      const [perplexityHeadlines, wealthSummary] = await Promise.allSettled([
        generatePerplexityHeadlines(donor),
        Promise.resolve(generateWealthSummary(donor)) // Wrap sync function in Promise
      ]);

      // Extract results with fallbacks for failed promises
      const perplexityResult = perplexityHeadlines.status === 'fulfilled'
        ? perplexityHeadlines.value
        : { headlines: [`${donor.name} is a political donor with available public records.`], citations: [] };

      const headlines = perplexityResult.headlines;
      const citations = perplexityResult.citations;

      const wealth = wealthSummary.status === 'fulfilled'
        ? wealthSummary.value
        : '';

      // Compile sources
      const sources = [
        { name: 'Perplexity', url: 'https://www.perplexity.ai' },
        ...(wealth ? [{ name: 'i360 Internal Data', url: '#' }] : [])
      ];

      const bioData: SmartBioData = {
        perplexityHeadlines: headlines,
        wealthSummary: wealth,
        sources,
        perplexityCitations: citations,
        confidence: 'High',
        lastGenerated: new Date().toISOString()
      };

      setSmartBioData(bioData);
      setOriginalBioText(headlines); // Store original Perplexity content
      setEditedBioText(headlines); // Initialize edited text with generated headlines
    } catch (error) {
      console.error('Failed to generate enhanced smart bio:', error);
      setSmartBioError(error instanceof Error ? error.message : 'Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingSmartBio(false);
      setShowSmartBioConfirmModal(false);
    }
  };

  const handleDialRClick = () => {
    setShowDialRModal(true);
  };

  const handleDialRSelection = (assignmentType: string, targetName?: string) => {
    let message = '';

    switch (assignmentType) {
      case 'my-list':
        message = `📞 Adding ${donor.name} to your personal DialR list...\n\nReady for dialing in 15 seconds`;
        break;
      case 'list-assignment':
        message = `📞 Assigning ${donor.name} to DialR list...\n\nList: "${targetName}"\nAssignment complete!`;
        break;
      case 'user-assignment':
        message = `📞 Assigning ${donor.name} to team member...\n\nAssigned to: ${targetName}\nNotification sent to user!`;
        break;
      default:
        message = `📞 Adding ${donor.name} to DialR...`;
    }

    console.log(`DialR ${assignmentType}:`, { donor: donor.name, targetName });
    alert(message);

    // Reset form state
    setSelectedList('');
    setSelectedUser('');
    setShowDialRModal(false);
  };

  // Mock existing organizational lists
  const existingLists = [
    'Major Donors 2024',
    'Monthly Sustainers',
    'Event Prospects',
    'Board Contacts',
    'VIP Supporters'
  ];

  // Mock team members
  const teamMembers = [
    'Sarah Johnson',
    'Mike Chen',
    'Emily Rodriguez',
    'David Kim',
    'Lisa Thompson'
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Custom CSS for pulse animation */}
      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          25% {
            transform: scale(1.15);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.9;
          }
          75% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
        .pulse-heart {
          animation: heartbeat 1.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Header with Pulse Check and Enterprise badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeartIcon className="w-5 h-5 text-red-500 pulse-heart" />
          <h3 className="text-lg font-semibold text-gray-900">Pulse Check</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            Enterprise
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Insights/Bio Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'insights'
                  ? 'bg-white shadow-sm text-crimson-blue'
                  : 'hover:bg-white/50 text-gray-600'
              }`}
            >
              <SparklesIcon className="w-3 h-3 inline mr-1" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'bio'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50 text-gray-600'
              }`}
              style={{
                color: activeTab === 'bio' ? '#2563eb' : undefined
              }}
            >
              <SparklesIcon className="w-3 h-3 inline mr-1" style={{ color: '#2563eb' }} />
              Smart Bio
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'insights' ? (
          <>
            {/* Estimated Wealth */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Estimated Wealth: $800k-$900k</h4>
            </div>

            {/* Four Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-lg font-bold text-gray-900">$15,200</div>
                <div className="text-xs text-gray-600">Total Given (CTD)</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-lg font-bold text-blue-600">$24,500</div>
                <div className="text-xs text-blue-600">Potential (CTD)</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-lg font-bold text-blue-600">$1,000</div>
                <div className="text-xs text-blue-600">Max Ask</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-bold text-blue-600">Next 30 Days</div>
                <div className="text-xs text-blue-600">Gift Readiness</div>
              </div>
            </div>

            {/* Progress Bar - 65% filled */}
            <div className="mb-4 relative group">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-help">
                <div
                  className="h-full w-[65%] rounded-full"
                  style={{ background: 'linear-gradient(to right, #2563eb, #ef4444)' }}
                ></div>
              </div>
              {/* Custom Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                The donor has given $15,200 of their estimated $24,500 capacity.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700">Below capacity at 62% - eligible for upgrade.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Level - Up List</span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {smartBioError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{smartBioError}</p>
              </div>
            )}


            {smartBioData ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" style={{ color: '#2563eb' }} />
                    <h3 className="text-base font-semibold text-gray-900">Enhanced Smart Bio</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSmartBioConfirmModal(true)}
                      disabled={isGeneratingSmartBio}
                      className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Bio Content */}
                <div className="p-4">
                  <div className="prose prose-sm max-w-none">
                    {/* Headlines - with editing capability */}
                    <div className="mb-3">
                      {isEditingBio ? (
                        <div className="space-y-2">
                          {editedBioText.map((headline, index) => (
                            <textarea
                              key={index}
                              value={headline}
                              onChange={(e) => {
                                const newText = [...editedBioText];
                                newText[index] = e.target.value;
                                setEditedBioText(newText);
                              }}
                              className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                              rows={2}
                            />
                          ))}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={handleSaveEditedBio}
                              className="px-3 py-1 text-white text-xs rounded transition-all duration-200 hover:shadow-md hover:scale-105"
                              style={{ backgroundColor: '#2563eb' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded transition-all duration-200 hover:bg-gray-600 hover:shadow-md hover:scale-105"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="transition-opacity duration-300 ease-out">
                          {smartBioData.perplexityHeadlines.map((headline, index) => (
                            <p key={index} className="text-gray-900 text-sm mb-2 transition-all duration-200" style={{ lineHeight: '1.6' }}>
                              {headline}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Wealth Summary */}
                    {smartBioData.wealthSummary && (
                      <div className="bg-blue-gray-50 border-l-4 pl-4 py-2 mb-3 rounded-r-md transition-all duration-200 hover:bg-blue-gray-100" style={{ borderLeftColor: '#2563eb' }}>
                        <p className="text-gray-700 text-sm font-medium">
                          {smartBioData.wealthSummary}
                        </p>
                      </div>
                    )}

                    {/* Sources and Edit Controls */}
                    <div className="flex items-center justify-between mb-3">
                      {/* Sources Button - Bottom Left */}
                      {smartBioData.perplexityCitations && smartBioData.perplexityCitations.length > 0 ? (
                        <button
                          onClick={() => setShowCitationsModal(true)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
                          style={{
                            backgroundColor: '#2563eb'
                          }}
                          title="View citation sources"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Sources ({smartBioData.perplexityCitations.length})
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No sources available</span>
                      )}

                      {/* Edit/Reset Controls - Bottom Right */}
                      {!isEditingBio && (
                        <div className="flex items-center gap-2">
                          {/* Edit Button - Icon Only */}
                          <button
                            onClick={handleEditBio}
                            className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
                            style={{
                              backgroundColor: '#2563eb'
                            }}
                            title="Edit bio content"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>


                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio Actions - Timestamp and Actions Dropdown */}
                {!isEditingBio && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium">Generated {new Date(smartBioData.lastGenerated).toLocaleDateString()}</span>

                        {/* Feedback Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePositiveFeedback}
                            disabled={feedbackGiven !== null}
                            className={`p-1 rounded transition-colors ${
                              feedbackGiven === 'positive'
                                ? 'text-blue-600 bg-blue-100'
                                : feedbackGiven === null
                                  ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={feedbackGiven ? 'Feedback already submitted' : 'This bio was helpful'}
                          >
                            <HandThumbUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNegativeFeedback}
                            disabled={feedbackGiven !== null}
                            className={`p-1 rounded transition-colors ${
                              feedbackGiven === 'negative'
                                ? 'text-red-600 bg-red-100'
                                : feedbackGiven === null
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={feedbackGiven ? 'Feedback already submitted' : 'This bio needs improvement'}
                          >
                            <HandThumbDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShowQuickActionsDropdown(!showQuickActionsDropdown)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                            Actions
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          </button>

                          {showQuickActionsDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    handleCopyToClipboard();
                                    setShowQuickActionsDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy Bio
                                </button>
                                <button
                                  onClick={() => {
                                    handleExportAsPDF();
                                    setShowQuickActionsDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Export as PDF
                                </button>
                                <button
                                  onClick={() => {
                                    handleEmailBio();
                                    setShowQuickActionsDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Email Bio
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => {
                                    handleReportIssue();
                                    setShowQuickActionsDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 flex items-center gap-3"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  Report Issue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-4 border border-gray-200" style={{background: 'linear-gradient(135deg, #ecf4ff 0%, #dbeafe 100%)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{backgroundColor: '#2563eb'}}>
                    <SparklesIcon className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Enhanced Smart Bio</h4>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Get a complete donor snapshot with intelligence you can act on.</h3>
                  <p className="text-xs text-gray-600 mb-4">See what matters most: recent news, issue alignment, and<br />wealth signals, summarized for action.</p>
                  <button
                    onClick={() => setShowSmartBioConfirmModal(true)}
                    disabled={isGeneratingSmartBio}
                    className="text-white text-xs font-semibold py-2 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                    style={{background: '#2563eb'}}
                    onMouseEnter={(e) => !isGeneratingSmartBio && (e.currentTarget.style.background = '#1d4ed8')}
                    onMouseLeave={(e) => !isGeneratingSmartBio && (e.currentTarget.style.background = '#2563eb')}
                  >
                    {isGeneratingSmartBio ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-3 h-3 inline mr-1" />
                        Create Enhanced Bio
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>



      {/* DialR Modal - Smart Segments Pattern */}
      {showDialRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Add to DialR</h3>
                  <p className="text-sm text-gray-600 mt-1">1 contact from "Pulse Check Insights"</p>
                </div>
                <button
                  onClick={() => setShowDialRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4 text-sm">
                  Select a DialR list to add this donor for phone outreach campaigns.
                </p>

                <div className="space-y-3">
                  {/* Add to My List - Blue bordered section */}
                  <button
                    onClick={() => handleDialRSelection('my-list')}
                    className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="text-lg font-medium text-gray-900">Add to My List</div>
                        <div className="text-sm text-gray-600">Add to your personal call list</div>
                      </div>
                    </div>
                  </button>

                  {/* Or divider */}
                  <div className="text-center text-gray-500 text-sm mb-4">or</div>

                  {/* Assign to List */}
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Assign to List</h4>
                    <select
                      value={selectedList}
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a list...</option>
                      {existingLists.map((list) => (
                        <option key={list} value={list}>{list}</option>
                      ))}
                    </select>
                    {selectedList && (
                      <button
                        onClick={() => handleDialRSelection('list-assignment', selectedList)}
                        className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Assign to {selectedList}
                      </button>
                    )}
                  </div>

                  {/* Assign to User */}
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Assign to User</h4>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a user...</option>
                      {teamMembers.map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                    {selectedUser && (
                      <button
                        onClick={() => handleDialRSelection('user-assignment', selectedUser)}
                        className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Assign to {selectedUser}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancel button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDialRModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Bio Confirmation Modal */}
      {showSmartBioConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Enhanced Smart Bio</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will generate a comprehensive bio using AI research from multiple sources.
              The process may take 30-60 seconds and costs approximately $0.02.
            </p>
            <div className="flex gap-3">
              <button
                onClick={generateEnhancedSmartBio}
                disabled={isGeneratingSmartBio}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{backgroundColor: '#2563eb'}}
                onMouseEnter={(e) => !isGeneratingSmartBio && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !isGeneratingSmartBio && (e.currentTarget.style.backgroundColor = '#2563eb')}
              >
                {isGeneratingSmartBio ? 'Generating...' : 'Generate Bio'}
              </button>
              <button
                onClick={() => setShowSmartBioConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citations Modal */}
      {showCitationsModal && smartBioData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Citation Sources</h3>
              <button
                onClick={() => setShowCitationsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {getVisibleCitations().length > 0 ? (
              <div className="space-y-3">
                {getVisibleCitations().map((citation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{citation.title}</h4>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all"
                        >
                          {citation.url}
                        </a>
                      </div>
                      <button
                        onClick={() => handleHideCitation(citation)}
                        className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Hide this citation"
                      >
                        <EyeSlashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No citations available</p>
            )}

            {getHiddenCitations().length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowHiddenSources(!showHiddenSources)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-3"
                >
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showHiddenSources ? 'rotate-180' : ''}`} />
                  Hidden Sources ({getHiddenCitations().length})
                </button>

                {showHiddenSources && (
                  <div className="space-y-2">
                    {getHiddenCitations().map((citation, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-700 mb-1">{citation.title}</h4>
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all"
                            >
                              {citation.url}
                            </a>
                            <div className="mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                citation.isPermanent
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {citation.isPermanent ? 'Permanently Hidden' : 'Hidden This Session'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRestoreCitation(citation.url, citation.isPermanent)}
                            className="ml-3 p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Restore this citation"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hide Citation Confirmation Modal */}
      {showHideCitationModal && citationToHide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hide Citation</h3>
            <p className="text-sm text-gray-600 mb-4">
              How would you like to hide "{citationToHide.title}"?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => confirmHideCitation(false)}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-left"
              >
                <div className="font-medium">Hide for this session only</div>
                <div className="text-sm opacity-75">Will reappear when you refresh the page</div>
              </button>
              <button
                onClick={() => confirmHideCitation(true)}
                className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-left"
              >
                <div className="font-medium">Hide permanently</div>
                <div className="text-sm opacity-75">Will remain hidden until manually restored</div>
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowHideCitationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negative Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Improve Smart Bio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Help us improve by telling us what was wrong with this bio:
            </p>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="What could be improved? (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={submitNegativeFeedback}
                className="flex-1 px-4 py-2 bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {showFeedbackToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <HandThumbUpIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Thank you for your feedback!</h4>
              <p className="text-xs text-gray-600">Your input helps us improve the Smart Bio feature.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DonorProfileLayoutTest3Props {
  donor: Donor;
  customAIInsights?: React.ReactNode;
}

const DonorProfileLayoutTest3: React.FC<DonorProfileLayoutTest3Props> = ({ donor, customAIInsights }) => {
  // Use Enterprise AI Insights by default for Test 3 profiles
  const defaultAIInsights = <EnterpriseAIInsights donor={donor} />;
  // Tab state - updated to match existing donor profile tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'contact-insights' | 'enriched' | 'donor-discovery' | 'fec-insights' | 'donations' | 'actions' | 'more'>('overview');
  const [activeMoreTab, setActiveMoreTab] = useState<'codes' | 'moves' | 'tasks' | 'events'>('events');
  const [activeAITab, setActiveAITab] = useState<'insights' | 'bio'>('insights');

  // Enhanced Data state management
  const [isDataEnhanced, setIsDataEnhanced] = useState(false);
  const [showEnhancementModal, setShowEnhancementModal] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // FEC Insights state management
  const [fecInsightsGenerated, setFecInsightsGenerated] = useState(false);
  const [activeFecView, setActiveFecView] = useState<'committees' | 'timeline'>('committees');
  const [showAllCommittees, setShowAllCommittees] = useState(false);
  const [expandedCommittees, setExpandedCommittees] = useState<Set<string>>(new Set());
  const [committeeTransactionPages, setCommitteeTransactionPages] = useState<Record<string, number>>({});

  // Contact Insights state management
  const [showDialRLogModal, setShowDialRLogModal] = useState(false);
  const [showTargetPathLogModal, setShowTargetPathLogModal] = useState(false);

  // Contact Insights panel management
  const [contactInsightsPanelOrder, setContactInsightsPanelOrder] = useState([
    'communication-intelligence',
    'targetpath-insights',
    'dialr-insights',
    'patterns-triggers'
  ]);

  // Track which panels are on left vs right side
  const [leftSidePanels, setLeftSidePanels] = useState(new Set(['communication-intelligence', 'targetpath-insights', 'dialr-insights']));
  const [rightSidePanels, setRightSidePanels] = useState(new Set(['patterns-triggers']));

  // Gift modal state
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [giftModalMode, setGiftModalMode] = useState<'view' | 'add' | 'edit'>('view');

  // Moves Management modal state
  const [showMovesModal, setShowMovesModal] = useState(false);
  const [minimizedContactPanels, setMinimizedContactPanels] = useState<Set<string>>(new Set());
  const [draggedContactPanel, setDraggedContactPanel] = useState<string | null>(null);

  // Enhanced data - only show if user has confirmed enhancement
  const enrichedData = isDataEnhanced ? getEnrichedData(donor.id) : null;

  // Enhanced Data handlers
  const handleEnhanceDataClick = () => {
    setShowEnhancementModal(true);
  };

  const handleConfirmEnhancement = () => {
    setIsEnhancing(true);
    setShowEnhancementModal(false);

    // Simulate API call delay
    setTimeout(() => {
      setIsDataEnhanced(true);
      setIsEnhancing(false);
    }, 2000);
  };

  const handleCancelEnhancement = () => {
    setShowEnhancementModal(false);
  };

  // Drag and drop state for sidebar panels
  const [panelOrder, setPanelOrder] = useState([
    'smartTags', 'contact', 'relationships', 'codes', 'tasks', 'experts', 'notes'
  ]);

  // Collapsible panels state
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set());

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'personal' | 'contact' | 'address' | 'professional' | 'relationship'>('personal');
  const [isCodesModalOpen, setIsCodesModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  // Enhanced Smart Bio state
  const [smartBioData, setSmartBioData] = useState<SmartBioData | null>(null);
  const [isGeneratingSmartBio, setIsGeneratingSmartBio] = useState(false);
  const [showSmartBioConfirmModal, setShowSmartBioConfirmModal] = useState(false);
  const [smartBioError, setSmartBioError] = useState('');
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [originalBioText, setOriginalBioText] = useState<string[]>([]);
  const [editedBioText, setEditedBioText] = useState<string[]>([]);

  // Citation hide/exclude state
  const [hiddenCitations, setHiddenCitations] = useState<Set<string>>(new Set());
  const [permanentlyHiddenCitations, setPermanentlyHiddenCitations] = useState<Set<string>>(new Set());
  const [showHiddenSources, setShowHiddenSources] = useState(false);
  const [showHideCitationModal, setShowHideCitationModal] = useState(false);
  const [citationToHide, setCitationToHide] = useState<{title: string; url: string} | null>(null);

  // User feedback system state
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [showQuickActionsDropdown, setShowQuickActionsDropdown] = useState(false);

  // Load permanently hidden citations from localStorage on component mount
  useEffect(() => {
    const savedHiddenCitations = localStorage.getItem(`hiddenCitations_${donor.id}`);
    if (savedHiddenCitations) {
      try {
        const hiddenUrls = JSON.parse(savedHiddenCitations);
        setPermanentlyHiddenCitations(new Set(hiddenUrls));
      } catch (error) {
        console.error('Failed to load hidden citations from localStorage:', error);
      }
    }
  }, [donor.id]);

  // Citation hide/exclude functions
  const handleHideCitation = (citation: {title: string; url: string}) => {
    setCitationToHide(citation);
    setShowHideCitationModal(true);
  };

  const confirmHideCitation = (permanent: boolean) => {
    if (!citationToHide) return;

    if (permanent) {
      // Add to permanently hidden citations
      const newPermanentlyHidden = new Set(permanentlyHiddenCitations);
      newPermanentlyHidden.add(citationToHide.url);
      setPermanentlyHiddenCitations(newPermanentlyHidden);

      // Save to localStorage
      const hiddenUrls = Array.from(newPermanentlyHidden);
      localStorage.setItem(`hiddenCitations_${donor.id}`, JSON.stringify(hiddenUrls));
    } else {
      // Add to session-only hidden citations
      const newHidden = new Set(hiddenCitations);
      newHidden.add(citationToHide.url);
      setHiddenCitations(newHidden);
    }

    setShowHideCitationModal(false);
    setCitationToHide(null);
  };

  const handleRestoreCitation = (url: string, permanent: boolean) => {
    if (permanent) {
      const newPermanentlyHidden = new Set(permanentlyHiddenCitations);
      newPermanentlyHidden.delete(url);
      setPermanentlyHiddenCitations(newPermanentlyHidden);

      // Update localStorage
      const hiddenUrls = Array.from(newPermanentlyHidden);
      localStorage.setItem(`hiddenCitations_${donor.id}`, JSON.stringify(hiddenUrls));
    } else {
      const newHidden = new Set(hiddenCitations);
      newHidden.delete(url);
      setHiddenCitations(newHidden);
    }
  };

  // Get visible and hidden citations
  const getVisibleCitations = () => {
    if (!smartBioData?.perplexityCitations) return [];
    return smartBioData.perplexityCitations.filter(citation =>
      !hiddenCitations.has(citation.url) && !permanentlyHiddenCitations.has(citation.url)
    );
  };

  const getHiddenCitations = () => {
    if (!smartBioData?.perplexityCitations) return [];
    return smartBioData.perplexityCitations.filter(citation =>
      hiddenCitations.has(citation.url) || permanentlyHiddenCitations.has(citation.url)
    ).map(citation => ({
      ...citation,
      isPermanent: permanentlyHiddenCitations.has(citation.url)
    }));
  };

  // User feedback functions
  const handlePositiveFeedback = () => {
    if (feedbackGiven) return; // Prevent multiple submissions

    setFeedbackGiven('positive');
    setShowFeedbackToast(true);

    // Store feedback data
    const feedbackData = {
      donorId: donor.id,
      timestamp: new Date().toISOString(),
      feedbackType: 'positive',
      bioGenerated: smartBioData?.lastGenerated
    };

    // Save to localStorage for localhost testing
    const existingFeedback = JSON.parse(localStorage.getItem('smartBioFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('smartBioFeedback', JSON.stringify(existingFeedback));

    console.log('✅ Positive feedback recorded:', feedbackData);

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setShowFeedbackToast(false), 3000);
  };

  const handleNegativeFeedback = () => {
    if (feedbackGiven) return; // Prevent multiple submissions

    setFeedbackGiven('negative');
    setShowFeedbackModal(true);
  };

  const submitNegativeFeedback = () => {
    const feedbackData = {
      donorId: donor.id,
      timestamp: new Date().toISOString(),
      feedbackType: 'negative',
      comment: feedbackComment.trim(),
      bioGenerated: smartBioData?.lastGenerated
    };

    // Save to localStorage for localhost testing
    const existingFeedback = JSON.parse(localStorage.getItem('smartBioFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('smartBioFeedback', JSON.stringify(existingFeedback));

    console.log('📝 Negative feedback recorded:', feedbackData);

    setShowFeedbackModal(false);
    setFeedbackComment('');
    setShowFeedbackToast(true);

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setShowFeedbackToast(false), 3000);
  };

  // Notes state (moved to sidebar panel)
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // Events state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Donor Discovery/Lookalike state
  const [lookalikeExpanded, setLookalikeExpanded] = useState(false);
  const [showAISuggested, setShowAISuggested] = useState(false);
  const [lookalikeFilters, setLookalikeFilters] = useState({
    location: 'all',
    givingRange: 'all',
    demographics: 'all'
  });
  const [selectedLookalikes, setSelectedLookalikes] = useState<any[]>([]);
  const [selectAllLookalikes, setSelectAllLookalikes] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // DialR Integration state
  const [showDialRModal, setShowDialRModal] = useState(false);

  // Address Book state
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [activeContactTab, setActiveContactTab] = useState<'addresses' | 'phones' | 'emails'>('addresses');
  const [editFormData, setEditFormData] = useState({
    // Personal Information
    prefix: donor.prefix || 'Mr.',
    firstName: donor.firstName || 'Joseph',
    middleName: donor.middleName || 'M.',
    lastName: donor.lastName || 'Banks',
    suffix: donor.suffix || 'Sr.',
    preferredName: donor.preferredName || '',
    dateOfBirth: donor.dateOfBirth || '1/1/1969',
    gender: donor.gender || '',

    // Contact Details
    primaryEmail: donor.email || donor.contactInfo?.email || '',
    secondaryEmail: donor.secondaryEmail || '',
    homePhone: donor.homePhone || '(123) 456-7890',
    mobilePhone: donor.mobilePhone || '(724) 393-1999',
    workPhone: donor.workPhone || '(717) 888-9172',
    fax: donor.fax || '404.393.7654',

    // Address Information
    street: donor.primaryAddress?.street || '1909 E Bethany Home Rd',
    additionalAddressLine1: donor.primaryAddress?.additionalLine1 || '',
    additionalAddressLine2: donor.primaryAddress?.additionalLine2 || '',
    city: donor.primaryAddress?.city || 'Phoenix',
    state: donor.primaryAddress?.state || 'AZ',
    zipCode: donor.primaryAddress?.zipCode || '85016',
    addressType: donor.primaryAddress?.type || 'Home',

    // Professional Details
    jobTitle: donor.jobTitle || 'Chief Operating Officer',
    company: donor.company || 'Banks Financial Group',
    department: donor.department || '',
    industry: donor.industry || '',
    linkedinProfile: donor.linkedinProfile || '',
    website: donor.website || 'www.cmdi.com',

    // Relationship Information
    spouse: donor.spouse || 'Ellen',
    relationshipStatus: donor.relationshipStatus || '',

    // Social Media & Online Presence
    facebook: donor.facebook || 'https://www.facebook.com/cmdi.crimso',
    twitter: donor.twitter || 'https://twitter.com/CrimsonCRM',

    // Preferences
    communicationPreferences: donor.communicationPreferences || [],
    preferredContactMethod: donor.preferredContactMethod || 'Email',
    languagePreference: donor.languagePreference || 'English'
  });

  // Toggle panel collapse
  const togglePanelCollapse = (panelId: string) => {
    setCollapsedPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(panelId)) {
        newSet.delete(panelId);
      } else {
        newSet.add(panelId);
      }
      return newSet;
    });
  };

  // Edit modal handlers
  const handleEditClick = () => {
    setIsEditModalOpen(true);
    setActiveModalTab('personal'); // Reset to first tab when opening
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setActiveModalTab('personal'); // Reset tab when closing
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormSave = () => {
    // In a real implementation, this would save to the backend
    console.log('Saving donor profile:', editFormData);
    setIsEditModalOpen(false);
    // You could update the donor object here or trigger a refetch
  };
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);

  // Drag and drop state for overview panels
  const [overviewPanelOrder, setOverviewPanelOrder] = useState([
    'aiInsights', 'recentActivity', 'givingSummary', 'movesManagement'
  ]);
  const [draggedOverviewPanel, setDraggedOverviewPanel] = useState<string | null>(null);
  const [minimizedOverviewPanels, setMinimizedOverviewPanels] = useState<Set<string>>(new Set());

  // Helper functions
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Get smart tags for this donor based on their profile
  const getSmartTags = () => {
    const tags = [];

    // Big Givers - donors who gave above $500 in last 12 months
    if (donor.givingOverview?.totalRaised > 500) {
      tags.push({ name: 'Big Givers', emoji: '💰', color: '#10B981' });
    }

    // Prime Persuadables - FL residents, Age 35-44, or high engagement
    if (donor.primaryAddress?.state === 'FL' || donor.name.includes('Joseph')) {
      tags.push({ name: 'Prime Persuadables', emoji: '🎯', color: '#8B5CF6' });
    }

    // New & Rising Donors - recent first-time donors or upgrades
    if (donor.givingOverview?.consecutiveGifts <= 3) {
      tags.push({ name: 'New & Rising Donors', emoji: '⚡', color: '#3B82F6' });
    }

    return tags;
  };

  // Classification code color mapping (matching SmartTags light background pattern)
  const getCodeColorClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700 border-red-300';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'cyan': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'green': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // FEC Insights helper functions
  const toggleCommitteeExpansion = (committeeName: string) => {
    const newExpanded = new Set(expandedCommittees);
    if (newExpanded.has(committeeName)) {
      newExpanded.delete(committeeName);
    } else {
      newExpanded.add(committeeName);
      // Initialize pagination for this committee if not already set
      if (!committeeTransactionPages[committeeName]) {
        setCommitteeTransactionPages(prev => ({ ...prev, [committeeName]: 1 }));
      }
    }
    setExpandedCommittees(newExpanded);
  };

  const getTransactionPage = (committeeName: string) => {
    return committeeTransactionPages[committeeName] || 1;
  };

  const setTransactionPage = (committeeName: string, page: number) => {
    setCommitteeTransactionPages(prev => ({ ...prev, [committeeName]: page }));
  };

  const getPagedTransactions = (transactions: any[], page: number, pageSize: number = 5) => {
    const startIndex = (page - 1) * pageSize;
    return transactions.slice(startIndex, startIndex + pageSize);
  };

  const getTotalPages = (totalItems: number, pageSize: number = 5) => {
    return Math.ceil(totalItems / pageSize);
  };

  const handleGenerateFecInsights = () => {
    // Simulate FEC insights generation
    setFecInsightsGenerated(true);
  };

  // Helper function to format last contact date
  const formatLastContact = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Contact Insights panel management functions
  const toggleContactPanelMinimized = (panelId: string) => {
    const newMinimized = new Set(minimizedContactPanels);
    if (newMinimized.has(panelId)) {
      newMinimized.delete(panelId);
    } else {
      newMinimized.add(panelId);
    }
    setMinimizedContactPanels(newMinimized);
  };

  const handleContactPanelDragStart = (panelId: string) => {
    setDraggedContactPanel(panelId);
  };

  const handleContactPanelDragOver = (e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault();
    // Only prevent default, don't update order here to avoid double updates
  };

  const handleContactPanelDrop = (e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault();
    if (!draggedContactPanel || draggedContactPanel === targetPanelId) return;

    const newOrder = [...contactInsightsPanelOrder];
    const draggedIndex = newOrder.indexOf(draggedContactPanel);
    const targetIndex = newOrder.indexOf(targetPanelId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedContactPanel);
      setContactInsightsPanelOrder(newOrder);

      // Update side assignments based on target panel's side
      const newLeftSide = new Set(leftSidePanels);
      const newRightSide = new Set(rightSidePanels);

      // Remove dragged panel from both sides
      newLeftSide.delete(draggedContactPanel);
      newRightSide.delete(draggedContactPanel);

      // Add to same side as target panel
      if (leftSidePanels.has(targetPanelId)) {
        newLeftSide.add(draggedContactPanel);
      } else {
        newRightSide.add(draggedContactPanel);
      }

      setLeftSidePanels(newLeftSide);
      setRightSidePanels(newRightSide);
    }

    setDraggedContactPanel(null);
  };

  const handleContactPanelDragEnd = () => {
    setDraggedContactPanel(null);
  };

  // Gift modal handlers
  const handleViewGift = (gift: any) => {
    setSelectedGift(gift);
    setGiftModalMode('view');
    setShowGiftModal(true);
  };

  const handleAddGift = () => {
    setSelectedGift(null);
    setGiftModalMode('add');
    setShowGiftModal(true);
  };

  const handleEditGift = (gift: any) => {
    setSelectedGift(gift);
    setGiftModalMode('edit');
    setShowGiftModal(true);
  };

  const handleCloseGiftModal = () => {
    setShowGiftModal(false);
    setSelectedGift(null);
  };

  // Dynamic cycle breakdown data - this would come from donor data in real app
  const getCycleBreakdown = () => {
    // This would be dynamic based on donor's actual fund codes
    const cycles = [
      { code: 'P2024', type: 'Primary', amount: 3750, status: 'excessive', remaining: -450 },
      { code: 'G2024', type: 'General', amount: 474.56, status: 'remaining', remaining: 2825.44 },
      { code: 'G2022', type: 'General', amount: 230, status: 'remaining', remaining: 2670 },
      { code: 'CDUIT', type: 'Committee', amount: 25, status: 'none', remaining: 0 }
    ];

    // Filter out cycles with no activity if needed
    return cycles.filter(cycle => cycle.amount > 0);
  };

  // Tasks data structure
  const tasksData = useMemo(() => ({
    summary: {
      open: 1,
      inProgress: 0,
      completed: 9,
      total: 10
    },
    tasks: [
      {
        id: 1,
        done: false,
        due: '9/29/26',
        dueDate: new Date('2026-09-29'),
        for: 'Sofia Amaya',
        by: 'Charles Logan',
        type: 'Meeting',
        priority: 'High',
        subject: 'Test 123',
        description: 'Schedule and conduct quarterly review meeting',
        askAmount: null
      },
      {
        id: 2,
        done: false,
        due: '12/15/24',
        dueDate: new Date('2024-12-15'),
        for: 'Joseph Banks',
        by: 'Sofia Amaya',
        type: 'Follow-up',
        priority: 'High',
        subject: 'Year-end ask',
        description: 'Follow up on year-end giving opportunity discussion',
        askAmount: 25000
      },
      {
        id: 3,
        done: true,
        due: '5/28/25',
        dueDate: new Date('2025-05-28'),
        for: 'Brooke Taylor',
        by: 'Brooke Taylor',
        type: 'Call',
        priority: 'Low',
        subject: 'Call sheet',
        description: 'Complete donor call sheet preparation',
        askAmount: null
      },
      {
        id: 4,
        done: true,
        due: '5/10/25',
        dueDate: new Date('2025-05-10'),
        for: 'Brooke Taylor',
        by: 'Brooke Taylor',
        type: 'Call',
        priority: 'High',
        subject: 'Follow Up Call',
        description: 'Follow up call after major gift proposal',
        askAmount: 15000
      },
      {
        id: 5,
        done: true,
        due: '6/8/24',
        dueDate: new Date('2024-06-08'),
        for: 'Brooke Taylor',
        by: 'Brooke Taylor',
        type: 'Email',
        priority: 'Medium',
        subject: 'Thank you note',
        description: 'Send personalized thank you for recent contribution',
        askAmount: null
      }
    ]
  }), []);

  // Get most recent open task for panel display
  const getMostRecentOpenTask = () => {
    const openTasks = tasksData.tasks.filter(task => !task.done);
    if (openTasks.length === 0) return null;

    // Sort by due date (earliest first)
    return openTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  };

  // Mock Notes Data
  const [notesData, setNotesData] = useState([
    {
      id: 1,
      title: 'Initial Contact Meeting',
      content: 'Had a great conversation about their interest in education initiatives. They mentioned wanting to support scholarship programs and are particularly interested in STEM education for underserved communities.',
      category: 'meeting',
      date: '12/10/24',
      author: 'Sarah Johnson',
      isImportant: true
    },
    {
      id: 2,
      title: 'Follow-up Call',
      content: 'Called to discuss the scholarship proposal. They are very interested and want to review the detailed budget. Mentioned they prefer quarterly giving rather than annual lump sum.',
      category: 'call',
      date: '12/5/24',
      author: 'Mike Chen',
      isImportant: false
    },
    {
      id: 3,
      title: 'Event Attendance',
      content: 'Attended the annual gala and spoke with them about expanding their giving. They expressed interest in joining the major donors circle.',
      category: 'event',
      date: '11/28/24',
      author: 'Lisa Rodriguez',
      isImportant: true
    }
  ]);

  // Mock Events Data
  const [eventsData, setEventsData] = useState([
    {
      id: 1,
      title: 'Annual Scholarship Gala',
      description: 'Annual fundraising gala for scholarship programs. VIP table reserved.',
      type: 'event',
      date: '1/15/25',
      time: '6:00 PM',
      location: 'Grand Ballroom, Downtown Hotel',
      status: 'confirmed',
      attendees: 8,
      createdBy: 'Event Team'
    },
    {
      id: 2,
      title: 'Donor Stewardship Meeting',
      description: 'Quarterly check-in meeting to discuss giving impact and future opportunities.',
      type: 'meeting',
      date: '1/8/25',
      time: '2:00 PM',
      location: 'Conference Room A',
      status: 'confirmed',
      attendees: 3,
      createdBy: 'Sarah Johnson'
    },
    {
      id: 3,
      title: 'Campus Tour',
      description: 'Private campus tour to show new facilities funded by their previous gifts.',
      type: 'tour',
      date: '12/20/24',
      time: '10:00 AM',
      location: 'Main Campus',
      status: 'pending',
      attendees: 2,
      createdBy: 'Development Office'
    }
  ]);

  // Mock Address Book Data
  const [contactsData, setContactsData] = useState([
    {
      id: 1,
      type: 'primary',
      firstName: 'Joseph',
      lastName: 'Banks',
      title: 'Mr.',
      email: 'joseph.banks@email.com',
      phone: '(555) 123-4567',
      mobile: '(555) 987-6543',
      address: {
        street: '987 Neighborhood Ave',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'USA'
      },
      company: 'Banks Financial Group',
      position: 'Senior Partner',
      notes: 'Primary contact for all communications',
      isPrimary: true,
      createdDate: '2024-01-15',
      lastUpdated: '2024-02-10'
    },
    {
      id: 2,
      type: 'spouse',
      firstName: 'Margaret',
      lastName: 'Banks',
      title: 'Mrs.',
      email: 'margaret.banks@email.com',
      phone: '(555) 123-4567',
      mobile: '(555) 876-5432',
      address: {
        street: '987 Neighborhood Ave',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'USA'
      },
      company: 'Springfield Community Foundation',
      position: 'Board Member',
      notes: 'Spouse - involved in foundation work',
      isPrimary: false,
      createdDate: '2024-01-15',
      lastUpdated: '2024-02-05'
    },
    {
      id: 3,
      type: 'business',
      firstName: 'Robert',
      lastName: 'Chen',
      title: 'Dr.',
      email: 'r.chen@banksfinancial.com',
      phone: '(555) 234-5678',
      mobile: '(555) 345-6789',
      address: {
        street: '123 Business Plaza',
        city: 'Springfield',
        state: 'IL',
        zip: '62702',
        country: 'USA'
      },
      company: 'Banks Financial Group',
      position: 'Associate Partner',
      notes: 'Business associate and secondary contact',
      isPrimary: false,
      createdDate: '2024-01-20',
      lastUpdated: '2024-02-01'
    }
  ]);

  // Mock Lookalike Data
  const allLookalikes = useMemo(() => [
    {
      id: 1,
      name: 'Sarah Mitchell',
      location: 'Austin, TX',
      avgGift: 750,
      totalGiven: 3200,
      lastGift: '2024-01-15',
      similarityScore: 92,
      demographics: 'Female, 45-54, Professional',
      givingPattern: 'Quarterly, Education Focus',
      email: 'sarah.mitchell@email.com',
      phone: '(512) 555-0123'
    },
    {
      id: 2,
      name: 'David Chen',
      location: 'Dallas, TX',
      avgGift: 1200,
      totalGiven: 8400,
      lastGift: '2024-02-08',
      similarityScore: 89,
      demographics: 'Male, 35-44, Tech Executive',
      givingPattern: 'Annual, STEM Programs',
      email: 'david.chen@email.com',
      phone: '(214) 555-0456'
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      location: 'Houston, TX',
      avgGift: 500,
      totalGiven: 2500,
      lastGift: '2024-01-22',
      similarityScore: 87,
      demographics: 'Female, 55-64, Healthcare',
      givingPattern: 'Monthly, Healthcare Focus',
      email: 'maria.rodriguez@email.com',
      phone: '(713) 555-0789'
    },
    {
      id: 4,
      name: 'James Wilson',
      location: 'San Antonio, TX',
      avgGift: 900,
      totalGiven: 5400,
      lastGift: '2024-01-30',
      similarityScore: 85,
      demographics: 'Male, 45-54, Finance',
      givingPattern: 'Bi-annual, General Fund',
      email: 'james.wilson@email.com',
      phone: '(210) 555-0321'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      location: 'Fort Worth, TX',
      avgGift: 650,
      totalGiven: 3900,
      lastGift: '2024-02-12',
      similarityScore: 83,
      demographics: 'Female, 35-44, Education',
      givingPattern: 'Quarterly, Scholarship Fund',
      email: 'lisa.thompson@email.com',
      phone: '(817) 555-0654'
    },
    // Add more lookalikes for demonstration
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 6,
      name: `Donor ${i + 6}`,
      location: ['Austin, TX', 'Dallas, TX', 'Houston, TX', 'San Antonio, TX'][i % 4],
      avgGift: 300 + Math.floor(Math.random() * 1000),
      totalGiven: 1000 + Math.floor(Math.random() * 5000),
      lastGift: '2024-01-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
      similarityScore: 70 + Math.floor(Math.random() * 15),
      demographics: ['Male, 25-34, Tech', 'Female, 45-54, Business', 'Male, 55-64, Retired'][i % 3],
      givingPattern: ['Monthly', 'Quarterly', 'Annual'][i % 3] + ', Various',
      email: `donor${i + 6}@email.com`,
      phone: `(555) 555-${String(i + 6).padStart(4, '0')}`
    }))
  ], []);

  const aiSuggestedLookalikes = useMemo(() => {
    return allLookalikes.filter(l => l.similarityScore >= 85).slice(0, 25);
  }, [allLookalikes]);

  // Filter lookalikes based on current filters
  const filteredLookalikes = useMemo(() => {
    return allLookalikes.filter(lookalike => {
      if (lookalikeFilters.location !== 'all' && !lookalike.location.includes(lookalikeFilters.location)) {
        return false;
      }
      if (lookalikeFilters.givingRange !== 'all') {
        const avgGift = lookalike.avgGift;
        switch (lookalikeFilters.givingRange) {
          case 'under500':
            if (avgGift >= 500) return false;
            break;
          case '500-1000':
            if (avgGift < 500 || avgGift > 1000) return false;
            break;
          case 'over1000':
            if (avgGift <= 1000) return false;
            break;
        }
      }
      return true;
    });
  }, [allLookalikes, lookalikeFilters]);

  // Get current visible lookalikes based on filters and AI suggested state
  const getCurrentLookalikes = useMemo(() => {
    return showAISuggested ? aiSuggestedLookalikes : filteredLookalikes;
  }, [showAISuggested, aiSuggestedLookalikes, filteredLookalikes]);

  // Enhanced Smart Bio generation with multiple data sources
  const generateEnhancedSmartBio = async () => {
    setIsGeneratingSmartBio(true);
    setSmartBioError('');

    try {
      // Run all API calls in parallel with timeout handling
      // Original version - 2025-01-06: included FEC integration
      const [perplexityHeadlines, wealthSummary] = await Promise.allSettled([
        generatePerplexityHeadlines(donor),
        Promise.resolve(generateWealthSummary(donor)) // Wrap sync function in Promise
      ]);

      // Extract results with fallbacks for failed promises
      const perplexityResult = perplexityHeadlines.status === 'fulfilled'
        ? perplexityHeadlines.value
        : { headlines: [`${donor.name} is a political donor with available public records.`], citations: [] };

      const headlines = perplexityResult.headlines;
      const citations = perplexityResult.citations;

      const wealth = wealthSummary.status === 'fulfilled'
        ? wealthSummary.value
        : '';

      // 4. Compile sources (removed FEC integration as requested)
      const sources = [
        { name: 'Perplexity', url: 'https://www.perplexity.ai' },
        ...(wealth ? [{ name: 'i360 Internal Data', url: '#' }] : [])
      ];

      const bioData: SmartBioData = {
        perplexityHeadlines: headlines,
        wealthSummary: wealth,
        sources,
        perplexityCitations: citations,
        confidence: 'High',
        lastGenerated: new Date().toISOString()
      };

      setSmartBioData(bioData);
      setOriginalBioText(headlines); // Store original Perplexity content
      setEditedBioText(headlines); // Initialize edited text with generated headlines
    } catch (error) {
      console.error('Failed to generate enhanced smart bio:', error);
      setSmartBioError(error instanceof Error ? error.message : 'Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingSmartBio(false);
      setShowSmartBioConfirmModal(false);
    }
  };

  // Bio Review Process Functions
  const handleEditBio = () => {
    setIsEditingBio(true);
    console.log('✏️ Editing bio');
  };

  const handleResetBio = () => {
    setEditedBioText(originalBioText);
    if (smartBioData) {
      const updatedBioData = {
        ...smartBioData,
        perplexityHeadlines: originalBioText
      };
      setSmartBioData(updatedBioData);
    }
    console.log('🔄 Bio reset to original Perplexity content');
  };

  const handleSaveEditedBio = () => {
    if (smartBioData) {
      const updatedBioData = {
        ...smartBioData,
        perplexityHeadlines: editedBioText
      };
      setSmartBioData(updatedBioData);
      setIsEditingBio(false);
      console.log('✅ Edited bio saved:', editedBioText);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBio(false);
    setEditedBioText(smartBioData?.perplexityHeadlines || []);
    console.log('❌ Edit cancelled');
  };

  // Quick Actions Toolbar Functions
  const handleCopyToClipboard = async () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const fullText = `${bioText}\n\n${smartBioData.wealthSummary ? `Wealth: ${smartBioData.wealthSummary}` : ''}`;

      try {
        await navigator.clipboard.writeText(fullText);
        console.log('✅ Bio copied to clipboard');
      } catch (error) {
        console.error('❌ Failed to copy to clipboard:', error);
      }
    }
  };

  const handleExportAsPDF = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const content = `
        Smart Bio - ${donor.name}
        Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}

        ${bioText}

        ${smartBioData.wealthSummary ? `Wealth Summary: ${smartBioData.wealthSummary}` : ''}

        Sources:
        ${smartBioData.perplexityCitations.map((citation, index) =>
          `${index + 1}. ${citation.title}: ${citation.url}`
        ).join('\n')}
      `;

      // Create a new window with the content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Smart Bio - ${donor.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
                .sources { margin-top: 30px; }
                .sources h3 { color: #333; }
                .sources ol { padding-left: 20px; }
              </style>
            </head>
            <body>
              <h1>Smart Bio - ${donor.name}</h1>
              <div class="meta">Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}</div>
              <p>${bioText}</p>
              ${smartBioData.wealthSummary ? `<p><strong>Wealth Summary:</strong> ${smartBioData.wealthSummary}</p>` : ''}
              <div class="sources">
                <h3>Sources:</h3>
                <ol>
                  ${smartBioData.perplexityCitations.map(citation =>
                    `<li><strong>${citation.title}:</strong> <a href="${citation.url}" target="_blank">${citation.url}</a></li>`
                  ).join('')}
                </ol>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };



  const handleEmailBio = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const subject = `Smart Bio - ${donor.name}`;
      const body = `Smart Bio for ${donor.name}
Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}

${bioText}

${smartBioData.wealthSummary ? `Wealth Summary: ${smartBioData.wealthSummary}` : ''}

Sources:
${smartBioData.perplexityCitations.map((citation, index) =>
  `${index + 1}. ${citation.title}: ${citation.url}`
).join('\n')}`;

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  const handleReportIssue = () => {
    if (smartBioData) {
      const bioText = smartBioData.perplexityHeadlines.join(' ');
      const subject = 'Incorrect Bio';
      const body = `I would like to report an issue with the generated bio for the following donor:

Name: ${donor.name}
Email: ${donor.email || 'Not provided'}
Organization: ${donor.employment?.employer || 'Not provided'}

Generated Bio:
${bioText}

[Please describe the issue with the bio]

Generated: ${new Date(smartBioData.lastGenerated).toLocaleDateString()}`;

      const mailtoLink = `mailto:Support@cmdi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  // Generate Perplexity headlines using backend API route
  const generatePerplexityHeadlines = async (donor: Donor): Promise<{headlines: string[], citations: Array<{title: string, url: string}>}> => {
    try {
      console.log('🔍 Generating bio for:', donor.name, 'at', donor.employment?.employer || 'Unknown employer');

      // Call our backend API server instead of Perplexity directly
      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://crimson-ai-crm-v3-net.onrender.com'}/api/generate-bio`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: donor.name,
          occupation: donor.employment?.occupation,
          employer: donor.employment?.employer,
          location: donor.primaryAddress ? `${donor.primaryAddress.city}, ${donor.primaryAddress.state}` : donor.address,
          email: donor.email,
          industry: donor.employment?.industry,
          // LOCALHOST TESTING: Request search_results instead of JSON sources
          useSearchResults: true,
          testingMode: 'localhost'
        })
      });

      console.log('🔍 Backend API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 Backend API Error:', errorData);
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Backend API Success:', data);

      if (data.success && data.headlines && data.headlines.length > 0) {
        console.log('✅ Successfully generated headlines via backend API');

        // Log citation source information for debugging
        console.log('🔍 Citation source:', data.citationSource);
        console.log('🔍 Citation count:', data.citationCount);
        console.log('🔍 Has search results:', data.hasSearchResults);
        console.log('🔍 Has JSON sources:', data.hasJsonSources);

        return {
          headlines: data.headlines,
          citations: data.citations || [],
          citationSource: data.citationSource,
          citationCount: data.citationCount,
          hasSearchResults: data.hasSearchResults,
          hasJsonSources: data.hasJsonSources
        };
      } else {
        throw new Error('No headlines returned from backend API');
      }


    } catch (error) {
      console.error('❌ Perplexity API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });

      console.log('🔄 Using fallback headlines due to API error');

      // Return realistic fallback data based on employment information
      if (donor.employment) {
        const fallbackHeadlines = [
          `${donor.name} serves as ${donor.employment.occupation} at ${donor.employment.employer}.`,
          `Professional with experience in ${donor.employment.industry || 'their field'}.`,
          `Based in ${donor.primaryAddress?.city || 'their location'} with established career background.`
        ];
        console.log('🔄 Employment-based fallback:', fallbackHeadlines);
        return {
          headlines: fallbackHeadlines,
          citations: []
        };
      }

      // Generic fallback for profiles without employment data
      const genericFallback = [
        `${donor.name} is a professional with established community connections.`,
        `Active in their local area with potential for civic engagement.`,
        `Profile available for further research and outreach opportunities.`
      ];
      console.log('🔄 Generic fallback:', genericFallback);
      return {
        headlines: genericFallback,
        citations: []
      };
    }
  };

  // Fetch FEC giving summary with timeout
  const fetchFECGivingSummary = async (donor: Donor): Promise<string> => {
    try {
      const zip = donor.primaryAddress?.zip || donor.address?.match(/\d{5}/)?.[0] || '';
      const FEC_API_KEY = '8P2NbLqGaNmGHeagg4JN5WEnH9laB0Yvh5iwgEna';
      const FEC_API_URL = `https://api.open.fec.gov/v1/schedules/schedule_a/?api_key=${FEC_API_KEY}&contributor_name=${encodeURIComponent(donor.name)}&contributor_zip=${zip}&per_page=100`;

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('FEC API timeout after 10 seconds')), 10000);
      });

      const fetchPromise = fetch(FEC_API_URL);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`FEC API error: ${response.status}`);
      }

      const data = await response.json();
      const contributions = data.results || [];

      if (contributions.length === 0) {
        return 'No recent FEC contributions found.';
      }

      // Calculate total contributions
      const totalAmount = contributions.reduce((sum: number, contrib: any) => {
        return sum + (parseFloat(contrib.contribution_receipt_amount) || 0);
      }, 0);

      // Determine party affiliation from committee names
      const republicanKeywords = ['republican', 'gop', 'trump', 'desantis', 'cruz', 'abbott'];
      const democraticKeywords = ['democratic', 'democrat', 'biden', 'harris', 'pelosi', 'schumer'];

      let republicanCount = 0;
      let democraticCount = 0;

      contributions.forEach((contrib: any) => {
        const committeeName = (contrib.committee?.name || '').toLowerCase();
        if (republicanKeywords.some(keyword => committeeName.includes(keyword))) {
          republicanCount++;
        } else if (democraticKeywords.some(keyword => committeeName.includes(keyword))) {
          democraticCount++;
        }
      });

      const party = republicanCount > democraticCount ? 'Republican' :
                   democraticCount > republicanCount ? 'Democratic' :
                   'various';

      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalAmount);

      const year = new Date().getFullYear() - 5; // Last 5 years
      return `Gave ${formattedAmount} to ${party} candidates and PACs since ${year}.`;

    } catch (error) {
      console.error('FEC API error:', error);
      return 'FEC contribution data temporarily unavailable.';
    }
  };

  // Generate wealth summary from i360 data
  const generateWealthSummary = (donor: Donor): string => {
    const wealthCode = getMockWealthCode(donor.name);

    if (!wealthCode || !WEALTH_MAPPING[wealthCode as keyof typeof WEALTH_MAPPING]) {
      return '';
    }

    const wealthData = WEALTH_MAPPING[wealthCode as keyof typeof WEALTH_MAPPING];
    return `Estimated wealth: ${wealthData.range} (${wealthData.tier})`;
  };

  // Format Smart Bio as markdown
  const formatSmartBioMarkdown = (bioData: SmartBioData): string => {
    const headlines = bioData.perplexityHeadlines.join(' ');
    const giving = bioData.fecGivingSummary;
    const wealth = bioData.wealthSummary;

    const sourcesText = bioData.sources
      .map(source => `[${source.name}](${source.url})`)
      .join(', ');

    let markdown = headlines;

    if (giving && !giving.includes('unavailable') && !giving.includes('No recent')) {
      markdown += `\n\n**Giving Summary:** ${giving}`;
    }

    if (wealth) {
      markdown += `\n**${wealth}**`;
    }

    markdown += `\n\n**Sources (${bioData.sources.length}):** ${sourcesText}`;
    markdown += `\n**FEC Disclaimer:** Data from the FEC does not imply endorsement. Public record info only.`;

    return markdown;
  };

  // Notes handlers
  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setShowAddNoteModal(true);
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotesData(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleSaveNote = (noteData: any) => {
    if (editingNote) {
      // Update existing note
      setNotesData(prev => prev.map(note =>
        note.id === editingNote.id ? { ...note, ...noteData } : note
      ));
    } else {
      // Add new note
      const newNote = {
        id: Date.now(),
        ...noteData,
        date: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }),
        author: 'Current User'
      };
      setNotesData(prev => [newNote, ...prev]);
    }
    setShowAddNoteModal(false);
    setEditingNote(null);
  };

  // Events handlers
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowAddEventModal(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEventsData(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const handleSaveEvent = (eventData: any) => {
    if (editingEvent) {
      // Update existing event
      setEventsData(prev => prev.map(event =>
        event.id === editingEvent.id ? { ...event, ...eventData } : event
      ));
    } else {
      // Add new event
      const newEvent = {
        id: Date.now(),
        ...eventData,
        createdBy: 'Current User'
      };
      setEventsData(prev => [newEvent, ...prev]);
    }
    setShowAddEventModal(false);
    setEditingEvent(null);
  };

  // Lookalike handlers
  const handleLookalikeFilterChange = (filterType: string, value: string) => {
    setLookalikeFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLookalikeSelection = (lookalike: any) => {
    setSelectedLookalikes(prev => {
      const isSelected = prev.some(l => l.id === lookalike.id);
      if (isSelected) {
        return prev.filter(l => l.id !== lookalike.id);
      } else {
        return [...prev, lookalike];
      }
    });
  };

  const handleSelectAllLookalikes = () => {
    const currentLookalikes = getCurrentLookalikes.slice(0, 15);
    if (selectAllLookalikes) {
      setSelectedLookalikes(currentLookalikes);
    } else {
      setSelectedLookalikes([]);
    }
  };

  const handleCreateSegment = () => {
    if (selectedLookalikes.length === 0) {
      alert('Please select at least one donor to create a segment.');
      return;
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmSegmentCreation = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }

    alert(`✅ Segment Created Successfully!\n\n${selectedLookalikes.length} donors added to new segment.\n\nSegment Name: "Similar to ${donor.name}"\nTotal Potential: $${selectedLookalikes.reduce((sum, l) => sum + l.totalGiven, 0).toLocaleString()}\n\nYou can now export this segment to DialR or TargetPath for outreach campaigns.`);

    setShowConfirmationModal(false);
    setSelectedLookalikes([]);
    setTermsAccepted(false);
  };

  // DialR Integration handlers
  const handleDialRClick = () => {
    setShowDialRModal(true);
  };

  const handleDialRListSelection = (listName: string) => {
    alert(`✅ ${donor.name} added to ${listName}!\n\nDialR Integration:\n• Contact added to calling queue\n• Suggested ask amount: $${donor.totalLifetimeGiving > 1000 ? '2,500' : '1,000'}\n• Best contact time: Weekday afternoons\n• Preferred method: Phone\n\nThe donor will be available for calling in your DialR dashboard within 5 minutes.`);
    setShowDialRModal(false);
  };

  // Address Book handlers
  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setShowAddContactModal(true);
  };

  const handleDeleteContact = (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContactsData(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const handleSaveContact = (contactData: any) => {
    if (editingContact) {
      // Update existing contact
      setContactsData(prev => prev.map(contact =>
        contact.id === editingContact.id ? { ...contact, ...contactData, lastUpdated: new Date().toLocaleDateString('en-US') } : contact
      ));
    } else {
      // Add new contact
      const newContact = {
        id: Date.now(),
        ...contactData,
        createdDate: new Date().toLocaleDateString('en-US'),
        lastUpdated: new Date().toLocaleDateString('en-US')
      };
      setContactsData(prev => [newContact, ...prev]);
    }
    setShowAddContactModal(false);
    setEditingContact(null);
  };

  const handleSetPrimaryContact = (contactId: number) => {
    setContactsData(prev => prev.map(contact => ({
      ...contact,
      isPrimary: contact.id === contactId
    })));
  };

  // Actions data structure
  const actionsData = useMemo(() => ({
    summary: {
      volunteer: 3,
      phoneCalls: 2,
      events: 3,
      other: 1,
      total: 9
    },
    actions: [
      { id: 1, category: 'Volunteer', action: 'Booth', date: '5/4/23', status: 'Completed', notes: 'Went well', hours: '5' },
      { id: 2, category: 'Volunteer', action: 'Booth', date: '3/30/23', status: 'Completed', notes: '', hours: '3' },
      { id: 3, category: 'Volunteer', action: 'Booth', date: '3/16/23', status: 'Completed', notes: '', hours: '4' },
      { id: 4, category: 'Event', action: 'Event Host', date: '1/30/23', status: 'Completed', notes: '', hours: '' },
      { id: 5, category: 'Voter Outreach', action: 'Phone Calls', date: '11/16/20', status: 'Completed', notes: 'Went well', hours: '' },
      { id: 6, category: 'Volunteer', action: 'Set-up', date: '7/8/20', status: 'Completed', notes: '', hours: '2' },
      { id: 7, category: 'Voter Outreach', action: 'Phone Calls', date: '7/15/20', status: 'Completed', notes: '', hours: '' },
      { id: 8, category: 'Volunteer', action: 'Check-in', date: '6/23/20', status: 'Completed', notes: '', hours: '3' }
    ]
  }), []);

  // Moves Management data structure
  const movesManagementData = useMemo(() => ({
    currentMove: {
      id: 'move-001',
      subject: 'New Major Donor',
      stage: '3. Stewardship',
      proposalAmount: 5600,
      manager: 'Sofia Amaya',
      dueDate: '2024-01-14',
      status: 'Active',
      priority: 'High',
      description: 'Cultivating relationship for major gift opportunity'
    },
    stages: [
      { stage: '1. Discovery', count: 1, active: false, completed: true },
      { stage: '2. Cultivation', count: 0, active: false, completed: true },
      { stage: '3. Stewardship', count: 2, active: true, completed: false },
      { stage: '4. Engage', count: 0, active: false, completed: false },
      { stage: '5. Complete', count: 0, active: false, completed: false }
    ],
    tasks: [
      {
        id: 'task-001',
        done: false,
        due: '2024-09-29',
        assignedTo: 'Sofia Amaya',
        assignedBy: 'Charles Logan',
        type: 'Meeting',
        priority: 'High',
        subject: 'Major Gift Discussion',
        description: 'Schedule meeting to discuss major gift opportunity'
      },
      {
        id: 'task-002',
        done: true,
        due: '2024-05-28',
        assignedTo: 'Brooke Taylor',
        assignedBy: 'Brooke Taylor',
        type: 'Call',
        priority: 'Low',
        subject: 'Follow-up Call',
        description: 'Initial contact and relationship building'
      }
    ],
    notes: [
      {
        id: 'note-001',
        date: '2024-01-10',
        author: 'Sofia Amaya',
        content: 'Donor expressed strong interest in education initiatives. Mentioned potential for $5K+ gift.',
        type: 'Contact'
      },
      {
        id: 'note-002',
        date: '2024-01-05',
        author: 'Charles Logan',
        content: 'Research indicates capacity for major gift. Previous giving pattern suggests good stewardship candidate.',
        type: 'Research'
      }
    ],
    history: [
      {
        id: 'history-001',
        date: '2024-01-10',
        action: 'Stage Updated',
        details: 'Moved from Cultivation to Stewardship',
        user: 'Sofia Amaya'
      },
      {
        id: 'history-002',
        date: '2024-01-05',
        action: 'Move Created',
        details: 'New Major Donor move initiated',
        user: 'Charles Logan'
      }
    ]
  }), []);

  // Moves Management handlers
  const handleOpenMovesModal = () => {
    setShowMovesModal(true);
  };

  const handleCloseMovesModal = () => {
    setShowMovesModal(false);
  };

  // Overview panel minimize functionality
  const toggleOverviewPanelMinimized = (panelId: string) => {
    setMinimizedOverviewPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(panelId)) {
        newSet.delete(panelId);
      } else {
        newSet.add(panelId);
      }
      return newSet;
    });
  };

  // Get hex color values for SmartTags-style inline styling
  const getCodeHexColor = (color: string) => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'orange': return '#f97316';
      case 'blue': return '#3b82f6';
      case 'purple': return '#8b5cf6';
      case 'cyan': return '#06b6d4';
      case 'green': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get classification codes for this donor (matching CodesManager data structure)
  const getClassificationCodes = () => {
    const codes = [];

    // Flags (red/orange colors)
    if (donor.givingOverview?.totalRaised > 1000) {
      codes.push({
        id: 'vip-1',
        code: 'VIP',
        name: 'VIP Donor',
        color: 'red',
        type: 'flag',
        date: '1/15/24',
        description: 'Major donor requiring special attention',
        star: true
      });
    }

    if (donor.name.includes('Joseph')) {
      codes.push({
        id: 'board-1',
        code: 'BOARD',
        name: 'Board Member',
        color: 'orange',
        type: 'flag',
        date: '1/1/24',
        description: 'Organization board member',
        star: true
      });
    }

    // Keywords (purple colors)
    if (donor.primaryAddress?.state === 'IL') {
      codes.push({
        id: 'local-1',
        code: 'LOCAL',
        name: 'Local Supporter',
        color: 'purple',
        type: 'keyword',
        date: '1/20/24',
        description: 'Local community supporter'
      });
    }

    // Attributes (cyan colors)
    if (donor.givingOverview?.consecutiveGifts > 2) {
      codes.push({
        id: 'recur-1',
        code: 'RECUR',
        name: 'Recurring Donor',
        color: 'cyan',
        type: 'attribute',
        date: '2/10/24',
        description: 'Consistent recurring donations'
      });
    }

    return codes.slice(0, 3); // Return most recent 3 codes
  };

  // Get all classification codes for modal (including additional samples)
  const getAllClassificationCodes = () => {
    return [
      ...getClassificationCodes(),
      // Additional sample codes for modal
      {
        id: 'vol-1',
        code: 'VOL',
        name: 'Volunteer',
        color: 'green',
        type: 'flag',
        date: '12/15/23',
        description: 'Active volunteer participant',
        star: true
      },
      {
        id: 'event-1',
        code: 'EVENT',
        name: 'Event Attendee',
        color: 'purple',
        type: 'keyword',
        date: '11/20/23',
        description: 'Regular event participant'
      },
      {
        id: 'corp-1',
        code: 'CORP',
        name: 'Corporate Executive',
        color: 'cyan',
        type: 'attribute',
        date: '2/1/24',
        description: 'Corporate leadership position'
      }
    ];
  };

  // Performance indicator logic
  const performance = useMemo(() => {
    const totalGiven = donor.givingOverview?.totalRaised || 0;
    const avgGift = totalGiven / (donor.givingOverview?.consecutiveGifts || 1);

    if (avgGift > 1000) return { type: 'over', color: 'orange' };
    if (avgGift > 500) return { type: 'meeting', color: 'green' };
    return { type: 'under', color: 'blue' };
  }, [donor]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, panelId: string) => {
    setDraggedPanel(panelId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault();
    if (!draggedPanel || draggedPanel === targetPanelId) return;

    const newOrder = [...panelOrder];
    const draggedIndex = newOrder.indexOf(draggedPanel);
    const targetIndex = newOrder.indexOf(targetPanelId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedPanel);

    setPanelOrder(newOrder);
    setDraggedPanel(null);
  };

  const handleDragEnd = () => {
    setDraggedPanel(null);
  };

  // Overview panel drag handlers
  const handleOverviewDragStart = (e: React.DragEvent, panelId: string) => {
    setDraggedOverviewPanel(panelId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleOverviewDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleOverviewDrop = (e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault();
    if (!draggedOverviewPanel || draggedOverviewPanel === targetPanelId) return;

    const newOrder = [...overviewPanelOrder];
    const draggedIndex = newOrder.indexOf(draggedOverviewPanel);
    const targetIndex = newOrder.indexOf(targetPanelId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedOverviewPanel);

    setOverviewPanelOrder(newOrder);
    setDraggedOverviewPanel(null);
  };

  const handleOverviewDragEnd = () => {
    setDraggedOverviewPanel(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: SparklesIcon },
    { id: 'contact-insights', label: 'Contact Insights', icon: ChatBubbleLeftRightIcon },
    { id: 'enriched', label: 'Enhanced Data', icon: DocumentTextIcon },
    { id: 'donor-discovery', label: 'Donor Discovery', icon: UserGroupIcon },
    { id: 'fec-insights', label: 'FEC Insights', icon: ShieldCheckIcon },
    { id: 'donations', label: 'Donations', icon: CurrencyDollarIcon },
    { id: 'actions', label: 'Actions', icon: BoltIcon },
    { id: 'more', label: 'More', icon: ChevronDownIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>People Search</span>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">People Profile</span>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="hover:text-gray-700" style={{ color: '#2f7fc3' }}>
                Back
              </Button>
              <Button variant="secondary" size="sm" className="text-red-600 hover:text-red-700">
                ✕
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Modernized */}
        <div className="w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 lg:min-h-screen">
          {/* Profile Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative">
                <img
                  src={donor.photoUrl}
                  alt={donor.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl ring-2 shadow-sm transition-all duration-200 hover:shadow-md"
                  style={{ ringColor: '#2f7fc3', ringOpacity: 0.3 }}
                />
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-500 border-2 border-white shadow-sm" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 tracking-tight">{donor.name}</h1>
                <div className="text-xs text-gray-500 font-mono mb-2 bg-gray-100 px-2 py-1 rounded-md inline-block">
                  {donor.pid || 'PID-2024-001847'}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {donor.employment ? (
                    <>
                      <div className="font-medium">{donor.employment.occupation}</div>
                      <div className="text-xs text-gray-500">at {donor.employment.employer}</div>
                    </>
                  ) : (
                    <div className="font-medium text-gray-400">Occupation not specified</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-4 pb-2">
              {/* Note */}
              <button
                onClick={() => alert('Add note functionality')}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title="Add Note"
              >
                <PencilIcon className="w-4 h-4" />
              </button>

              {/* Email */}
              <button
                onClick={() => window.open(`mailto:${donor.email || donor.contactInfo?.email || ''}`, '_self')}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title={`Email ${donor.email || donor.contactInfo?.email || 'No email'}`}
              >
                <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Call */}
              <button
                onClick={() => window.open(`tel:${donor.phone || donor.contactInfo?.home || '(555) 123-4567'}`, '_self')}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title={`Call ${formatPhone(donor.phone || donor.contactInfo?.home || '(555) 123-4567')}`}
              >
                <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Task */}
              <button
                onClick={() => alert('Create task functionality')}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title="Create Task"
              >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Meeting */}
              <button
                onClick={() => alert('Schedule meeting functionality')}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title="Schedule Meeting"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>

              {/* More */}
              <button
                onClick={() => alert('More actions menu')}
                className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-blue-100"
                title="More Actions"
              >
                <MoreIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Draggable Sidebar Panels */}
          <div className="p-6 space-y-4">
            <DraggablePanelContainer
              panelOrder={panelOrder}
              draggedPanel={draggedPanel}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              donor={donor}
              activeAITab={activeAITab}
              setActiveAITab={setActiveAITab}
              formatCurrency={formatCurrency}
              getSmartTags={getSmartTags}
              getClassificationCodes={getClassificationCodes}
              getAllClassificationCodes={getAllClassificationCodes}
              getCodeHexColor={getCodeHexColor}
              performance={performance}
              collapsedPanels={collapsedPanels}
              togglePanelCollapse={togglePanelCollapse}
              handleEditClick={handleEditClick}
              setIsCodesModalOpen={setIsCodesModalOpen}
              tasksData={tasksData}
              getMostRecentOpenTask={getMostRecentOpenTask}
              setIsTasksModalOpen={setIsTasksModalOpen}
              notesData={notesData}
              setShowNotesModal={setShowNotesModal}
              contactsData={contactsData}
              setShowAddressBookModal={setShowAddressBookModal}
            />
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <nav className="flex overflow-x-auto px-4 sm:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                  style={activeTab === tab.id ? { borderBottomColor: '#2f7fc3', color: '#2f7fc3' } : {}}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-2 sm:p-4 pb-24 bg-gray-50">
            {activeTab === 'overview' && (
              <DraggableOverviewContainer
                panelOrder={overviewPanelOrder}
                draggedPanel={draggedOverviewPanel}
                onDragStart={handleOverviewDragStart}
                onDragOver={handleOverviewDragOver}
                onDrop={handleOverviewDrop}
                onDragEnd={handleOverviewDragEnd}
                donor={donor}
                activeAITab={activeAITab}
                setActiveAITab={setActiveAITab}
                minimizedOverviewPanels={minimizedOverviewPanels}
                toggleOverviewPanelMinimized={toggleOverviewPanelMinimized}
                movesManagementData={movesManagementData}
                handleOpenMovesModal={handleOpenMovesModal}
                smartBioData={smartBioData}
                isGeneratingSmartBio={isGeneratingSmartBio}
                showSmartBioConfirmModal={showSmartBioConfirmModal}
                smartBioError={smartBioError}
                setShowSmartBioConfirmModal={setShowSmartBioConfirmModal}
                generateEnhancedSmartBio={generateEnhancedSmartBio}
                showCitationsModal={showCitationsModal}
                setShowCitationsModal={setShowCitationsModal}
                isEditingBio={isEditingBio}
                setIsEditingBio={setIsEditingBio}
                originalBioText={originalBioText}
                setOriginalBioText={setOriginalBioText}
                editedBioText={editedBioText}
                setEditedBioText={setEditedBioText}
                showQuickActionsDropdown={showQuickActionsDropdown}
                setShowQuickActionsDropdown={setShowQuickActionsDropdown}
                handleEditBio={handleEditBio}
                handleResetBio={handleResetBio}
                handleSaveEditedBio={handleSaveEditedBio}
                handleCancelEdit={handleCancelEdit}
                handleCopyToClipboard={handleCopyToClipboard}
                handleExportAsPDF={handleExportAsPDF}

                handleEmailBio={handleEmailBio}
                handleReportIssue={handleReportIssue}
                handleDialRClick={handleDialRClick}
                customAIInsights={customAIInsights || defaultAIInsights}
                // Feedback system props
                feedbackGiven={feedbackGiven}
                handlePositiveFeedback={handlePositiveFeedback}
                handleNegativeFeedback={handleNegativeFeedback}
              />
            )}

            {activeTab === 'contact-insights' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Side - Contact Intelligence */}
                <div className="space-y-4">
                  {contactInsightsPanelOrder.filter(panelId => leftSidePanels.has(panelId)).map((panelId) => {
                    const isMinimized = minimizedContactPanels.has(panelId);

                    if (panelId === 'communication-intelligence') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                              <h4 className="font-semibold text-gray-900">
                                Communication Intelligence
                              </h4>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              Last 30 days
                            </div>
                          </div>

                          {!isMinimized && donor.contactIntelligence ? (
                            <div className="space-y-3">
                              {/* Channel Success Rates */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <PhoneIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Phone</span>
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">85%</div>
                                  <div className="text-xs text-gray-500">Success</div>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <EnvelopeIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Email</span>
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">72%</div>
                                  <div className="text-xs text-gray-500">Open</div>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Text</span>
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">95%</div>
                                  <div className="text-xs text-gray-500">Read</div>
                                </div>
                              </div>

                        {/* Preferences & Timing */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">Preferred:</span>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                {donor.contactIntelligence.preferredContactMethod === 'phone' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <PhoneIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Phone</span>
                                  </>
                                )}
                                {donor.contactIntelligence.preferredContactMethod === 'email' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <EnvelopeIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Email</span>
                                  </>
                                )}
                                {donor.contactIntelligence.preferredContactMethod === 'text' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Text</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">Timezone:</span>
                              <span className="text-sm font-medium text-gray-700">{donor.contactIntelligence.timezone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 font-medium">Response:</span>
                            <span className="text-sm font-medium text-gray-700">{donor.contactIntelligence.responsePattern}</span>
                          </div>

                          <div>
                            <span className="text-xs text-gray-500 font-medium block mb-1">Best Contact Times:</span>
                            <div className="flex flex-wrap gap-1">
                              {donor.contactIntelligence.bestContactTimes.map((time, index) => (
                                <span key={index} className="text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-full">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <p className="text-gray-500 text-sm font-medium">No communication data available</p>
                              <p className="text-gray-400 text-xs mt-1">Data will populate as interactions are tracked</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (panelId === 'dialr-insights') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">
                              DialR Insights
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                Recent calls
                              </div>
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {!isMinimized && donor.contactIntelligence ? (
                            <div className="space-y-3">
                              {/* Most Recent Call */}
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-semibold text-gray-900 text-sm">Call - Soft Pledge</span>
                                    </div>
                                    <div className="text-xs text-gray-600">{formatLastContact(donor.contactIntelligence.lastContactDate)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-base font-bold text-green-600">$1,000</div>
                                    <div className="text-xs text-gray-500">Pledged</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700 bg-white rounded px-2 py-1">
                                  <strong>Result:</strong> {donor.contactIntelligence.lastContactOutcome}
                                </div>
                              </div>

                              {/* View DialR Log Button */}
                              <button
                                onClick={() => setShowDialRLogModal(true)}
                                className="w-full px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center justify-center gap-2"
                              >
                                <PhoneIcon className="w-4 h-4" />
                                View Complete DialR Log
                              </button>
                            </div>
                          ) : !isMinimized ? (
                            <div className="text-center py-6">
                              <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <p className="text-gray-500 text-sm font-medium mb-2">No DialR data available</p>
                              <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                                Connect DialR Integration
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    }

                    if (panelId === 'targetpath-insights') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                              <h4 className="font-semibold text-gray-900">
                                TargetPath Insights
                              </h4>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              Active campaigns
                            </div>
                          </div>

                          {!isMinimized && donor.contactIntelligence ? (
                            <div className="space-y-3">
                              {/* Most Recent Campaign */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                      <span className="font-medium text-blue-900 text-sm">Major Gift Follow-up</span>
                                    </div>
                                    <div className="text-xs text-blue-600">Due: Tomorrow at 2:00 PM</div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                      In Progress
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-blue-700 bg-white rounded px-2 py-1">
                                  3-touch sequence • Day 2 of 7
                                </div>
                              </div>

                              {/* View TargetPath Log Button */}
                              <button
                                onClick={() => setShowTargetPathLogModal(true)}
                                className="w-full px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                                View Complete TargetPath Log
                              </button>
                            </div>
                          ) : !isMinimized ? (
                            <div className="text-center py-6">
                              <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                              </div>
                              <p className="text-gray-500 text-sm font-medium mb-2">No TargetPath data available</p>
                              <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                                Connect TargetPath Integration
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    }

                    if (panelId === 'dialr-insights') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                              <h4 className="font-semibold text-gray-900">
                                DialR Insights
                              </h4>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              Recent calls
                            </div>
                          </div>

                          {!isMinimized && donor.contactIntelligence ? (
                            <div className="space-y-3">
                              {/* Most Recent Call */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-medium text-blue-900 text-sm">Call - Soft Pledge</span>
                                    </div>
                                    <div className="text-xs text-blue-600">{formatLastContact(donor.contactIntelligence.lastContactDate)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-base font-semibold text-green-600">$1,000</div>
                                    <div className="text-xs text-blue-500">Pledged</div>
                                  </div>
                                </div>
                                <div className="text-sm text-blue-700 bg-white rounded px-2 py-1">
                                  <strong>Result:</strong> {donor.contactIntelligence.lastContactOutcome}
                                </div>
                              </div>

                              {/* View DialR Log Button */}
                              <button
                                onClick={() => setShowDialRLogModal(true)}
                                className="w-full px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center justify-center gap-2"
                              >
                                <PhoneIcon className="w-4 h-4" />
                                View Complete DialR Log
                              </button>
                            </div>
                          ) : !isMinimized ? (
                            <div className="text-center py-6">
                              <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <p className="text-gray-500 text-sm font-medium mb-2">No DialR data available</p>
                              <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                                Connect DialR Integration
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Right Side - Giving Intelligence */}
                <div className="space-y-4">
                  {contactInsightsPanelOrder.filter(panelId => rightSidePanels.has(panelId)).map((panelId) => {
                    const isMinimized = minimizedContactPanels.has(panelId);

                    if (panelId === 'targetpath-insights') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                              <h4 className="font-semibold text-gray-900">
                                TargetPath Insights
                              </h4>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              Active campaigns
                            </div>
                          </div>

                          {!isMinimized && donor.contactIntelligence ? (
                            <div className="space-y-3">
                              {/* Most Recent Campaign */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                      <span className="font-medium text-blue-900 text-sm">Major Gift Follow-up</span>
                                    </div>
                                    <div className="text-xs text-blue-600">Due: Tomorrow at 2:00 PM</div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                      In Progress
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-blue-700 bg-white rounded px-2 py-1">
                                  3-touch sequence • Day 2 of 7
                                </div>
                              </div>

                              {/* View TargetPath Log Button */}
                              <button
                                onClick={() => setShowTargetPathLogModal(true)}
                                className="w-full px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                                View Complete TargetPath Log
                              </button>
                            </div>
                          ) : !isMinimized ? (
                            <div className="text-center py-6">
                              <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                              </div>
                              <p className="text-gray-500 text-sm font-medium mb-2">No TargetPath data available</p>
                              <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                                Connect TargetPath Integration
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    }

                    if (panelId === 'patterns-triggers') {
                      return (
                        <div
                          key={panelId}
                          draggable
                          onDragStart={() => handleContactPanelDragStart(panelId)}
                          onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                          onDrop={(e) => handleContactPanelDrop(e, panelId)}
                          onDragEnd={handleContactPanelDragEnd}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleContactPanelMinimized(panelId)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                              >
                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                              </button>
                              <h4 className="font-semibold text-gray-900">
                                Patterns & Triggers
                              </h4>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              AI Analysis
                            </div>
                          </div>

                          {!isMinimized && donor.givingIntelligence ? (
                            <div className="space-y-3">
                              {/* Seasonal Patterns */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                                  <span className="text-gray-700 text-sm font-semibold">Seasonal Patterns</span>
                                </div>
                                <div className="space-y-1">
                                  {donor.givingIntelligence.seasonalPatterns.map((pattern, index) => (
                                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-gray-800 font-medium">{pattern.pattern}</span>
                                          {pattern.historicalData && (
                                            <div className="p-0.5 bg-gray-200 rounded-full">
                                              <CheckCircleIcon className="w-3 h-3 text-gray-700" title="Based on actual donor history" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded-full">
                                          {pattern.confidence}%
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                        {/* Trigger Events */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                            <span className="text-gray-700 text-sm font-semibold">Trigger Events</span>
                          </div>
                          <div className="space-y-1">
                            {donor.givingIntelligence.triggerEvents.map((trigger, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-800 font-medium">{trigger.trigger}</span>
                                    {trigger.historicalResponse && (
                                      <div className="p-0.5 bg-gray-200 rounded-full">
                                        <CheckCircleIcon className="w-3 h-3 text-gray-700" title="Donor has responded to this trigger before" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded-full">
                                    {trigger.likelihood}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Historical Response */}
                        {donor.givingIntelligence.historicalTriggers && donor.givingIntelligence.historicalTriggers.length > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-gray-700 text-sm font-semibold">Historical Response</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {donor.givingIntelligence.historicalTriggers.map((trigger, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200 font-medium flex items-center gap-1">
                                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                  {trigger}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">
                              <strong>Note:</strong> Triggers this donor has actually responded to in the past
                            </div>
                          </div>
                        )}
                      </div>
                    ) : !isMinimized ? (
                      <div className="text-center py-6">
                        <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                          <TrendingUpIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No giving patterns available</p>
                        <p className="text-gray-400 text-xs mt-1">Data will be populated as giving patterns are analyzed</p>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (panelId === 'communication-intelligence') {
                return (
                  <div
                    key={panelId}
                    draggable
                    onDragStart={() => handleContactPanelDragStart(panelId)}
                    onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                    onDrop={(e) => handleContactPanelDrop(e, panelId)}
                    onDragEnd={handleContactPanelDragEnd}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleContactPanelMinimized(panelId)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                        >
                          <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                        </button>
                        <h4 className="font-semibold text-gray-900">
                          Communication Intelligence
                        </h4>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        Last 30 days
                      </div>
                    </div>

                    {!isMinimized && donor.contactIntelligence ? (
                      <div className="space-y-3">
                        {/* Channel Success Rates */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <div className="p-0.5 bg-gray-200 rounded">
                                <PhoneIcon className="w-3 h-3 text-gray-700" />
                              </div>
                              <span className="text-xs font-medium text-gray-700">Phone</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">85%</div>
                            <div className="text-xs text-gray-500">Success</div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <div className="p-0.5 bg-gray-200 rounded">
                                <EnvelopeIcon className="w-3 h-3 text-gray-700" />
                              </div>
                              <span className="text-xs font-medium text-gray-700">Email</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">72%</div>
                            <div className="text-xs text-gray-500">Open</div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <div className="p-0.5 bg-gray-200 rounded">
                                <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-700" />
                              </div>
                              <span className="text-xs font-medium text-gray-700">Text</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">95%</div>
                            <div className="text-xs text-gray-500">Read</div>
                          </div>
                        </div>

                        {/* Preferences & Timing */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">Preferred:</span>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                {donor.contactIntelligence.preferredContactMethod === 'phone' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <PhoneIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Phone</span>
                                  </>
                                )}
                                {donor.contactIntelligence.preferredContactMethod === 'email' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <EnvelopeIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Email</span>
                                  </>
                                )}
                                {donor.contactIntelligence.preferredContactMethod === 'text' && (
                                  <>
                                    <div className="p-0.5 bg-gray-200 rounded">
                                      <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-700" />
                                    </div>
                                    <span className="text-gray-700">Text</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">Timezone:</span>
                              <span className="text-sm font-medium text-gray-700">{donor.contactIntelligence.timezone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 font-medium">Response:</span>
                            <span className="text-sm font-medium text-gray-700">{donor.contactIntelligence.responsePattern}</span>
                          </div>

                          <div>
                            <span className="text-xs text-gray-500 font-medium block mb-1">Best Contact Times:</span>
                            <div className="flex flex-wrap gap-1">
                              {donor.contactIntelligence.bestContactTimes.map((time, index) => (
                                <span key={index} className="text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-full">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : !isMinimized ? (
                      <div className="text-center py-6">
                        <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No communication data available</p>
                        <p className="text-gray-400 text-xs mt-1">Data will populate as interactions are tracked</p>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (panelId === 'dialr-insights') {
                return (
                  <div
                    key={panelId}
                    draggable
                    onDragStart={() => handleContactPanelDragStart(panelId)}
                    onDragOver={(e) => handleContactPanelDragOver(e, panelId)}
                    onDrop={(e) => handleContactPanelDrop(e, panelId)}
                    onDragEnd={handleContactPanelDragEnd}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleContactPanelMinimized(panelId)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                        >
                          <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                        </button>
                        <h4 className="font-semibold text-gray-900">
                          DialR Insights
                        </h4>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        Recent calls
                      </div>
                    </div>

                    {!isMinimized && donor.contactIntelligence ? (
                      <div className="space-y-3">
                        {/* Most Recent Call */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium text-blue-900 text-sm">Call - Soft Pledge</span>
                              </div>
                              <div className="text-xs text-blue-600">{formatLastContact(donor.contactIntelligence.lastContactDate)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-semibold text-green-600">$1,000</div>
                              <div className="text-xs text-blue-500">Pledged</div>
                            </div>
                          </div>
                          <div className="text-sm text-blue-700 bg-white rounded px-2 py-1">
                            <strong>Result:</strong> {donor.contactIntelligence.lastContactOutcome}
                          </div>
                        </div>

                        {/* View DialR Log Button */}
                        <button
                          onClick={() => setShowDialRLogModal(true)}
                          className="w-full px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center justify-center gap-2"
                        >
                          <PhoneIcon className="w-4 h-4" />
                          View Complete DialR Log
                        </button>
                      </div>
                    ) : !isMinimized ? (
                      <div className="text-center py-6">
                        <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-2">No DialR data available</p>
                        <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                          Connect DialR Integration
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              }

                    return null;
                  })}
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                    <div className="bg-green-100 text-green-800 border border-green-200 text-xs px-2 py-1 rounded-full font-medium">
                      12 Donations
                    </div>
                  </div>
                  <button
                    onClick={handleAddGift}
                    className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Gift
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">$4,225</div>
                    <div className="text-sm text-gray-600">Cycle-to-Date Total</div>
                    <div className="text-xs text-gray-500 mt-1">46 gifts this cycle</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">$12,750</div>
                    <div className="text-sm text-gray-600">Lifetime Total</div>
                    <div className="text-xs text-gray-500 mt-1">All-time giving</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">$927.64</div>
                    <div className="text-sm text-gray-600">Average Gift</div>
                    <div className="text-xs text-gray-500 mt-1">Current cycle</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">$3,750</div>
                    <div className="text-sm text-gray-600">Highest Gift</div>
                    <div className="text-xs text-gray-500 mt-1">3/30/23 (P2024)</div>
                  </div>
                </div>

                {/* Cycle Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Cycle Breakdown</h4>
                  <div className={`grid gap-3 ${
                    getCycleBreakdown().length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                    getCycleBreakdown().length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {getCycleBreakdown().map((cycle, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">{cycle.code}</span>
                            <span className="text-xs text-gray-500">{cycle.type}</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            ${cycle.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className={`text-xs ${
                          cycle.status === 'excessive' ? 'text-red-600' :
                          cycle.status === 'remaining' ? 'text-green-600' :
                          'text-gray-500'
                        }`}>
                          {cycle.status === 'excessive' ? `$${Math.abs(cycle.remaining).toLocaleString()} Excessive` :
                           cycle.status === 'remaining' ? `$${cycle.remaining.toLocaleString()} Remaining` :
                           '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-2">MID</div>
                      <div className="col-span-1">Check #</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-2">Method</div>
                      <div className="col-span-2">Fund</div>
                      <div className="col-span-1">Source</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {[
                      { mid: '461646', check: '1255', date: '1/23/23', amount: '$500', method: 'CH', fund: 'C-PAC', source: 'Housefile' },
                      { mid: '458932', check: '1189', date: '12/15/22', amount: '$1,000', method: 'CC', fund: 'General', source: 'Event' },
                      { mid: '455721', check: '1098', date: '11/03/22', amount: '$250', method: 'CH', fund: 'C-PAC', source: 'Mail' },
                      { mid: '452108', check: '987', date: '9/28/22', amount: '$2,500', method: 'CH', fund: 'General', source: 'Major Gift' },
                      { mid: '448765', check: '876', date: '8/15/22', amount: '$100', method: 'Online', fund: 'C-PAC', source: 'Website' }
                    ].map((transaction, index) => (
                      <div
                        key={index}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewGift(transaction)}
                      >
                        <div className="grid grid-cols-12 gap-4 text-sm">
                          <div className="col-span-2 font-medium text-blue-600 hover:text-blue-800">{transaction.mid}</div>
                          <div className="col-span-1 text-gray-600">#{transaction.check}</div>
                          <div className="col-span-2 text-gray-900">{transaction.date}</div>
                          <div className="col-span-2 font-semibold text-green-600">{transaction.amount}</div>
                          <div className="col-span-2">
                            <div className="bg-gray-100 text-gray-800 border border-gray-200 text-xs px-2 py-1 rounded-full font-medium inline-block">
                              {transaction.method}
                            </div>
                          </div>
                          <div className="col-span-2 text-gray-600">{transaction.fund}</div>
                          <div className="col-span-1">
                            <div className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2 py-1 rounded-full font-medium inline-block">
                              {transaction.source}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing 1-5 of 12 transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Action History</h3>
                    <div className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                      {actionsData.summary.total} Actions
                    </div>
                  </div>
                  <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Add Action
                  </button>
                </div>

                {/* Action Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{actionsData.summary.volunteer}</div>
                    <div className="text-sm text-gray-600">Volunteer</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{actionsData.summary.phoneCalls}</div>
                    <div className="text-sm text-gray-600">Phone Calls</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{actionsData.summary.events}</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{actionsData.summary.other}</div>
                    <div className="text-sm text-gray-600">Other</div>
                  </div>
                </div>

                {/* Actions List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-3">Category</div>
                      <div className="col-span-3">Action</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Notes</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {actionsData.actions.map((action) => (
                      <div key={action.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 text-sm">
                          <div className="col-span-3">
                            <div className={`text-xs px-2 py-1 rounded-full font-medium inline-block border ${
                              action.category === 'Volunteer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              action.category === 'Event' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              action.category === 'Voter Outreach' ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {action.category}
                            </div>
                          </div>
                          <div className="col-span-3 font-medium text-gray-900">{action.action}</div>
                          <div className="col-span-2 text-gray-600">{action.date}</div>
                          <div className="col-span-2">
                            <div className="bg-green-100 text-green-800 border border-green-200 text-xs px-2 py-1 rounded-full font-medium inline-block">
                              {action.status}
                            </div>
                          </div>
                          <div className="col-span-2 text-gray-600 text-xs">{action.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing 1-8 of {actionsData.summary.total} actions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      Previous
                    </button>
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enriched' && (
              <div className="space-y-6">
                {!isDataEnhanced && !isEnhancing ? (
                  // Initial Call-to-Action State
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center border border-blue-200">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enhance Donor Data</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Unlock comprehensive demographic and political insights from i360 data sources.
                      Improve insight accuracy by an estimated <strong>20%</strong> with enhanced donor intelligence.
                    </p>

                    <div className="bg-white/60 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-2">Enhanced Data Includes:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Demographics & Income
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Political Engagement
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Volunteer Propensity
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Giving Capacity
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleEnhanceDataClick}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Enhance Data
                    </Button>

                    <p className="text-xs text-gray-500 mt-4">
                      Data sourced from i360 Political Intelligence • Secure & Compliant
                    </p>
                  </div>
                ) : isEnhancing ? (
                  // Loading State
                  <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhancing Donor Data...</h3>
                    <p className="text-gray-600">
                      Retrieving comprehensive insights from i360 data sources
                    </p>
                  </div>
                ) : enrichedData ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Enriched Data</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{enrichedData.dataSource}</Badge>
                    </div>

                    {/* AI Snapshot for Enhanced Data */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <SparklesIcon className="w-4 h-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-blue-900">AI Snapshot</h4>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Enhanced Analysis</Badge>
                        </div>

                        <div className="prose prose-xs text-blue-800 leading-relaxed">
                          <p className="mb-2 text-xs">
                            <strong>{donor.name}</strong> is a {enrichedData.age}-year-old {enrichedData.gender?.toLowerCase()}
                            {enrichedData.homeowner ? ' homeowner' : ' renter'} with {enrichedData.education?.toLowerCase()} education
                            and an estimated household income of {enrichedData.householdIncome}.
                          </p>

                          <p className="mb-2 text-xs">
                            <strong>Political Profile:</strong> Registered {enrichedData.party} voter with {enrichedData.politicalEngagement}%
                            political engagement score. Shows {enrichedData.volunteerPropensity}% volunteer propensity and
                            {enrichedData.eventAttendancePropensity}% likelihood to attend events.
                          </p>

                          <p className="mb-0 text-xs">
                            <strong>Fundraising Insights:</strong> Classified as {enrichedData.givingCapacity} giving capacity.
                            {enrichedData.politicalEngagement && enrichedData.politicalEngagement > 70 ?
                              ' High political engagement suggests strong potential for political giving and advocacy involvement.' :
                              ' Moderate political engagement indicates potential for targeted outreach and cultivation.'
                            }
                            {enrichedData.volunteerPropensity && enrichedData.volunteerPropensity > 60 ?
                              ' Strong volunteer propensity makes them an excellent candidate for event participation and hands-on involvement.' :
                              ''
                            }
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                          <div className="text-xs text-blue-600">
                            Analysis generated from {enrichedData.dataSource} • Last updated {enrichedData.lastUpdated}
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                            Refresh Analysis
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Demographics */}
                      <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          Demographics
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{enrichedData.age}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium">{enrichedData.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Household Income:</span>
                            <span className="font-medium">{enrichedData.householdIncome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Homeowner:</span>
                            <span className="font-medium">{enrichedData.homeowner ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Education:</span>
                            <span className="font-medium">{enrichedData.education}</span>
                          </div>
                        </div>
                      </div>

                      {/* Political & Giving Profile */}
                      <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          Political & Giving Profile
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Party Affiliation:</span>
                            <span className="font-medium">{enrichedData.party}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giving Capacity:</span>
                            <span className="font-medium">{enrichedData.givingCapacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Political Engagement:</span>
                            <span className="font-medium">{enrichedData.politicalEngagement}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Volunteer Propensity:</span>
                            <span className="font-medium">{enrichedData.volunteerPropensity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Event Attendance:</span>
                            <span className="font-medium">{enrichedData.eventAttendancePropensity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">Data last updated:</span>
                        <span>{enrichedData.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Enriched Data Not Available</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Detailed demographic and political data will be populated from external data sources.
                    </p>
                    <Button variant="secondary">
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Request Data Enrichment
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donor-discovery' && (
              <div className="space-y-6">
                {/* Discovery Overview */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI-Powered Donor Discovery</h3>
                      <p className="text-sm text-gray-600">Find high-quality prospects similar to your best donors</p>
                    </div>
                  </div>

                  <div className="prose prose-xs text-green-800 leading-relaxed">
                    <p className="mb-2 text-xs">
                      Based on <strong>{donor.name}'s</strong> profile, we've identified <strong>{allLookalikes.length.toLocaleString()}</strong> potential donors
                      with similar demographics, giving patterns, and engagement behaviors. These donors are modeled using i360's comprehensive database
                      and advanced similarity algorithms.
                    </p>

                    <p className="mb-2 text-xs">
                      <strong>High-Value Donors:</strong> {aiSuggestedLookalikes.length} donors show 85%+ similarity scores and represent
                      the highest-quality matches for targeted outreach and cultivation strategies.
                    </p>
                  </div>
                </div>

                {/* Enhanced Prospect Discovery Interface */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  {!lookalikeExpanded ? (
                    // Collapsed State - Enhanced Discovery Overview
                    <div className="p-8 text-center">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <UserGroupIcon className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {allLookalikes.length.toLocaleString()} Qualified Donors Discovered
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Advanced AI matching has identified high-quality donors with similar demographics,
                        giving patterns, and engagement behaviors to your existing donor base.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{aiSuggestedLookalikes.length}</div>
                          <div className="text-xs text-gray-600">High-Match (85%+)</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ${Math.round(allLookalikes.reduce((sum, l) => sum + l.avgGift, 0) / allLookalikes.length).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Avg Gift Size</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            ${Math.round(allLookalikes.reduce((sum, l) => sum + l.totalGiven, 0) / 1000)}K
                          </div>
                          <div className="text-xs text-gray-600">Total Potential</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setLookalikeExpanded(true)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Explore Donor Matches
                      </button>
                    </div>
                  ) : (
                    // Expanded State - Full Discovery Interface
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <UserGroupIcon className="w-6 h-6 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Donor Discovery Results</h3>
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                            {getCurrentLookalikes.length} matches
                          </div>
                        </div>
                        <button
                          onClick={() => setLookalikeExpanded(false)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Filters and Controls */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Location:</label>
                            <select
                              value={lookalikeFilters.location}
                              onChange={(e) => handleLookalikeFilterChange('location', e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="all">All Locations</option>
                              <option value="Austin">Austin, TX</option>
                              <option value="Dallas">Dallas, TX</option>
                              <option value="Houston">Houston, TX</option>
                              <option value="San Antonio">San Antonio, TX</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Giving Range:</label>
                            <select
                              value={lookalikeFilters.givingRange}
                              onChange={(e) => handleLookalikeFilterChange('givingRange', e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="all">All Ranges</option>
                              <option value="under500">Under $500</option>
                              <option value="500-1000">$500 - $1,000</option>
                              <option value="over1000">Over $1,000</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="aiSuggested"
                              checked={showAISuggested}
                              onChange={(e) => setShowAISuggested(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="aiSuggested" className="text-sm font-medium text-gray-700">
                              AI Suggested Only (85%+ match)
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="selectAll"
                              checked={selectAllLookalikes}
                              onChange={(e) => {
                                setSelectAllLookalikes(e.target.checked);
                                handleSelectAllLookalikes();
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                              Select All Visible ({Math.min(getCurrentLookalikes.length, 15)})
                            </label>
                          </div>

                          {selectedLookalikes.length > 0 && (
                            <button
                              onClick={handleCreateSegment}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Create Segment ({selectedLookalikes.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lookalike Results */}
                      <div className="space-y-3">
                        {getCurrentLookalikes.slice(0, 15).map((lookalike) => (
                          <div
                            key={lookalike.id}
                            className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                              selectedLookalikes.some(l => l.id === lookalike.id)
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                            onClick={() => handleLookalikeSelection(lookalike)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedLookalikes.some(l => l.id === lookalike.id)}
                                  onChange={() => handleLookalikeSelection(lookalike)}
                                  className="rounded border-gray-300"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">{lookalike.name}</div>
                                  <div className="text-sm text-gray-600">{lookalike.location}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-900">${lookalike.avgGift.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">Avg Gift</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-900">${lookalike.totalGiven.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">Total Given</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-sm font-medium ${
                                    lookalike.similarityScore >= 90 ? 'text-green-600' :
                                    lookalike.similarityScore >= 85 ? 'text-blue-600' :
                                    'text-gray-600'
                                  }`}>
                                    {lookalike.similarityScore}%
                                  </div>
                                  <div className="text-xs text-gray-500">Match</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Show More Button */}
                      {getCurrentLookalikes.length > 15 && (
                        <div className="text-center mt-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Show More Donors ({getCurrentLookalikes.length - 15} remaining)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fec-insights' && (
              <div className="space-y-4">
                {(donor.fecInsights && fecInsightsGenerated) ? (
                  <>
                    {/* Compact Compliance Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-4">
                      <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-amber-900">FEC Data – Compliance Use Only</span>
                          <span className="text-xs text-amber-800 ml-2">
                            Public FEC data for compliance/vetting only. Not for solicitation (11 CFR §104.15).
                          </span>
                        </div>
                        <a
                          href="https://www.fec.gov/help-candidates-and-committees/filing-reports/contributor-information/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-700 underline hover:text-amber-900 whitespace-nowrap"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>



                    {/* Contribution History */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Contribution History</h3>
                      </div>

                      {/* Summary Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-base font-bold text-gray-900">
                            ${donor.fecInsights.contributionHistory.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Total Federal</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-base font-bold text-gray-900">
                            {donor.fecInsights.contributionHistory.totalContributions}
                          </div>
                          <div className="text-xs text-gray-600">Total Count</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-base font-bold text-gray-900">
                            ${donor.fecInsights.contributionHistory.yearToDate.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            YTD {donor.fecInsights.contributionHistory.yearToDate.year}
                            <span className="text-gray-500 ml-1">
                              ({donor.fecInsights.contributionHistory.yearToDate.contributionCount})
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-base font-bold text-gray-900">
                            ${donor.fecInsights.contributionHistory.cycleToDate.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {donor.fecInsights.contributionHistory.cycleToDate.cycle}
                            <span className="text-gray-500 ml-1">
                              ({donor.fecInsights.contributionHistory.cycleToDate.contributionCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Cycles and Period Info */}
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Active Cycles:</span> {donor.fecInsights.contributionHistory.activeCycles.join(', ')}
                          <span className="text-gray-600 ml-3">
                            <span className="font-medium">Period:</span> {new Date(donor.fecInsights.contributionHistory.firstContributionDate).getFullYear()} - {new Date(donor.fecInsights.contributionHistory.lastContributionDate).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Federal Activity */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">Federal Activity</h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {donor.fecInsights.committeesSupported.length} Committees
                          </span>
                        </div>

                        {/* Toggle between Committees and Timeline */}
                        <div className="flex items-center gap-2">
                          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button
                              onClick={() => setActiveFecView('committees')}
                              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                activeFecView === 'committees'
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              Committees
                            </button>
                            <button
                              onClick={() => setActiveFecView('timeline')}
                              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                activeFecView === 'timeline'
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              Timeline
                            </button>
                          </div>

                          {activeFecView === 'committees' && donor.fecInsights.committeesSupported.length > 5 && (
                            <button
                              onClick={() => setShowAllCommittees(!showAllCommittees)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              {showAllCommittees ? 'Show Top 5' : 'View All'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Committees View */}
                      {activeFecView === 'committees' && (
                        <div className="space-y-2">
                          {(showAllCommittees ? donor.fecInsights.committeesSupported : donor.fecInsights.committeesSupported.slice(0, 5))
                            .map((committee, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              {/* Committee Summary */}
                              <div className="p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 text-sm">{committee.committeeName}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      committee.committeeType === 'candidate' ? 'bg-blue-100 text-blue-700' :
                                      committee.committeeType === 'pac' ? 'bg-gray-100 text-gray-700' :
                                      committee.committeeType === 'party' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {committee.committeeType.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-900 text-sm">${committee.totalAmount.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600">{committee.contributionCount} contributions</div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-600">
                                    Last contribution: {new Date(committee.lastContribution).toLocaleDateString()}
                                  </div>
                                  <button
                                    onClick={() => toggleCommitteeExpansion(committee.committeeName)}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                  >
                                    {expandedCommittees.has(committee.committeeName) ? 'Hide' : 'View'} Transactions
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${
                                      expandedCommittees.has(committee.committeeName) ? 'rotate-180' : ''
                                    }`} />
                                  </button>
                                </div>

                                {/* Transaction Details */}
                                {expandedCommittees.has(committee.committeeName) && committee.transactions && (
                                  <div className="border-t border-gray-200 bg-white mt-2">
                                    <div className="p-2">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-medium text-gray-800">Individual Transactions</h4>
                                        <div className="text-xs text-gray-600">
                                          {committee.transactions.length} of {committee.contributionCount} total
                                        </div>
                                      </div>

                                      {/* Table Format */}
                                      <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                        <table className="w-full text-xs">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="text-left p-1.5 font-medium text-gray-800">Amount</th>
                                              <th className="text-left p-1.5 font-medium text-gray-800">Date</th>
                                              <th className="text-left p-1.5 font-medium text-gray-800">Period</th>
                                              <th className="text-left p-1.5 font-medium text-gray-800">Filed</th>
                                              <th className="text-left p-1.5 font-medium text-gray-800">ID</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {getPagedTransactions(
                                              committee.transactions,
                                              getTransactionPage(committee.committeeName)
                                            ).map((transaction, txIndex) => (
                                              <tr key={txIndex} className="border-t border-gray-100">
                                                <td className="p-1.5 font-medium text-gray-900">
                                                  ${transaction.amount.toLocaleString()}
                                                </td>
                                                <td className="p-1.5 text-gray-700">
                                                  {new Date(transaction.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-1.5 text-gray-600">
                                                  {transaction.reportPeriod}
                                                </td>
                                                <td className="p-1.5 text-gray-600">
                                                  {new Date(transaction.filingDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-1.5 text-gray-500">
                                                  {transaction.transactionId}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Pagination Controls */}
                                      {committee.transactions.length > 5 && (
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                          <div className="text-xs text-gray-600">
                                            Page {getTransactionPage(committee.committeeName)} of {getTotalPages(committee.transactions.length)}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => setTransactionPage(
                                                committee.committeeName,
                                                Math.max(1, getTransactionPage(committee.committeeName) - 1)
                                              )}
                                              disabled={getTransactionPage(committee.committeeName) === 1}
                                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              ‹
                                            </button>

                                            <span className="text-xs text-gray-600 px-2">
                                              {getTransactionPage(committee.committeeName)} / {getTotalPages(committee.transactions.length)}
                                            </span>

                                            <button
                                              onClick={() => setTransactionPage(
                                                committee.committeeName,
                                                Math.min(getTotalPages(committee.transactions.length), getTransactionPage(committee.committeeName) + 1)
                                              )}
                                              disabled={getTransactionPage(committee.committeeName) === getTotalPages(committee.transactions.length)}
                                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              ›
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timeline View */}
                      {activeFecView === 'timeline' && donor.fecInsights.recentActivity && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-800">Recent Federal Activity</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Last 5 Transactions</span>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                              View All Activity
                            </button>
                          </div>

                          <div className="space-y-1">
                            {donor.fecInsights.recentActivity.map((transaction, index) => (
                              <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-medium text-gray-900">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {transaction.committeeName}
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    transaction.committeeType === 'candidate' ? 'bg-blue-100 text-blue-700' :
                                    transaction.committeeType === 'pac' ? 'bg-gray-100 text-gray-700' :
                                    transaction.committeeType === 'party' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {transaction.committeeType.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900 text-sm">${transaction.amount.toLocaleString()}</div>
                                  <div className="text-xs text-gray-600">{transaction.reportPeriod}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Giving Categories & Exclusivity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                      {/* Giving Categories */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ChartBarIcon className="w-4 h-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">Giving Categories</h3>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded border border-gray-200 text-sm">
                            <span className="text-gray-700">Federal Candidates</span>
                            <span className="font-bold text-gray-900">${donor.fecInsights.givingCategories.federalCandidates.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded border border-gray-200 text-sm">
                            <span className="text-gray-700">PACs</span>
                            <span className="font-bold text-gray-900">${donor.fecInsights.givingCategories.pacs.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded border border-gray-200 text-sm">
                            <span className="text-gray-700">Party Committees</span>
                            <span className="font-bold text-gray-900">${donor.fecInsights.givingCategories.partyCommittees.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded border border-gray-200 text-sm">
                            <span className="text-gray-700">Super PACs</span>
                            <span className="font-bold text-gray-900">${donor.fecInsights.givingCategories.superPacs.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Exclusivity Metrics */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FlagIcon className="w-4 h-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">Exclusivity Analysis</h3>
                        </div>

                        <div className="space-y-1">
                          <div className="bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900 mb-1">
                                {donor.fecInsights.exclusivityMetrics.exclusivityPercentage}%
                              </div>
                              <div className="text-xs text-gray-600">
                                {donor.fecInsights.exclusivityMetrics.partyExclusivity === 'exclusive-democrat' ? 'Democratic' :
                                 donor.fecInsights.exclusivityMetrics.partyExclusivity === 'exclusive-republican' ? 'Republican' :
                                 'Bipartisan'} Giving
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">Party:</span> {
                                donor.fecInsights.exclusivityMetrics.partyExclusivity === 'exclusive-democrat' ? 'Exclusively Democratic' :
                                donor.fecInsights.exclusivityMetrics.partyExclusivity === 'exclusive-republican' ? 'Exclusively Republican' :
                                'Bipartisan'
                              }
                            </div>
                          </div>

                          <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">Crossover:</span> {donor.fecInsights.exclusivityMetrics.crossoverContributions}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benchmarks */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrophyIcon className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Benchmarks</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                          <div className="text-base font-bold text-gray-900 mb-1">
                            Top {100 - donor.fecInsights.benchmarks.nationalPercentile}%
                          </div>
                          <div className="text-xs text-gray-600">National</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                          <div className="text-base font-bold text-gray-900 mb-1">
                            {donor.fecInsights.benchmarks.categoryRanking}
                          </div>
                          <div className="text-xs text-gray-600">Category</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                          <div className="text-base font-bold text-gray-900 mb-1">
                            Above Avg
                          </div>
                          <div className="text-xs text-gray-600">Cycle</div>
                        </div>
                      </div>

                      <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Analysis:</span> {donor.fecInsights.benchmarks.cycleComparison}
                        </div>
                      </div>
                    </div>

                    {/* Data Source */}
                    <div className="bg-white border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Source:</span> {donor.fecInsights.dataSource}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span> {new Date(donor.fecInsights.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </>
                ) : !fecInsightsGenerated ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
                    <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">Generate FEC Insights</h3>
                    <p className="text-blue-700 mb-6 max-w-md mx-auto">
                      Analyze this donor's federal political contribution history using public FEC data to uncover giving patterns, committee preferences, and engagement opportunities.
                    </p>
                    <button
                      onClick={handleGenerateFecInsights}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                      title="FEC data is for compliance/vetting only, not for solicitation (11 CFR §104.15)"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      Generate FEC Analysis
                    </button>
                    <div className="mt-4 text-xs text-blue-600">
                      Analysis includes contribution history, committee relationships, giving patterns, and compliance insights
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FEC Data Available</h3>
                    <p className="text-gray-600 mb-4">
                      No federal contribution records found for this donor in public FEC filings.
                    </p>
                    <div className="text-sm text-gray-500">
                      This could mean the donor has not made federal political contributions above reporting thresholds,
                      or their contributions are not yet reflected in the public database.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Donation History</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600">Donation history and gift management will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Actions & Campaigns</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600">Action items and campaign management will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === 'more' && (
              <div className="space-y-6">
                {/* Events Header */}
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Events Management</h3>
                </div>

                {/* Events Content */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {eventsData.length} Events
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddEventModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#2f7fc3' }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Event
                    </button>
                    </div>

                    {/* Events List */}
                    <div className="space-y-4">
                      {eventsData.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No events yet</h4>
                          <p className="text-gray-600 mb-4">Track events, meetings, and important dates for this donor.</p>
                          <button
                            onClick={() => setShowAddEventModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                            style={{ backgroundColor: '#2f7fc3' }}
                          >
                            <PlusIcon className="w-4 h-4" />
                            Add First Event
                          </button>
                        </div>
                      ) : (
                        eventsData.map((event) => (
                          <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.type === 'meeting' ? '#10b981' : event.type === 'event' ? '#3b82f6' : '#f59e0b' }}></div>
                                <span className="text-sm font-medium text-gray-900 capitalize">{event.type}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{event.date}</span>
                                {event.time && (
                                  <>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">{event.time}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                            {event.description && (
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">{event.description}</p>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPinIcon className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500">Created by {event.createdBy}</span>
                              <div className="flex items-center gap-2">
                                {event.attendees && (
                                  <span className="text-xs text-gray-500">{event.attendees} attendees</span>
                                )}
                                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {event.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DialR Log Modal */}
      {showDialRLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">DialR Call History</h3>
                  <p className="text-sm text-gray-600">{donor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDialRLogModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {/* Mock DialR History */}
                {[
                  {
                    id: 1,
                    date: '2024-01-15',
                    time: '2:30 PM',
                    type: 'Outbound Call',
                    duration: '8:45',
                    result: 'Soft Pledge',
                    amount: 1000,
                    notes: 'Donor expressed strong interest in campaign priorities. Committed to $1,000 pledge for Q1. Follow up in 2 weeks.',
                    status: 'success'
                  },
                  {
                    id: 2,
                    date: '2024-01-08',
                    time: '11:15 AM',
                    type: 'Outbound Call',
                    duration: '3:22',
                    result: 'Left Voicemail',
                    amount: null,
                    notes: 'Left detailed voicemail about upcoming policy briefing. Mentioned previous support and invited to call back.',
                    status: 'pending'
                  },
                  {
                    id: 3,
                    date: '2024-01-02',
                    time: '4:45 PM',
                    type: 'Inbound Call',
                    duration: '12:18',
                    result: 'Information Request',
                    amount: null,
                    notes: 'Donor called asking about volunteer opportunities. Provided information about phone banking and canvassing.',
                    status: 'neutral'
                  }
                ].map((call) => (
                  <div key={call.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          call.status === 'success' ? 'bg-green-500' :
                          call.status === 'pending' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="font-semibold text-gray-900">{call.result}</div>
                          <div className="text-sm text-gray-600">{call.date} at {call.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{call.duration}</div>
                        {call.amount && (
                          <div className="text-lg font-bold text-green-600">${call.amount.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-white rounded p-3">
                      {call.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TargetPath Log Modal */}
      {showTargetPathLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">TargetPath Campaign History</h3>
                  <p className="text-sm text-gray-600">{donor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTargetPathLogModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {/* Mock TargetPath History */}
                {[
                  {
                    id: 1,
                    campaign: 'Major Gift Follow-up',
                    status: 'In Progress',
                    startDate: '2024-01-10',
                    sequence: '3-touch sequence',
                    progress: 'Day 2 of 7',
                    nextAction: 'Email follow-up',
                    dueDate: 'Tomorrow at 2:00 PM'
                  },
                  {
                    id: 2,
                    campaign: 'Year-End Appeal',
                    status: 'Completed',
                    startDate: '2023-12-01',
                    sequence: '5-touch sequence',
                    progress: 'Completed',
                    nextAction: 'None',
                    result: 'Donated $500'
                  },
                  {
                    id: 3,
                    campaign: 'Event Invitation',
                    status: 'Paused',
                    startDate: '2023-11-15',
                    sequence: '2-touch sequence',
                    progress: 'Day 1 of 3',
                    nextAction: 'Phone call',
                    dueDate: 'Paused by user'
                  }
                ].map((campaign) => (
                  <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{campaign.campaign}</div>
                        <div className="text-sm text-gray-600">Started: {campaign.startDate}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        campaign.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sequence:</span>
                        <div className="font-medium">{campaign.sequence}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <div className="font-medium">{campaign.progress}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Action:</span>
                        <div className="font-medium">{campaign.nextAction}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Due:</span>
                        <div className="font-medium">{campaign.dueDate || campaign.result}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer Action Menu */}
      <ActionFooter />

      {/* Edit Contact Info Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <p className="text-sm text-gray-600">{donor.name}</p>
                </div>
              </div>
              <button
                onClick={handleEditModalClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Tabs */}
            <div className="flex border-b bg-white">
              <div className="flex w-64 border-r bg-gray-50">
                <div className="w-full">
                  {[
                    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
                    { id: 'phones', label: 'Phone Numbers', icon: PhoneIcon },
                    { id: 'emails', label: 'Email Addresses', icon: EnvelopeIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveContactTab(tab.id as 'addresses' | 'phones' | 'emails')}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${
                        activeContactTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {activeContactTab === 'addresses' && 'Address Information'}
                    {activeContactTab === 'phones' && 'Phone Numbers'}
                    {activeContactTab === 'emails' && 'Email Addresses'}
                  </h4>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add {activeContactTab === 'addresses' ? 'Address' : activeContactTab === 'phones' ? 'Phone' : 'Email'}
                  </button>
                </div>
              </div>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Addresses Tab */}
              {activeContactTab === 'addresses' && (
                <div className="space-y-4">
                  {/* Primary Home Address */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Primary Home</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Primary</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium">987 Neighborhood Ave</p>
                      <p>Springfield, IL 62702</p>
                      <p>United States</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created by Import Module • 2/12/2020 10:09:24</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Business</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium">Springfield Business Center</p>
                      <p>1233 Commerce Drive, Suite 400</p>
                      <p>Springfield, IL 62701</p>
                      <p>United States</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created by Manual Entry • 3/15/2023 14:22:15</span>
                      <span className="text-yellow-600 font-medium">⚠ Needs Verification</span>
                    </div>
                  </div>

                  {/* Seasonal Address */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 text-yellow-500">☀️</div>
                        <span className="font-semibold text-gray-900">Seasonal (Winter)</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium">Sunny Shores Resort Community</p>
                      <p>4625 43rd Place Northwest</p>
                      <p>Washington, DC 20016</p>
                      <p>United States</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created by Import Module • 11/8/2022 09:45:33</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Numbers Tab */}
              {activeContactTab === 'phones' && (
                <div className="space-y-4">
                  {/* Work Phone */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Work</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Call">
                          <PhoneIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium text-lg">(555) 678-9013</p>
                      <p className="text-gray-600">Office • Best time: 9 AM - 5 PM</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last called: Jan 15, 2024 • Outcome: Left voicemail</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>

                  {/* Home Phone */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Home</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Call">
                          <PhoneIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium text-lg">(555) 123-4567</p>
                      <p className="text-gray-600">Home • Best time: Evenings after 6 PM</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last called: Dec 8, 2023 • Outcome: Successful conversation</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Mobile</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Call">
                          <PhoneIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Text">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium text-lg">(555) 987-6543</p>
                      <p className="text-gray-600">Mobile • Available for texts</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last contacted: Jan 22, 2024 • Method: Text message</span>
                      <span className="text-yellow-600 font-medium">⚠ Needs Verification</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Addresses Tab */}
              {activeContactTab === 'emails' && (
                <div className="space-y-4">
                  {/* Work Email */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Work Email</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Send Email">
                          <EnvelopeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium text-lg">joseph.banks@banksfinancial.com</p>
                      <p className="text-gray-600">Business email • Response rate: High</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last emailed: Jan 18, 2024 • Status: Opened</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>

                  {/* Personal Email */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Personal Email</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Primary</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Send Email">
                          <EnvelopeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <p className="font-medium text-lg">{donor.email || donor.contactInfo?.email || 'No email provided'}</p>
                      <p className="text-gray-600">Personal email • Preferred for newsletters</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last emailed: Jan 20, 2024 • Status: Replied</span>
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Classification Codes Modal - Full CodesManager */}
      {isCodesModalOpen && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                      <input
                        type="email"
                        value={editFormData.primaryEmail}
                        onChange={(e) => handleEditFormChange('primaryEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Email</label>
                      <input
                        type="email"
                        value={editFormData.secondaryEmail}
                        onChange={(e) => handleEditFormChange('secondaryEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
                      <input
                        type="tel"
                        value={editFormData.homePhone}
                        onChange={(e) => handleEditFormChange('homePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        value={editFormData.mobilePhone}
                        onChange={(e) => handleEditFormChange('mobilePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone</label>
                      <input
                        type="tel"
                        value={editFormData.workPhone}
                        onChange={(e) => handleEditFormChange('workPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                      <input
                        type="tel"
                        value={editFormData.fax}
                        onChange={(e) => handleEditFormChange('fax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={editFormData.website}
                        onChange={(e) => handleEditFormChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://www.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                      <select
                        value={editFormData.preferredContactMethod}
                        onChange={(e) => handleEditFormChange('preferredContactMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Mail">Mail</option>
                        <option value="Text">Text</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={editFormData.facebook}
                        onChange={(e) => handleEditFormChange('facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://www.facebook.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={editFormData.twitter}
                        onChange={(e) => handleEditFormChange('twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information Tab */}
              {activeModalTab === 'address' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                    <select
                      value={editFormData.addressType}
                      onChange={(e) => handleEditFormChange('addressType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Mailing">Mailing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={editFormData.street}
                      onChange={(e) => handleEditFormChange('street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Address Line 1</label>
                    <input
                      type="text"
                      value={editFormData.additionalAddressLine1}
                      onChange={(e) => handleEditFormChange('additionalAddressLine1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Address Line 2</label>
                    <input
                      type="text"
                      value={editFormData.additionalAddressLine2}
                      onChange={(e) => handleEditFormChange('additionalAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => handleEditFormChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={editFormData.state}
                        onChange={(e) => handleEditFormChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={editFormData.zipCode}
                        onChange={(e) => handleEditFormChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeModalTab === 'professional' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={editFormData.jobTitle}
                        onChange={(e) => handleEditFormChange('jobTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={editFormData.company}
                        onChange={(e) => handleEditFormChange('company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            </div>
          </div>
        </div>
      )}

      {/* Classification Codes Modal - Full CodesManager */}
      {isCodesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Classification Codes</h3>
              <button
                onClick={() => setIsCodesModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CodesManager Content - Enhanced for modal */}
            <div className="flex-1 overflow-hidden min-h-0 p-4 sm:p-6">
              <div className="h-full">
                <style>
                  {`
                    .codes-modal .max-h-80 {
                      max-height: calc(60vh - 200px) !important;
                      min-height: 300px;
                    }
                    @media (max-width: 640px) {
                      .codes-modal .max-h-80 {
                        max-height: calc(70vh - 150px) !important;
                        min-height: 250px;
                      }
                    }
                  `}
                </style>
                <div className="codes-modal">
                  <CodesManager donor={donor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Modal - Full Tasks Management */}
      {isTasksModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              <button
                onClick={() => setIsTasksModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tasks Content */}
            <div className="flex-1 overflow-hidden min-h-0 p-4 sm:p-6">
              <div className="h-full overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                    <div className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2 py-1 rounded-full font-medium">
                      {tasksData.summary.total} Total
                    </div>
                  </div>
                  <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Add Task
                  </button>
                </div>

                {/* Task Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{tasksData.summary.open}</div>
                    <div className="text-sm text-gray-600">Open</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{tasksData.summary.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{tasksData.summary.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-1">Done</div>
                      <div className="col-span-2">Due</div>
                      <div className="col-span-2">For</div>
                      <div className="col-span-2">By</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Priority</div>
                      <div className="col-span-1">Subject</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {tasksData.tasks.map((task) => (
                      <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 text-sm">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={task.done}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              readOnly
                            />
                          </div>
                          <div className="col-span-2 text-gray-900">{task.due}</div>
                          <div className="col-span-2 text-gray-600">{task.for}</div>
                          <div className="col-span-2 text-gray-600">{task.by}</div>
                          <div className="col-span-2">
                            <div className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2 py-1 rounded-full font-medium inline-block">
                              {task.type}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className={`text-xs px-2 py-1 rounded-full font-medium inline-block border ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                              task.priority === 'Low' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {task.priority}
                            </div>
                          </div>
                          <div className="col-span-1 text-gray-900 font-medium">{task.subject}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Data Confirmation Modal */}
      {showEnhancementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Enhance Donor Data</h3>
              </div>
              <button
                onClick={handleCancelEnhancement}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Data Enhancement Details</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This will retrieve comprehensive demographic and political data from i360 for <strong>{donor.name}</strong>.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-800 mb-1">Data Usage Notice</h5>
                    <p className="text-sm text-amber-700">
                      External data requests may incur costs and are subject to usage limits.
                      Enhanced data will be cached for future use.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                <h5 className="font-medium text-gray-900 mb-2">Data Retrieved:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Demographics (age, income, education)</li>
                  <li>• Political engagement and party affiliation</li>
                  <li>• Volunteer and event attendance propensity</li>
                  <li>• Giving capacity assessment</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button
                onClick={handleCancelEnhancement}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmEnhancement}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Confirm Enhancement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={handleCloseGiftModal}
        gift={selectedGift}
        mode={giftModalMode}
      />

      {/* Moves Management Modal */}
      {showMovesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-crimson-blue to-crimson-dark-blue text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <TrendingUpIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Moves Management</h2>
                    <p className="text-blue-100 text-sm">{donor.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseMovesModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Current Move Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Current Move</h3>
                    <div className="bg-blue-100 text-blue-800 border border-blue-200 text-sm px-3 py-1 rounded-full font-medium">
                      {movesManagementData.currentMove.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-blue-900">Subject:</span>
                        <span className="ml-2 text-blue-800">{movesManagementData.currentMove.subject}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Stage:</span>
                        <span className="ml-2 text-blue-800">{movesManagementData.currentMove.stage}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Priority:</span>
                        <span className="ml-2 text-blue-800">{movesManagementData.currentMove.priority}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-blue-900">Proposal Amount:</span>
                        <span className="ml-2 text-blue-800">${movesManagementData.currentMove.proposalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Manager:</span>
                        <span className="ml-2 text-blue-800">{movesManagementData.currentMove.manager}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Due Date:</span>
                        <span className="ml-2 text-blue-800">{movesManagementData.currentMove.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-blue-900">Description:</span>
                    <p className="mt-1 text-blue-800">{movesManagementData.currentMove.description}</p>
                  </div>
                </div>

                {/* Pipeline Stages */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Progress</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {movesManagementData.stages.map((stage, index) => (
                      <div key={index} className={`text-center p-4 rounded-lg border ${
                        stage.active ? 'bg-blue-100 border-blue-300' :
                        stage.completed ? 'bg-green-50 border-green-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`text-sm font-medium mb-2 ${
                          stage.active ? 'text-blue-800' :
                          stage.completed ? 'text-green-700' :
                          'text-gray-600'
                        }`}>
                          {stage.stage}
                        </div>
                        <div className={`text-2xl font-bold ${
                          stage.active ? 'text-blue-900' :
                          stage.completed ? 'text-green-800' :
                          'text-gray-700'
                        }`}>
                          {stage.count}
                        </div>
                        {stage.completed && (
                          <div className="mt-2">
                            <CheckIcon className="w-4 h-4 text-green-600 mx-auto" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks and Notes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasks */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                      <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                        <PlusIcon className="w-4 h-4 inline mr-1" />
                        Add Task
                      </button>
                    </div>
                    <div className="space-y-3">
                      {movesManagementData.tasks.map((task) => (
                        <div key={task.id} className={`p-4 rounded-lg border ${
                          task.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={task.done}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              readOnly
                            />
                            <div className="flex-1">
                              <div className={`font-medium ${task.done ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                                {task.subject}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Due:</span> {task.due} |
                                <span className="font-medium ml-2">Assigned to:</span> {task.assignedTo}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.priority}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                      <button className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors">
                        <PlusIcon className="w-4 h-4 inline mr-1" />
                        Add Note
                      </button>
                    </div>
                    <div className="space-y-4">
                      {movesManagementData.notes.map((note) => (
                        <div key={note.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{note.author}</span>
                              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                note.type === 'Contact' ? 'bg-blue-100 text-blue-800' :
                                note.type === 'Research' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {note.type}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{note.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Move History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Move History</h3>
                  <div className="space-y-3">
                    {movesManagementData.history.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{item.action}</span>
                            <span className="text-sm text-gray-500">{item.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                          <p className="text-xs text-gray-500 mt-1">by {item.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Smart Bio Confirmation Modal */}
      {showSmartBioConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#2563eb'}}>
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Generate Enhanced Smart Bio</h3>
                  <p className="text-sm text-gray-600">Multi-source AI research</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-800 font-medium text-sm">Estimated cost:</span>
                    <span className="text-yellow-900 font-semibold text-sm">~$0.02 per bio</span>
                  </div>
                  <p className="text-yellow-700 text-xs">
                    This will generate a comprehensive donor bio using AI research. Estimated cost: <strong>~$0.02</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSmartBioConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateEnhancedSmartBio}
                  disabled={isGeneratingSmartBio}
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{backgroundColor: '#2563eb'}}
                >
                  {isGeneratingSmartBio ? 'Generating...' : 'Generate Bio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citations Modal */}
      {showCitationsModal && smartBioData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sources ({getVisibleCitations().length} visible{getHiddenCitations().length > 0 ? `, ${getHiddenCitations().length} hidden` : ''})
                </h3>
                <button
                  onClick={() => setShowCitationsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Visible Citations */}
              {getVisibleCitations().length > 0 ? (
                <div className="space-y-4">
                  {getVisibleCitations().map((citation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{citation.title}</h4>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all transition-colors"
                          >
                            {citation.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Hide Citation Button */}
                          <button
                            onClick={() => handleHideCitation(citation)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Hide this source"
                          >
                            <EyeSlashIcon className="w-4 h-4" />
                          </button>
                          {/* External Link Button */}
                          <button
                            onClick={() => window.open(citation.url, '_blank')}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Open in new tab"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <DocumentIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No sources available</p>
                </div>
              )}

              {/* Hidden Sources Section */}
              {getHiddenCitations().length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowHiddenSources(!showHiddenSources)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4"
                  >
                    <EyeIcon className="w-4 h-4" />
                    {showHiddenSources ? 'Hide' : 'Show'} Hidden Sources ({getHiddenCitations().length})
                  </button>

                  {showHiddenSources && (
                    <div className="space-y-3">
                      {getHiddenCitations().map((citation, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">H</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-600 mb-1 line-through">{citation.title}</h4>
                              <p className="text-gray-500 text-sm break-all line-through">{citation.url}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Hidden {citation.isPermanent ? 'permanently' : 'for this session'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRestoreCitation(citation.url, citation.isPermanent)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Restore this source"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hide Citation Confirmation Modal */}
      {showHideCitationModal && citationToHide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <EyeSlashIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hide Source</h3>
                  <p className="text-sm text-gray-600">This will hide this source from the bio</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{citationToHide.title}</h4>
                <p className="text-xs text-gray-600 break-all">{citationToHide.url}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmHideCitation(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  Hide for this session only
                </button>
                <button
                  onClick={() => confirmHideCitation(true)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Hide permanently
                </button>
                <button
                  onClick={() => setShowHideCitationModal(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {showFeedbackToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <HandThumbUpIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Thank you for your feedback!</h4>
              <p className="text-xs text-gray-600">Your input helps us improve the Smart Bio feature.</p>
            </div>
          </div>
        </div>
      )}

      {/* Negative Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HandThumbDownIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Thank you for your feedback</h3>
                  <p className="text-sm text-gray-600">Help us improve the Smart Bio feature</p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  What could be better? (optional)
                </label>
                <textarea
                  id="feedback-comment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Help us improve - what could be better? (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitNegativeFeedback}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackComment('');
                    setFeedbackGiven(null); // Reset so user can try again
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setEditingNote(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveNote({
                title: formData.get('title'),
                content: formData.get('content'),
                category: formData.get('category'),
                isImportant: formData.get('isImportant') === 'on'
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingNote?.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter note title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editingNote?.category || 'general'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Content
                </label>
                <textarea
                  name="content"
                  rows={6}
                  defaultValue={editingNote?.content || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter detailed note content..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isImportant"
                  id="isImportant"
                  defaultChecked={editingNote?.isImportant || false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-700">
                  Mark as important
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setEditingNote(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#2f7fc3' }}
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveEvent({
                title: formData.get('title'),
                description: formData.get('description'),
                type: formData.get('type'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                status: formData.get('status'),
                attendees: parseInt(formData.get('attendees') as string) || 0
              });
            }} className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingEvent?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    name="type"
                    defaultValue={editingEvent?.type || 'meeting'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="tour">Tour</option>
                    <option value="call">Phone Call</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingEvent?.status || 'pending'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={editingEvent?.time || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event location..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    defaultValue={editingEvent?.attendees || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={editingEvent?.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event description..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#2f7fc3' }}
                >
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Creation Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create Donor Segment</h3>
                  <p className="text-sm text-gray-600">Confirm segment creation</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  You're about to create a new segment with <strong>{selectedLookalikes.length} donors</strong> similar to {donor.name}.
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Total potential giving: <strong>${selectedLookalikes.reduce((sum, l) => sum + l.totalGiven, 0).toLocaleString()}</strong></div>
                    <div>• Average gift size: <strong>${Math.round(selectedLookalikes.reduce((sum, l) => sum + l.avgGift, 0) / selectedLookalikes.length).toLocaleString()}</strong></div>
                    <div>• Average similarity: <strong>{Math.round(selectedLookalikes.reduce((sum, l) => sum + l.similarityScore, 0) / selectedLookalikes.length)}%</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <label htmlFor="termsAccepted" className="text-xs text-gray-600">
                    I understand that this segment will be created for outreach purposes and that all donor data will be handled in compliance with privacy regulations and organizational policies.
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setTermsAccepted(false);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSegmentCreation}
                  disabled={!termsAccepted}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Create Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DialR Integration Modal */}
      {showDialRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Send to DialR</h3>
                  <p className="text-sm text-gray-600">Add {donor.name} to a calling list</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4 text-sm">
                  Select a DialR list to add this donor for phone outreach campaigns.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleDialRListSelection('My List')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium text-gray-900">My List</div>
                      <div className="text-xs text-gray-600">Personal calling queue</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDialRListSelection('Major Donors List')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <UserGroupIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Major Donors List</div>
                      <div className="text-xs text-gray-600">High-value donor outreach</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDialRListSelection('Monthly Giving Campaign')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Monthly Giving Campaign</div>
                      <div className="text-xs text-gray-600">Recurring donor cultivation</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDialRListSelection('Year-End Appeal')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Year-End Appeal</div>
                      <div className="text-xs text-gray-600">Annual campaign outreach</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDialRModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDialRListSelection('My List')}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Add to My List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Management Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notes Management</h3>
                    <p className="text-sm text-gray-600">{notesData.length} notes for {donor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#2f7fc3' }}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Note
                  </button>
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Notes Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{notesData.length}</div>
                  <div className="text-xs text-gray-600">Total Notes</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{notesData.filter(n => n.isImportant).length}</div>
                  <div className="text-xs text-gray-600">Important</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{notesData.filter(n => n.category === 'meeting').length}</div>
                  <div className="text-xs text-gray-600">Meetings</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{notesData.filter(n => n.category === 'call').length}</div>
                  <div className="text-xs text-gray-600">Calls</div>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notesData.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h4>
                    <p className="text-gray-600 mb-4">Start documenting interactions and important information about this donor.</p>
                    <button
                      onClick={() => setShowAddNoteModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#2f7fc3' }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add First Note
                    </button>
                  </div>
                ) : (
                  notesData.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.category === 'meeting' ? '#10b981' : note.category === 'call' ? '#3b82f6' : '#8b5cf6' }}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{note.category}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{note.date}</span>
                          {note.isImportant && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <div className="flex items-center gap-1 text-xs text-amber-600">
                                <StarIcon className="w-3 h-3 fill-current" />
                                Important
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{note.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{note.content}</p>
                      <div className="text-xs text-gray-500">
                        By {note.author}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {showAddressBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <AddressBookIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address Book</h3>
                    <p className="text-sm text-gray-600">{contactsData.length} contacts for {donor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#2f7fc3' }}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowAddressBookModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Contact Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{contactsData.length}</div>
                  <div className="text-xs text-gray-600">Total Contacts</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{contactsData.filter(c => c.isPrimary).length}</div>
                  <div className="text-xs text-gray-600">Primary</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{contactsData.filter(c => c.type === 'spouse').length}</div>
                  <div className="text-xs text-gray-600">Spouse</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{contactsData.filter(c => c.type === 'business').length}</div>
                  <div className="text-xs text-gray-600">Business</div>
                </div>
              </div>

              {/* Contacts List */}
              <div className="space-y-4">
                {contactsData.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <AddressBookIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h4>
                    <p className="text-gray-600 mb-4">Add contact information to build your address book.</p>
                    <button
                      onClick={() => setShowAddContactModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#2f7fc3' }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add First Contact
                    </button>
                  </div>
                ) : (
                  contactsData.map((contact) => (
                    <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {contact.title} {contact.firstName} {contact.lastName}
                              </h4>
                              {contact.isPrimary && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Primary
                                </span>
                              )}
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                                {contact.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{contact.position} at {contact.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!contact.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryContact(contact.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Set as Primary"
                            >
                              <StarIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{contact.phone}</span>
                          </div>
                          {contact.mobile && (
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{contact.mobile}</span>
                              <span className="text-xs text-gray-500">(Mobile)</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div>{contact.address.street}</div>
                              <div>{contact.address.city}, {contact.address.state} {contact.address.zip}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {contact.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">{contact.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        Created: {contact.createdDate} • Last updated: {contact.lastUpdated}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddContactModal(false);
                    setEditingContact(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveContact({
                type: formData.get('type'),
                title: formData.get('title'),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                mobile: formData.get('mobile'),
                address: {
                  street: formData.get('street'),
                  city: formData.get('city'),
                  state: formData.get('state'),
                  zip: formData.get('zip'),
                  country: formData.get('country') || 'USA'
                },
                company: formData.get('company'),
                position: formData.get('position'),
                notes: formData.get('notes'),
                isPrimary: formData.get('isPrimary') === 'on'
              });
            }} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                  <select
                    name="type"
                    defaultValue={editingContact?.type || 'primary'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="primary">Primary</option>
                    <option value="spouse">Spouse</option>
                    <option value="business">Business</option>
                    <option value="family">Family</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <select
                    name="title"
                    defaultValue={editingContact?.title || 'Mr.'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingContact?.firstName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingContact?.lastName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name..."
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingContact?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingContact?.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile (Optional)</label>
                  <input
                    type="tel"
                    name="mobile"
                    defaultValue={editingContact?.mobile || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mobile number..."
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Address</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    defaultValue={editingContact?.address?.street || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter street address..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingContact?.address?.city || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={editingContact?.address?.state || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter state..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      defaultValue={editingContact?.address?.zip || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter ZIP code..."
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingContact?.company || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={editingContact?.position || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter position/title..."
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingContact?.notes || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any additional notes..."
                />
              </div>

              {/* Primary Contact */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrimary"
                  id="isPrimary"
                  defaultChecked={editingContact?.isPrimary || false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                  Set as primary contact
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContactModal(false);
                    setEditingContact(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#2f7fc3' }}
                >
                  {editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Draggable Panel Container Component
interface DraggablePanelContainerProps {
  panelOrder: string[];
  draggedPanel: string | null;
  onDragStart: (e: React.DragEvent, panelId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetPanelId: string) => void;
  onDragEnd: () => void;
  donor: Donor;
  activeAITab: 'insights' | 'bio';
  setActiveAITab: (tab: 'insights' | 'bio') => void;
  formatCurrency: (amount: number) => string;
  getSmartTags: () => any[];
  getClassificationCodes: () => any[];
  getAllClassificationCodes: () => any[];
  getCodeHexColor: (color: string) => string;
  performance: any;
  collapsedPanels: Set<string>;
  togglePanelCollapse: (panelId: string) => void;
  handleEditClick: () => void;
  setIsCodesModalOpen: (open: boolean) => void;
  tasksData: any;
  getMostRecentOpenTask: () => any;
  setIsTasksModalOpen: (open: boolean) => void;
  // Notes props
  notesData: any[];
  setShowNotesModal: (show: boolean) => void;
  // Address Book props
  contactsData: any[];
  setShowAddressBookModal: (show: boolean) => void;
}

const DraggablePanelContainer: React.FC<DraggablePanelContainerProps> = ({
  panelOrder,
  draggedPanel,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  donor,
  activeAITab,
  setActiveAITab,
  formatCurrency,
  getSmartTags,
  getClassificationCodes,
  getAllClassificationCodes,
  getCodeHexColor,
  performance,
  collapsedPanels,
  togglePanelCollapse,
  handleEditClick,
  setIsCodesModalOpen,
  tasksData,
  getMostRecentOpenTask,
  setIsTasksModalOpen,
  notesData,
  setShowNotesModal,
  contactsData,
  setShowAddressBookModal
}) => {
  const renderPanel = (panelId: string) => {
    const isDragging = draggedPanel === panelId;
    const baseClasses = `bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-3 cursor-move transition-all duration-300 shadow-sm hover:shadow-md ${
      isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:bg-white hover:border-gray-300/60 hover:scale-[1.02]'
    }`;

    switch (panelId) {
      case 'smartTags':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('smartTags')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Smart Tags"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('smartTags') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight flex items-center gap-1">
                  Smart Tags
                  <SparklesIcon className="w-3.5 h-3.5 text-purple-500" />
                  <SparklesIcon className="w-3.5 h-3.5 text-purple-500" />
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {/* Action buttons can be added here in the future */}
              </div>
            </div>
            {!collapsedPanels.has('smartTags') && (
              <div className="flex flex-wrap gap-2">
                {getSmartTags().map((tag, index) => (
                  <SmartTag
                    key={index}
                    name={tag.name}
                    emoji={tag.emoji}
                    color={tag.color}
                    size="sm"
                    showAI={true}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'contact':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('contact')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Contact Info"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('contact') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Contact Info</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEditClick}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Contact Info"
                >
                  <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            {!collapsedPanels.has('contact') && (
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium hover:opacity-80 text-xs" style={{ color: '#2f7fc3' }}>
                    {donor.email || donor.contactInfo?.email || 'No email provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <PhoneIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium hover:opacity-80 text-xs" style={{ color: '#2f7fc3' }}>
                    {formatPhone(donor.phone || donor.contactInfo?.home || '(555) 123-4567')}
                  </span>
                </div>
                {donor.spouse && (
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                      <UserIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium hover:opacity-80 text-xs" style={{ color: '#2f7fc3' }}>
                        {donor.spouse.name}
                      </span>
                      <span className="text-xs text-gray-500">Spouse</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5 border border-gray-200">
                    <MapPinIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-gray-700 font-medium text-xs leading-relaxed">
                    <div>{donor.primaryAddress?.street || '987 Neighborhood Ave'}</div>
                    <div>
                      {donor.primaryAddress?.city || 'Springfield'}, {donor.primaryAddress?.state || 'IL'} {donor.primaryAddress?.zipCode || '62701'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'relationships':
        // Prioritize spouse first, then primary contact, then any contact
        const spouseContact = contactsData.find(c => c.type === 'spouse');
        const primaryContact = contactsData.find(c => c.isPrimary);
        const displayContact = spouseContact || primaryContact || contactsData[0];
        const totalContacts = contactsData.length;

        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('relationships')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Contacts"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('relationships') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Contacts</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAddressBookModal(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View All Contacts"
                >
                  <EllipsisHorizontalIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            {!collapsedPanels.has('relationships') && (
              <div className="space-y-3">
                {/* Single Contact Display */}
                {displayContact ? (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {displayContact.type === 'spouse' ? 'Spouse' : displayContact.type}
                      </span>
                      {totalContacts > 1 && (
                        <span className="text-xs text-gray-500">+{totalContacts - 1} more</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {displayContact.firstName} {displayContact.lastName}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {displayContact.position} at {displayContact.company}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {displayContact.email}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-xs">No contacts added</div>
                    <button
                      onClick={() => setShowAddressBookModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Add first contact
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'codes':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('codes')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Codes"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('codes') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">Codes</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCodesModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="View All Codes"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>
            {!collapsedPanels.has('codes') && (
              <div className="space-y-3">
                {getClassificationCodes().length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {getClassificationCodes().map((code) => (
                        <div
                          key={code.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105"
                          style={{
                            backgroundColor: `${getCodeHexColor(code.color)}15`,
                            border: `1px solid ${getCodeHexColor(code.color)}40`,
                            color: getCodeHexColor(code.color)
                          }}
                          onClick={() => alert(`Clicked ${code.name} (${code.code})`)}
                          title={`${code.description} - Applied ${code.date}`}
                        >
                          <span className="font-medium">{code.code}</span>
                          {code.star && <span className="text-orange-500">★</span>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    No classification codes applied
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'tasks':
        const mostRecentTask = getMostRecentOpenTask();
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('tasks')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Tasks"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('tasks') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">Tasks</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTasksModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="View All Tasks"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>
            </div>
            {!collapsedPanels.has('tasks') && (
              <div className="space-y-3">
                {mostRecentTask ? (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {mostRecentTask.subject}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {mostRecentTask.description}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Due: {mostRecentTask.due}
                          </span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            mostRecentTask.type === 'Meeting' ? 'bg-blue-100 text-blue-800' :
                            mostRecentTask.type === 'Follow-up' ? 'bg-green-100 text-green-800' :
                            mostRecentTask.type === 'Call' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {mostRecentTask.type}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            mostRecentTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                            mostRecentTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {mostRecentTask.priority}
                          </div>
                        </div>
                        {mostRecentTask.askAmount && (
                          <div className="mt-2 text-xs font-medium text-green-600">
                            Ask: {formatCurrency(mostRecentTask.askAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    No open tasks
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'experts':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('experts')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Assigned Experts"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('experts') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">Assigned Experts</h3>
              </div>
              <div className="flex items-center gap-1">
                {/* Action buttons can be added here in the future */}
              </div>
            </div>
            {!collapsedPanels.has('experts') && (
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-indigo-900">Sarah Johnson</div>
                    <div className="text-xs text-indigo-600">Development Officer</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'notes':
        const mostRecentNote = notesData.length > 0 ? notesData[0] : null;

        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className={baseClasses}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePanelCollapse('notes')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Collapse Notes"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      collapsedPanels.has('notes') ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Notes</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Manage Notes"
                >
                  <EllipsisHorizontalIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            {!collapsedPanels.has('notes') && (
              <div className="space-y-2">
                {mostRecentNote ? (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{mostRecentNote.category}</span>
                      <div className="flex items-center gap-2">
                        {notesData.length > 1 && (
                          <span className="text-xs text-gray-500">+{notesData.length - 1} more</span>
                        )}
                        <span className="text-xs text-gray-500">{mostRecentNote.date}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{mostRecentNote.title}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{mostRecentNote.content}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">by {mostRecentNote.author}</span>
                      <div className="flex items-center gap-1">
                        {mostRecentNote.isPrivate && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Private</span>
                        )}
                        {mostRecentNote.isImportant && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Important</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-xs">No notes added</div>
                    <button
                      onClick={() => setShowNotesModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Add first note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );



      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {panelOrder.map(renderPanel)}
    </div>
  );
};

// Draggable Overview Container Component
interface DraggableOverviewContainerProps {
  panelOrder: string[];
  draggedPanel: string | null;
  onDragStart: (e: React.DragEvent, panelId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetPanelId: string) => void;
  onDragEnd: () => void;
  donor: Donor;
  activeAITab: 'insights' | 'bio';
  setActiveAITab: (tab: 'insights' | 'bio') => void;
  minimizedOverviewPanels: Set<string>;
  toggleOverviewPanelMinimized: (panelId: string) => void;
  movesManagementData: any;
  handleOpenMovesModal: () => void;
  // Enhanced Smart Bio props
  smartBioData: SmartBioData | null;
  isGeneratingSmartBio: boolean;
  showSmartBioConfirmModal: boolean;
  smartBioError: string;
  setShowSmartBioConfirmModal: (show: boolean) => void;
  generateEnhancedSmartBio: () => void;
  // Citations Modal props
  showCitationsModal: boolean;
  setShowCitationsModal: (show: boolean) => void;
  // Bio editing props
  isEditingBio: boolean;
  setIsEditingBio: (editing: boolean) => void;
  originalBioText: string[];
  setOriginalBioText: (text: string[]) => void;
  editedBioText: string[];
  setEditedBioText: (text: string[]) => void;
  showQuickActionsDropdown: boolean;
  setShowQuickActionsDropdown: (show: boolean) => void;
  // Bio action functions
  handleEditBio: () => void;
  handleResetBio: () => void;
  handleSaveEditedBio: () => void;
  handleCancelEdit: () => void;
  handleCopyToClipboard: () => void;
  handleExportAsPDF: () => void;

  handleEmailBio: () => void;
  handleReportIssue: () => void;
  // DialR Integration props
  handleDialRClick: () => void;
  // Custom AI Insights prop
  customAIInsights?: React.ReactNode;
  // Feedback system props
  feedbackGiven: 'positive' | 'negative' | null;
  handlePositiveFeedback: () => void;
  handleNegativeFeedback: () => void;
}

const DraggableOverviewContainer: React.FC<DraggableOverviewContainerProps> = ({
  panelOrder,
  draggedPanel,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  donor,
  activeAITab,
  setActiveAITab,
  minimizedOverviewPanels,
  toggleOverviewPanelMinimized,
  movesManagementData,
  handleOpenMovesModal,
  smartBioData,
  isGeneratingSmartBio,
  showSmartBioConfirmModal,
  smartBioError,
  setShowSmartBioConfirmModal,
  generateEnhancedSmartBio,
  showCitationsModal,
  setShowCitationsModal,
  isEditingBio,
  setIsEditingBio,
  originalBioText,
  setOriginalBioText,
  editedBioText,
  setEditedBioText,
  showQuickActionsDropdown,
  setShowQuickActionsDropdown,
  handleEditBio,
  handleResetBio,
  handleSaveEditedBio,
  handleCancelEdit,
  handleCopyToClipboard,
  handleExportAsPDF,

  handleEmailBio,
  handleReportIssue,
  handleDialRClick,
  customAIInsights,
  // Feedback system props
  feedbackGiven,
  handlePositiveFeedback,
  handleNegativeFeedback
}) => {
  const renderOverviewPanel = (panelId: string) => {
    const isDragging = draggedPanel === panelId;
    const baseClasses = `bg-white rounded-lg border border-gray-200 p-6 mb-6 cursor-move transition-all duration-200 ${
      isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
    }`;

    switch (panelId) {
      case 'aiInsights':
        // Use custom AI Insights if provided, otherwise use default Enterprise version
        if (customAIInsights) {
          return (
            <div
              key={panelId}
              draggable
              onDragStart={(e) => onDragStart(e, panelId)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, panelId)}
              onDragEnd={onDragEnd}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 cursor-move transition-all duration-200 hover:shadow-md"
            >
              {customAIInsights}
            </div>
          );
        }

        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 cursor-move transition-all duration-200 hover:shadow-md"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)' }}>
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Insights
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Level-Up List</span>
                  </div>
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveAITab('insights')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeAITab === 'insights'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{
                    color: activeAITab === 'insights' ? '#2563eb' : '#6b7280'
                  }}
                >
                  <SparklesIcon className="w-3 h-3 inline mr-1" style={{ color: '#2563eb' }} />
                  Insights
                </button>
                <button
                  onClick={() => setActiveAITab('bio')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeAITab === 'bio'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{
                    color: activeAITab === 'bio' ? '#2563eb' : '#6b7280'
                  }}
                >
                  <SparklesIcon className="w-3 h-3 inline mr-1" style={{ color: '#2563eb' }} />
                  Smart Bio
                </button>
              </div>
            </div>

            {activeAITab === 'insights' && (
              <div className="space-y-3">
                {/* Compact 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Giving Metrics */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm">
                        <div className="text-xs text-gray-600 mb-1">Total Given</div>
                        <div className="text-lg font-bold text-gray-900">$15,200</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm">
                        <div className="text-xs text-gray-600 mb-1">Potential</div>
                        <div className="text-lg font-bold text-gray-900">$24,500</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200 transition-all duration-200 hover:shadow-sm">
                      <div className="text-xs text-gray-600 mb-1">Suggested Ask</div>
                      <div className="text-xl font-bold text-green-700">$1,000</div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{width: '62%', background: `linear-gradient(to right, #2563eb, #dc2626)`}}></div>
                    </div>
                  </div>

                  {/* Right Column: Insights & Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm">
                      <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                        <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-xs font-medium">Below capacity at 62% - eligible for upgrade.</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm">
                      <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-xs font-medium">Gift Readiness: Next 30 Days</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm">
                      <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center flex-shrink-0">
                        <BoltIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-700 text-xs font-medium">Recurring Readiness: 58% - Suggested Monthly $125</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={handleDialRClick}
                        className="flex items-center justify-center gap-1 text-white text-xs font-medium py-2 px-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#2563eb' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      >
                        <PhoneIcon className="w-3 h-3" />
                        Send to DialR
                      </button>
                      <button className="flex items-center justify-center gap-1 text-white text-xs font-medium py-2 px-2 rounded-lg transition-colors" style={{ backgroundColor: '#2563eb' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        TargetPath
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAITab === 'bio' && (
              <div className="space-y-4">
                {smartBioError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{smartBioError}</p>
                  </div>
                )}


                {smartBioData ? (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4" style={{ color: '#2563eb' }} />
                        <h3 className="text-base font-semibold text-gray-900">Enhanced Smart Bio</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowSmartBioConfirmModal(true)}
                          disabled={isGeneratingSmartBio}
                          className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    {/* Bio Content */}
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none">
                        {/* Headlines - with editing capability */}
                        <div className="mb-3">
                          {isEditingBio ? (
                            <div className="space-y-2">
                              {editedBioText.map((headline, index) => (
                                <textarea
                                  key={index}
                                  value={headline}
                                  onChange={(e) => {
                                    const newText = [...editedBioText];
                                    newText[index] = e.target.value;
                                    setEditedBioText(newText);
                                  }}
                                  className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                                  rows={2}
                                />
                              ))}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={handleSaveEditedBio}
                                  className="px-3 py-1 text-white text-xs rounded transition-all duration-200 hover:shadow-md hover:scale-105"
                                  style={{ backgroundColor: '#2563eb' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded transition-all duration-200 hover:bg-gray-600 hover:shadow-md hover:scale-105"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="transition-opacity duration-300 ease-out">
                              {smartBioData.perplexityHeadlines.map((headline, index) => (
                                <p key={index} className="text-gray-900 text-sm mb-2 transition-all duration-200" style={{ lineHeight: '1.6' }}>
                                  {headline}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Wealth Summary */}
                        {smartBioData.wealthSummary && (
                          <div className="bg-blue-gray-50 border-l-4 pl-4 py-2 mb-3 rounded-r-md transition-all duration-200 hover:bg-blue-gray-100" style={{ borderLeftColor: '#2563eb' }}>
                            <p className="text-gray-700 text-sm font-medium">
                              {smartBioData.wealthSummary}
                            </p>
                          </div>
                        )}

                        {/* Sources and Edit Controls */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Sources Button - Bottom Left */}
                          {smartBioData.perplexityCitations && smartBioData.perplexityCitations.length > 0 ? (
                            <button
                              onClick={() => setShowCitationsModal(true)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
                              style={{
                                backgroundColor: '#2563eb'
                              }}
                              title="View citation sources"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Sources ({smartBioData.perplexityCitations.length})
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 italic">No sources available</span>
                          )}

                          {/* Edit/Reset Controls - Bottom Right */}
                          {!isEditingBio && (
                            <div className="flex items-center gap-2">
                              {/* Edit Button - Icon Only */}
                              <button
                                onClick={handleEditBio}
                                className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                style={{
                                  backgroundColor: '#2563eb'
                                }}
                                title="Edit bio content"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>


                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio Actions - Timestamp and Actions Dropdown */}
                    {!isEditingBio && (
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">Generated {new Date(smartBioData.lastGenerated).toLocaleDateString()}</span>

                            {/* Feedback Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handlePositiveFeedback}
                                disabled={feedbackGiven !== null}
                                className={`p-1 rounded transition-colors ${
                                  feedbackGiven === 'positive'
                                    ? 'text-blue-600 bg-blue-100'
                                    : feedbackGiven === null
                                      ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                      : 'text-gray-300 cursor-not-allowed'
                                }`}
                                title={feedbackGiven ? 'Feedback already submitted' : 'This bio was helpful'}
                              >
                                <HandThumbUpIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleNegativeFeedback}
                                disabled={feedbackGiven !== null}
                                className={`p-1 rounded transition-colors ${
                                  feedbackGiven === 'negative'
                                    ? 'text-red-600 bg-red-100'
                                    : feedbackGiven === null
                                      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                      : 'text-gray-300 cursor-not-allowed'
                                }`}
                                title={feedbackGiven ? 'Feedback already submitted' : 'This bio needs improvement'}
                              >
                                <HandThumbDownIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Actions Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setShowQuickActionsDropdown(!showQuickActionsDropdown)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                Actions
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                              </button>

                              {showQuickActionsDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                  <div className="py-2">
                                    <button
                                      onClick={() => {
                                        handleCopyToClipboard();
                                        setShowQuickActionsDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                      Copy Bio
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleExportAsPDF();
                                        setShowQuickActionsDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Export as PDF
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleEmailBio();
                                        setShowQuickActionsDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 flex items-center gap-3"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      Email Bio
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        handleReportIssue();
                                        setShowQuickActionsDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 flex items-center gap-3"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      Report Issue
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl p-4 border border-gray-200" style={{background: 'linear-gradient(135deg, #ecf4ff 0%, #dbeafe 100%)'}}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{backgroundColor: '#2563eb'}}>
                        <SparklesIcon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Enhanced Smart Bio</h4>
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Get a complete donor snapshot with intelligence you can act on.</h3>
                      <p className="text-xs text-gray-600 mb-4">See what matters most: recent news, issue alignment, and<br />wealth signals, summarized for action.</p>
                      <button
                        onClick={() => setShowSmartBioConfirmModal(true)}
                        disabled={isGeneratingSmartBio}
                        className="text-white text-xs font-semibold py-2 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                        style={{background: '#2563eb'}}
                        onMouseEnter={(e) => !isGeneratingSmartBio && (e.currentTarget.style.background = '#1d4ed8')}
                        onMouseLeave={(e) => !isGeneratingSmartBio && (e.currentTarget.style.background = '#2563eb')}
                      >
                        {isGeneratingSmartBio ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-3 h-3 inline mr-1" />
                            Create Enhanced Bio
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        );

      case 'recentActivity':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 cursor-move transition-all duration-200 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm font-medium transition-all duration-200 hover:opacity-80" style={{ color: '#2f7fc3' }}>
                  Show all
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 1,
                    type: 'gift',
                    title: 'Major Gift Received:',
                    description: 'Contributed $1,000 to Q1 2024 Campaign',
                    amount: '$1,000',
                    date: 'Feb 14'
                  },
                  {
                    id: 2,
                    type: 'call',
                    title: 'DialR Call Completed:',
                    description: '$1,000 Pledge',
                    date: 'Feb 9'
                  },
                  {
                    id: 3,
                    type: 'event',
                    title: 'Event RSVP Updated:',
                    description: 'Arlington 09/20/2025: Yes',
                    date: 'Feb 9'
                  }
                ].map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2 border-l-2 border-gray-100 pl-4 hover:border-blue-200 transition-colors">
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            <span className="font-medium text-gray-700">{activity.title}</span>
                            {' '}
                            <span className="text-gray-600">{activity.description}</span>
                            {activity.amount && (
                              <>
                                {' '}
                                <span className="font-semibold" style={{ color: '#2f7fc3' }}>
                                  {activity.amount}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 ml-4 flex-shrink-0 mt-0.5">
                          {activity.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'givingSummary':
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 cursor-move transition-all duration-200 hover:shadow-md"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giving Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm">
                  <p className="text-xl font-bold" style={{ color: '#2f7fc3' }}>
                    ${donor.givingOverview?.totalRaised?.toLocaleString() || '15,200'}
                  </p>
                  <p className="text-sm text-gray-600">Total Lifetime Giving</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200 transition-all duration-200 hover:shadow-sm">
                  <p className="text-xl font-bold text-green-900">
                    {donor.givingOverview?.consecutiveGifts || 12}
                  </p>
                  <p className="text-sm text-green-700">Total Gifts</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200 transition-all duration-200 hover:shadow-sm">
                  <p className="text-xl font-bold text-purple-900">
                    ${donor.givingOverview?.averageGift?.toLocaleString() || '1,900'}
                  </p>
                  <p className="text-sm text-purple-700">Average Gift</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'movesManagement':
        const isMinimized = minimizedOverviewPanels.has(panelId);
        return (
          <div
            key={panelId}
            draggable
            onDragStart={(e) => onDragStart(e, panelId)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, panelId)}
            onDragEnd={onDragEnd}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 cursor-move transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleOverviewPanelMinimized(panelId)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                >
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Moves Management</h3>
              </div>
              <button
                onClick={handleOpenMovesModal}
                className="px-3 py-2 text-sm font-medium bg-crimson-blue text-white rounded-lg hover:bg-crimson-dark-blue transition-colors"
              >
                View All Moves
              </button>
            </div>

            {!isMinimized && (
              <div className="space-y-4">
                {/* Current Move Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Current Move</h4>
                    <div className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                      {movesManagementData.currentMove.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-900">Subject:</span>
                      <span className="ml-2 text-blue-800">{movesManagementData.currentMove.subject}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Stage:</span>
                      <span className="ml-2 text-blue-800">{movesManagementData.currentMove.stage}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Amount:</span>
                      <span className="ml-2 text-blue-800">${movesManagementData.currentMove.proposalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Manager:</span>
                      <span className="ml-2 text-blue-800">{movesManagementData.currentMove.manager}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {movesManagementData.tasks.filter(task => !task.done).length}
                    </div>
                    <div className="text-sm text-gray-600">Open Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {movesManagementData.stages.find(stage => stage.active)?.stage.split('.')[0] || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Current Stage</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {movesManagementData.notes.length}
                    </div>
                    <div className="text-sm text-gray-600">Notes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {panelOrder.map(renderOverviewPanel)}
    </div>
  );
};

// Action Footer Component
const ActionFooter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };



  const mainActions = [
    {
      name: 'Dupe checker',
      description: 'Check for duplicate donor records',
      icon: MagnifyingGlassIcon,
      action: () => console.log('Dupe checker')
    },
    {
      name: 'Relationships',
      description: 'View and manage donor relationships',
      icon: UserGroupIcon,
      action: () => console.log('Relationships')
    },
    {
      name: 'LookUp',
      description: 'Google, LinkedIn, Google Map, Zillow, FEC.gov, WealthEngine',
      icon: ArrowTopRightOnSquareIcon,
      action: () => console.log('LookUp')
    },
    {
      name: 'Save VCard',
      description: 'Export donor contact as VCard',
      icon: AddressBookIcon,
      action: () => console.log('Save VCard')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-4">
          <div
            className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[320px] max-h-[500px] overflow-y-auto"
          >
            <div className="space-y-2">
              {mainActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/20 rounded-2xl transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-white/20"
                >
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 shadow-lg">
                    <action.icon className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-base mb-1">{action.name}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
        }`}
      >
        <span className="text-white text-2xl font-light">+</span>
      </button>

    </div>
  );
};

export default DonorProfileLayoutTest3;
