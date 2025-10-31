export const CONTRACT_ADDRESS = '0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7';

export const CONTRACT_ABI = [
  "function admin() external view returns (address)",
  "function consultationCounter() external view returns (uint256)",
  "function lawyerCounter() external view returns (uint256)",
  "function submitConsultation(uint32 _clientId, uint32 _categoryId, string calldata _encryptedQuestion) external payable",
  "function registerLawyer(uint32 _specialty) external",
  "function assignConsultation(uint256 consultationId, uint256 lawyerId) external",
  "function provideResponse(uint256 consultationId, string calldata _encryptedResponse) external",
  "function verifyLawyer(uint256 lawyerId) external",
  "function updateLawyerRating(uint256 lawyerId, uint32 newRating) external",
  "function deactivateLawyer(uint256 lawyerId) external",
  "function getConsultationDetails(uint256 consultationId) external view returns (string memory encryptedQuestion, string memory encryptedResponse, uint256 timestamp, uint256 fee, bool isResolved, bool isPaid)",
  "function getLawyerProfile(uint256 lawyerId) external view returns (uint256 consultationCount, bool isVerified, bool isActive)",
  "function getClientStats(address clientAddress) external view returns (uint256 totalConsultations, uint256 totalSpent)",
  "function getSystemStats() external view returns (uint256 totalConsultations, uint256 totalLawyers, uint256 verifiedLawyers)",
  "function withdrawFees(uint256 amount) external",
  "function getLegalCategory(uint256 categoryId) external view returns (string memory)",
  "function isRegisteredLawyer(address lawyerAddress) external view returns (bool)",
  "function getLawyerIdByAddress(address lawyerAddress) external view returns (uint256)",
  "function registeredLawyers(address) external view returns (bool)",
  "function lawyerIds(address) external view returns (uint256)"
];

export const LEGAL_CATEGORIES = [
  { id: 1, name: "Civil Law" },
  { id: 2, name: "Criminal Law" },
  { id: 3, name: "Family Law" },
  { id: 4, name: "Corporate Law" },
  { id: 5, name: "Employment Law" },
  { id: 6, name: "Real Estate Law" },
  { id: 7, name: "Immigration Law" },
  { id: 8, name: "Tax Law" }
];

export const EXPECTED_CHAIN_ID = 9000;
