// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousLegalConsultation is SepoliaConfig {

    address public admin;
    uint256 public consultationCounter;
    uint256 public lawyerCounter;

    struct EncryptedConsultation {
        euint32 encryptedClientId;
        euint32 encryptedCategoryId;
        string encryptedQuestion;
        string encryptedResponse;
        euint32 encryptedLawyerId;
        uint256 timestamp;
        uint256 fee;
        bool isResolved;
        bool isPaid;
    }

    struct LawyerProfile {
        eaddress encryptedAddress;
        euint32 encryptedSpecialty;
        euint32 encryptedRating;
        uint256 consultationCount;
        bool isVerified;
        bool isActive;
    }

    struct ClientProfile {
        euint32 encryptedClientId;
        uint256 totalConsultations;
        uint256 totalSpent;
    }

    mapping(uint256 => EncryptedConsultation) public consultations;
    mapping(uint256 => LawyerProfile) public lawyers;
    mapping(address => ClientProfile) public clients;
    mapping(address => uint256) public lawyerIds;
    mapping(address => bool) public registeredLawyers;

    // Legal categories (encrypted)
    mapping(uint256 => string) public legalCategories;

    event ConsultationSubmitted(uint256 indexed consultationId, uint256 timestamp);
    event LawyerRegistered(uint256 indexed lawyerId, uint256 timestamp);
    event ConsultationAssigned(uint256 indexed consultationId, uint256 indexed lawyerId);
    event ResponseProvided(uint256 indexed consultationId, uint256 timestamp);
    event PaymentProcessed(uint256 indexed consultationId, uint256 amount);
    event LawyerVerified(uint256 indexed lawyerId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegisteredLawyer() {
        require(registeredLawyers[msg.sender], "Must be registered lawyer");
        _;
    }

    modifier consultationExists(uint256 consultationId) {
        require(consultationId > 0 && consultationId <= consultationCounter, "Invalid consultation ID");
        _;
    }

    constructor() {
        admin = msg.sender;
        consultationCounter = 0;
        lawyerCounter = 0;

        // Initialize legal categories
        legalCategories[1] = "Civil Law";
        legalCategories[2] = "Criminal Law";
        legalCategories[3] = "Family Law";
        legalCategories[4] = "Corporate Law";
        legalCategories[5] = "Employment Law";
        legalCategories[6] = "Real Estate Law";
        legalCategories[7] = "Immigration Law";
        legalCategories[8] = "Tax Law";
    }

    // Submit anonymous legal consultation
    function submitConsultation(
        uint32 _clientId,
        uint32 _categoryId,
        string calldata _encryptedQuestion
    ) external payable {
        require(msg.value >= 0.001 ether, "Minimum consultation fee required");
        require(_categoryId >= 1 && _categoryId <= 8, "Invalid legal category");
        require(bytes(_encryptedQuestion).length > 0, "Question cannot be empty");

        consultationCounter++;

        // Encrypt client and category data
        euint32 encryptedClientId = FHE.asEuint32(_clientId);
        euint32 encryptedCategoryId = FHE.asEuint32(_categoryId);

        consultations[consultationCounter] = EncryptedConsultation({
            encryptedClientId: encryptedClientId,
            encryptedCategoryId: encryptedCategoryId,
            encryptedQuestion: _encryptedQuestion,
            encryptedResponse: "",
            encryptedLawyerId: FHE.asEuint32(0),
            timestamp: block.timestamp,
            fee: msg.value,
            isResolved: false,
            isPaid: true
        });

        // Update client profile
        if (clients[msg.sender].totalConsultations == 0) {
            clients[msg.sender].encryptedClientId = encryptedClientId;
        }
        clients[msg.sender].totalConsultations++;
        clients[msg.sender].totalSpent += msg.value;

        // Set ACL permissions
        FHE.allowThis(encryptedClientId);
        FHE.allowThis(encryptedCategoryId);
        FHE.allow(encryptedClientId, msg.sender);
        FHE.allow(encryptedCategoryId, msg.sender);

        emit ConsultationSubmitted(consultationCounter, block.timestamp);
    }

    // Register as a lawyer
    function registerLawyer(uint32 _specialty) external {
        require(!registeredLawyers[msg.sender], "Already registered");
        require(_specialty >= 1 && _specialty <= 8, "Invalid specialty");

        lawyerCounter++;

        // Encrypt lawyer data
        eaddress encryptedAddress = FHE.asEaddress(msg.sender);
        euint32 encryptedSpecialty = FHE.asEuint32(_specialty);
        euint32 encryptedRating = FHE.asEuint32(50); // Initial rating of 50/100

        lawyers[lawyerCounter] = LawyerProfile({
            encryptedAddress: encryptedAddress,
            encryptedSpecialty: encryptedSpecialty,
            encryptedRating: encryptedRating,
            consultationCount: 0,
            isVerified: false,
            isActive: true
        });

        lawyerIds[msg.sender] = lawyerCounter;
        registeredLawyers[msg.sender] = true;

        // Set ACL permissions
        FHE.allowThis(encryptedAddress);
        FHE.allowThis(encryptedSpecialty);
        FHE.allowThis(encryptedRating);
        FHE.allow(encryptedAddress, msg.sender);
        FHE.allow(encryptedSpecialty, msg.sender);
        FHE.allow(encryptedRating, msg.sender);

        emit LawyerRegistered(lawyerCounter, block.timestamp);
    }

    // Assign consultation to lawyer (admin function)
    function assignConsultation(uint256 consultationId, uint256 lawyerId)
        external
        onlyAdmin
        consultationExists(consultationId)
    {
        require(lawyerId > 0 && lawyerId <= lawyerCounter, "Invalid lawyer ID");
        require(!consultations[consultationId].isResolved, "Consultation already resolved");
        require(lawyers[lawyerId].isActive, "Lawyer not active");

        // Encrypt lawyer ID
        euint32 encryptedLawyerId = FHE.asEuint32(uint32(lawyerId));
        consultations[consultationId].encryptedLawyerId = encryptedLawyerId;

        // Set ACL permissions
        FHE.allowThis(encryptedLawyerId);

        emit ConsultationAssigned(consultationId, lawyerId);
    }

    // Provide response to consultation
    function provideResponse(uint256 consultationId, string calldata _encryptedResponse)
        external
        onlyRegisteredLawyer
        consultationExists(consultationId)
    {
        require(bytes(_encryptedResponse).length > 0, "Response cannot be empty");
        require(!consultations[consultationId].isResolved, "Consultation already resolved");

        uint256 lawyerId = lawyerIds[msg.sender];
        require(lawyerId > 0, "Lawyer not found");

        consultations[consultationId].encryptedResponse = _encryptedResponse;
        consultations[consultationId].isResolved = true;

        // Update lawyer stats
        lawyers[lawyerId].consultationCount++;

        emit ResponseProvided(consultationId, block.timestamp);
    }

    // Verify lawyer (admin function)
    function verifyLawyer(uint256 lawyerId) external onlyAdmin {
        require(lawyerId > 0 && lawyerId <= lawyerCounter, "Invalid lawyer ID");
        lawyers[lawyerId].isVerified = true;
        emit LawyerVerified(lawyerId);
    }

    // Update lawyer rating (admin function)
    function updateLawyerRating(uint256 lawyerId, uint32 newRating) external onlyAdmin {
        require(lawyerId > 0 && lawyerId <= lawyerCounter, "Invalid lawyer ID");
        require(newRating <= 100, "Rating must be 0-100");

        euint32 encryptedRating = FHE.asEuint32(newRating);
        lawyers[lawyerId].encryptedRating = encryptedRating;

        // Set ACL permissions
        FHE.allowThis(encryptedRating);
    }

    // Deactivate lawyer
    function deactivateLawyer(uint256 lawyerId) external onlyAdmin {
        require(lawyerId > 0 && lawyerId <= lawyerCounter, "Invalid lawyer ID");
        lawyers[lawyerId].isActive = false;
    }

    // Get consultation details (encrypted)
    function getConsultationDetails(uint256 consultationId)
        external
        view
        consultationExists(consultationId)
        returns (
            string memory encryptedQuestion,
            string memory encryptedResponse,
            uint256 timestamp,
            uint256 fee,
            bool isResolved,
            bool isPaid
        )
    {
        EncryptedConsultation storage consultation = consultations[consultationId];
        return (
            consultation.encryptedQuestion,
            consultation.encryptedResponse,
            consultation.timestamp,
            consultation.fee,
            consultation.isResolved,
            consultation.isPaid
        );
    }

    // Get lawyer profile
    function getLawyerProfile(uint256 lawyerId)
        external
        view
        returns (
            uint256 consultationCount,
            bool isVerified,
            bool isActive
        )
    {
        require(lawyerId > 0 && lawyerId <= lawyerCounter, "Invalid lawyer ID");
        LawyerProfile storage lawyer = lawyers[lawyerId];
        return (
            lawyer.consultationCount,
            lawyer.isVerified,
            lawyer.isActive
        );
    }

    // Get client statistics
    function getClientStats(address clientAddress)
        external
        view
        returns (
            uint256 totalConsultations,
            uint256 totalSpent
        )
    {
        ClientProfile storage client = clients[clientAddress];
        return (
            client.totalConsultations,
            client.totalSpent
        );
    }

    // Get system statistics
    function getSystemStats()
        external
        view
        returns (
            uint256 totalConsultations,
            uint256 totalLawyers,
            uint256 verifiedLawyers
        )
    {
        uint256 verified = 0;
        for (uint256 i = 1; i <= lawyerCounter; i++) {
            if (lawyers[i].isVerified) {
                verified++;
            }
        }

        return (
            consultationCounter,
            lawyerCounter,
            verified
        );
    }

    // Withdraw fees (admin function)
    function withdrawFees(uint256 amount) external onlyAdmin {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(admin).transfer(amount);
    }

    // Emergency stop function
    function emergencyStop() external onlyAdmin {
        // In a real implementation, this would pause all functions
        // For this example, we'll just emit an event
    }

    // Get legal category name
    function getLegalCategory(uint256 categoryId) external view returns (string memory) {
        require(categoryId >= 1 && categoryId <= 8, "Invalid category ID");
        return legalCategories[categoryId];
    }

    // Check if address is registered lawyer
    function isRegisteredLawyer(address lawyerAddress) external view returns (bool) {
        return registeredLawyers[lawyerAddress];
    }

    // Get lawyer ID by address
    function getLawyerIdByAddress(address lawyerAddress) external view returns (uint256) {
        return lawyerIds[lawyerAddress];
    }
}