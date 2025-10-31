// Anonymous Legal Consultation Platform - JavaScript Application
class LegalConsultationApp {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAccount = null;
        this.contractAddress = '0x0000000000000000000000000000000000000000'; // Placeholder - needs actual deployed contract address

        // Contract ABI - Essential functions only
        this.contractABI = [
            "function submitConsultation(uint32 _clientId, uint32 _categoryId, string calldata _encryptedQuestion) external payable",
            "function registerLawyer(uint32 _specialty) external",
            "function provideResponse(uint256 consultationId, string calldata _encryptedResponse) external",
            "function assignConsultation(uint256 consultationId, uint256 lawyerId) external",
            "function verifyLawyer(uint256 lawyerId) external",
            "function updateLawyerRating(uint256 lawyerId, uint32 newRating) external",
            "function withdrawFees(uint256 amount) external",
            "function getConsultationDetails(uint256 consultationId) external view returns (string memory, string memory, uint256, uint256, bool, bool)",
            "function getLawyerProfile(uint256 lawyerId) external view returns (uint256, bool, bool)",
            "function getClientStats(address clientAddress) external view returns (uint256, uint256)",
            "function getSystemStats() external view returns (uint256, uint256, uint256)",
            "function getLegalCategory(uint256 categoryId) external view returns (string memory)",
            "function isRegisteredLawyer(address lawyerAddress) external view returns (bool)",
            "function getLawyerIdByAddress(address lawyerAddress) external view returns (uint256)",
            "function admin() external view returns (address)",
            "function consultationCounter() external view returns (uint256)",
            "function lawyerCounter() external view returns (uint256)",
            "event ConsultationSubmitted(uint256 indexed consultationId, uint256 timestamp)",
            "event LawyerRegistered(uint256 indexed lawyerId, uint256 timestamp)",
            "event ConsultationAssigned(uint256 indexed consultationId, uint256 indexed lawyerId)",
            "event ResponseProvided(uint256 indexed consultationId, uint256 timestamp)",
            "event PaymentProcessed(uint256 indexed consultationId, uint256 amount)",
            "event LawyerVerified(uint256 indexed lawyerId)"
        ];

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupNavigation();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());

        // Contract configuration
        document.getElementById('setContractAddress').addEventListener('click', () => this.setContractAddress());

        // Form submissions
        document.getElementById('consultationForm').addEventListener('submit', (e) => this.submitConsultation(e));
        document.getElementById('lawyerForm').addEventListener('submit', (e) => this.registerLawyer(e));

        // Consultation viewing
        document.getElementById('loadConsultation').addEventListener('click', () => this.loadConsultation());
        document.getElementById('submitResponse').addEventListener('click', () => this.submitResponse());

        // Admin functions
        document.getElementById('assignConsultation').addEventListener('click', () => this.assignConsultation());
        document.getElementById('verifyLawyer').addEventListener('click', () => this.verifyLawyer());
        document.getElementById('updateRating').addEventListener('click', () => this.updateRating());
        document.getElementById('withdrawFees').addEventListener('click', () => this.withdrawFees());

        // Statistics
        document.getElementById('loadStats').addEventListener('click', () => this.loadStatistics());
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');

                // Update button states
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update section visibility
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');

                // Load data for specific sections
                if (targetSection === 'stats') {
                    this.loadStatistics();
                } else if (targetSection === 'lawyer') {
                    this.checkLawyerStatus();
                }
            });
        });
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.log('Wallet not connected');
            }
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showStatus('Please install MetaMask wallet', 'error');
                return;
            }

            this.showStatus('Connecting to wallet...', 'info');

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                this.showStatus('No accounts found', 'error');
                return;
            }

            this.userAccount = accounts[0];

            // Initialize ethers provider and contract
            this.web3 = new ethers.providers.Web3Provider(window.ethereum);

            // Check if contract address is configured
            if (this.contractAddress === '0x0000000000000000000000000000000000000000') {
                this.showStatus('Contract address not configured. Please set the contract address first.', 'warning');
                document.getElementById('contractConfig').style.display = 'block';
                this.contract = null;
            } else {
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.web3.getSigner());
                document.getElementById('contractConfig').style.display = 'none';
            }

            // Update UI
            document.getElementById('connectWallet').textContent = 'Connected';
            document.getElementById('connectWallet').disabled = true;
            document.getElementById('walletInfo').innerHTML = `
                <strong>Connected:</strong> ${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}
            `;

            this.showStatus('Wallet connected successfully!', 'success');

            // Check network
            await this.checkNetwork();

            // Load initial data only if contract is available
            if (this.contract) {
                await this.loadStatistics();
                await this.checkLawyerStatus();
            }

        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showStatus('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    async checkNetwork() {
        try {
            const network = await this.web3.getNetwork();
            const expectedChainId = 9000; // Zama Devnet chain ID

            if (network.chainId !== expectedChainId) {
                this.showStatus('Please switch to Zama Devnet (Chain ID: 9000)', 'warning');
            }
        } catch (error) {
            console.error('Network check error:', error);
        }
    }

    async submitConsultation(event) {
        event.preventDefault();

        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const clientId = parseInt(document.getElementById('clientId').value);
            const categoryId = parseInt(document.getElementById('category').value);
            const question = document.getElementById('question').value;
            const fee = parseFloat(document.getElementById('fee').value);

            if (!clientId || !categoryId || !question || fee < 0.001) {
                this.showStatus('Please fill all fields correctly', 'error');
                return;
            }

            this.showStatus('Submitting consultation...', 'info');

            const feeWei = ethers.utils.parseEther(fee.toString());

            const tx = await this.contract.submitConsultation(
                clientId,
                categoryId,
                question,
                { value: feeWei }
            );

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Consultation submitted successfully!', 'success');

            // Reset form
            document.getElementById('consultationForm').reset();

            // Refresh statistics
            await this.loadStatistics();

        } catch (error) {
            console.error('Consultation submission error:', error);
            this.showStatus('Failed to submit consultation: ' + error.message, 'error');
        }
    }

    async registerLawyer(event) {
        event.preventDefault();

        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const specialty = parseInt(document.getElementById('specialty').value);

            if (!specialty) {
                this.showStatus('Please select a specialty', 'error');
                return;
            }

            this.showStatus('Registering as lawyer...', 'info');

            const tx = await this.contract.registerLawyer(specialty);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Lawyer registration successful!', 'success');

            // Update lawyer status
            await this.checkLawyerStatus();

            // Reset form
            document.getElementById('lawyerForm').reset();

        } catch (error) {
            console.error('Lawyer registration error:', error);
            this.showStatus('Failed to register lawyer: ' + error.message, 'error');
        }
    }

    async loadConsultation() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const consultationId = parseInt(document.getElementById('consultationId').value);

            if (!consultationId) {
                this.showStatus('Please enter a consultation ID', 'error');
                return;
            }

            this.showStatus('Loading consultation...', 'info');

            const details = await this.contract.getConsultationDetails(consultationId);

            const detailsDiv = document.getElementById('consultationDetails');
            detailsDiv.innerHTML = `
                <h3>Consultation #${consultationId}</h3>
                <div><strong>Question:</strong> ${details[0]}</div>
                <div><strong>Response:</strong> ${details[1] || 'No response yet'}</div>
                <div><strong>Timestamp:</strong> ${new Date(details[2] * 1000).toLocaleString()}</div>
                <div><strong>Fee:</strong> ${ethers.utils.formatEther(details[3])} ETH</div>
                <div><strong>Status:</strong> ${details[4] ? 'Resolved' : 'Pending'}</div>
                <div><strong>Paid:</strong> ${details[5] ? 'Yes' : 'No'}</div>
            `;

            this.showStatus('Consultation loaded successfully', 'success');

        } catch (error) {
            console.error('Load consultation error:', error);
            this.showStatus('Failed to load consultation: ' + error.message, 'error');
        }
    }

    async submitResponse() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const consultationId = parseInt(document.getElementById('consultationId').value);
            const response = document.getElementById('responseText').value;

            if (!consultationId || !response) {
                this.showStatus('Please enter consultation ID and response', 'error');
                return;
            }

            this.showStatus('Submitting response...', 'info');

            const tx = await this.contract.provideResponse(consultationId, response);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Response submitted successfully!', 'success');

            // Clear response text
            document.getElementById('responseText').value = '';

            // Reload consultation
            await this.loadConsultation();

        } catch (error) {
            console.error('Submit response error:', error);
            this.showStatus('Failed to submit response: ' + error.message, 'error');
        }
    }

    async checkLawyerStatus() {
        if (!this.contract || !this.userAccount) return;

        try {
            const isLawyer = await this.contract.isRegisteredLawyer(this.userAccount);
            const statusDiv = document.getElementById('lawyerStatus');

            if (isLawyer) {
                const lawyerId = await this.contract.getLawyerIdByAddress(this.userAccount);
                const profile = await this.contract.getLawyerProfile(lawyerId);

                statusDiv.innerHTML = `
                    <h3>Lawyer Status</h3>
                    <div><strong>Lawyer ID:</strong> ${lawyerId}</div>
                    <div><strong>Consultations Handled:</strong> ${profile[0]}</div>
                    <div><strong>Verified:</strong> ${profile[1] ? 'Yes' : 'No'}</div>
                    <div><strong>Active:</strong> ${profile[2] ? 'Yes' : 'No'}</div>
                `;
            } else {
                statusDiv.innerHTML = '<div>You are not registered as a lawyer yet.</div>';
            }
        } catch (error) {
            console.error('Check lawyer status error:', error);
        }
    }

    // Admin Functions
    async assignConsultation() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const consultationId = parseInt(document.getElementById('assignConsultationId').value);
            const lawyerId = parseInt(document.getElementById('assignLawyerId').value);

            if (!consultationId || !lawyerId) {
                this.showStatus('Please enter both consultation ID and lawyer ID', 'error');
                return;
            }

            this.showStatus('Assigning consultation...', 'info');

            const tx = await this.contract.assignConsultation(consultationId, lawyerId);
            await tx.wait();

            this.showStatus('Consultation assigned successfully!', 'success');

        } catch (error) {
            console.error('Assign consultation error:', error);
            this.showStatus('Failed to assign consultation: ' + error.message, 'error');
        }
    }

    async verifyLawyer() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const lawyerId = parseInt(document.getElementById('verifyLawyerId').value);

            if (!lawyerId) {
                this.showStatus('Please enter lawyer ID', 'error');
                return;
            }

            this.showStatus('Verifying lawyer...', 'info');

            const tx = await this.contract.verifyLawyer(lawyerId);
            await tx.wait();

            this.showStatus('Lawyer verified successfully!', 'success');

        } catch (error) {
            console.error('Verify lawyer error:', error);
            this.showStatus('Failed to verify lawyer: ' + error.message, 'error');
        }
    }

    async updateRating() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const lawyerId = parseInt(document.getElementById('ratingLawyerId').value);
            const newRating = parseInt(document.getElementById('newRating').value);

            if (!lawyerId || newRating < 0 || newRating > 100) {
                this.showStatus('Please enter valid lawyer ID and rating (0-100)', 'error');
                return;
            }

            this.showStatus('Updating rating...', 'info');

            const tx = await this.contract.updateLawyerRating(lawyerId, newRating);
            await tx.wait();

            this.showStatus('Rating updated successfully!', 'success');

        } catch (error) {
            console.error('Update rating error:', error);
            this.showStatus('Failed to update rating: ' + error.message, 'error');
        }
    }

    async withdrawFees() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const amount = parseFloat(document.getElementById('withdrawAmount').value);

            if (!amount || amount <= 0) {
                this.showStatus('Please enter valid amount', 'error');
                return;
            }

            this.showStatus('Withdrawing fees...', 'info');

            const amountWei = ethers.utils.parseEther(amount.toString());
            const tx = await this.contract.withdrawFees(amountWei);
            await tx.wait();

            this.showStatus('Fees withdrawn successfully!', 'success');

        } catch (error) {
            console.error('Withdraw fees error:', error);
            this.showStatus('Failed to withdraw fees: ' + error.message, 'error');
        }
    }

    async loadStatistics() {
        if (!this.contract) return;

        try {
            // Load system statistics
            const systemStats = await this.contract.getSystemStats();
            document.getElementById('totalConsultations').textContent = systemStats[0].toString();
            document.getElementById('totalLawyers').textContent = systemStats[1].toString();
            document.getElementById('verifiedLawyers').textContent = systemStats[2].toString();

            // Load client statistics if wallet is connected
            if (this.userAccount) {
                const clientStats = await this.contract.getClientStats(this.userAccount);
                document.getElementById('clientStats').innerHTML = `
                    <div><strong>Your Consultations:</strong> ${clientStats[0]}</div>
                    <div><strong>Total Spent:</strong> ${ethers.utils.formatEther(clientStats[1])} ETH</div>
                `;
            }

        } catch (error) {
            console.error('Load statistics error:', error);
            this.showStatus('Failed to load statistics: ' + error.message, 'error');
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type}`;
        messageDiv.textContent = message;

        statusDiv.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);

        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    async setContractAddress() {
        const addressInput = document.getElementById('contractAddressInput');
        const newAddress = addressInput.value.trim();

        if (!newAddress) {
            this.showStatus('Please enter a contract address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(newAddress)) {
            this.showStatus('Invalid contract address format', 'error');
            return;
        }

        try {
            this.contractAddress = newAddress;

            if (this.web3) {
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.web3.getSigner());
                document.getElementById('contractConfig').style.display = 'none';

                this.showStatus('Contract address set successfully! You can now use the application.', 'success');

                // Load initial data
                await this.loadStatistics();
                await this.checkLawyerStatus();
            } else {
                this.showStatus('Contract address saved. Please connect your wallet to continue.', 'success');
            }

        } catch (error) {
            console.error('Set contract address error:', error);
            this.showStatus('Failed to set contract address: ' + error.message, 'error');
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LegalConsultationApp();
});

// Handle account/network changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            location.reload();
        }
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}