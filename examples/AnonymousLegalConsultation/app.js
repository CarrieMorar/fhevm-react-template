// Anonymous Legal Consultation Platform - JavaScript Application
class LegalConsultationApp {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAccount = null;
        this.contractAddress = '0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7';

        // Contract ABI - Correct AnonymousLegalConsultation ABI
        this.contractABI = [
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

        this.legalCategories = [
            { id: 1, name: "Civil Law" },
            { id: 2, name: "Criminal Law" },
            { id: 3, name: "Family Law" },
            { id: 4, name: "Corporate Law" },
            { id: 5, name: "Employment Law" },
            { id: 6, name: "Real Estate Law" },
            { id: 7, name: "Immigration Law" },
            { id: 8, name: "Tax Law" }
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

        // Client actions
        document.getElementById('consultationForm').addEventListener('submit', (e) => this.submitConsultation(e));
        document.getElementById('loadConsultation').addEventListener('click', () => this.loadConsultation());

        // Lawyer actions
        document.getElementById('lawyerRegisterBtn').addEventListener('click', () => this.registerLawyer());
        document.getElementById('submitResponseBtn').addEventListener('click', () => this.provideResponse());

        // Admin actions
        document.getElementById('assignConsultationBtn').addEventListener('click', () => this.assignConsultation());
        document.getElementById('verifyLawyerBtn').addEventListener('click', () => this.verifyLawyer());
        document.getElementById('deactivateLawyerBtn').addEventListener('click', () => this.deactivateLawyer());
        document.getElementById('updateRatingBtn').addEventListener('click', () => this.updateLawyerRating());
        document.getElementById('withdrawFeesBtn').addEventListener('click', () => this.withdrawFees());

        // View actions
        document.getElementById('loadStatsBtn').addEventListener('click', () => this.loadStatistics());
        document.getElementById('loadLawyerProfileBtn').addEventListener('click', () => this.loadLawyerProfile());
        document.getElementById('loadClientStatsBtn').addEventListener('click', () => this.loadClientStats());
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');

                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');

                if (targetSection === 'admin') {
                    this.checkAdminStatus();
                } else if (targetSection === 'lawyer') {
                    this.checkLawyerStatus();
                } else if (targetSection === 'stats') {
                    this.loadStatistics();
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

            this.web3 = new ethers.providers.Web3Provider(window.ethereum);
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.web3.getSigner());

            document.getElementById('connectWallet').textContent = 'Connected';
            document.getElementById('connectWallet').disabled = true;
            document.getElementById('walletInfo').innerHTML = `
                <strong>Connected:</strong> ${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}
            `;

            this.showStatus('Wallet connected successfully!', 'success');

            await this.checkNetwork();
            await this.checkAdminStatus();
            await this.checkLawyerStatus();

        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showStatus('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    async checkNetwork() {
        try {
            const network = await this.web3.getNetwork();
            const expectedChainId = 9000;

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
            const categoryId = parseInt(document.getElementById('categoryId').value);
            const question = document.getElementById('question').value;
            const feeEth = document.getElementById('consultationFee').value;

            if (!clientId || !categoryId || !question || !feeEth) {
                this.showStatus('Please fill all fields', 'error');
                return;
            }

            if (categoryId < 1 || categoryId > 8) {
                this.showStatus('Please select a valid legal category (1-8)', 'error');
                return;
            }

            if (parseFloat(feeEth) < 0.001) {
                this.showStatus('Minimum fee is 0.001 ETH', 'error');
                return;
            }

            this.showStatus('Submitting consultation...', 'info');

            const tx = await this.contract.submitConsultation(clientId, categoryId, question, {
                value: ethers.utils.parseEther(feeEth)
            });

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            const receipt = await tx.wait();

            this.showStatus('Consultation submitted successfully!', 'success');

            document.getElementById('consultationForm').reset();
            await this.loadStatistics();

        } catch (error) {
            console.error('Submit consultation error:', error);
            this.showStatus('Failed to submit consultation: ' + error.message, 'error');
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
                <div class="detail-row"><strong>Encrypted Question:</strong> ${details[0].substring(0, 100)}...</div>
                <div class="detail-row"><strong>Encrypted Response:</strong> ${details[1] ? details[1].substring(0, 100) + '...' : 'No response yet'}</div>
                <div class="detail-row"><strong>Timestamp:</strong> ${new Date(details[2] * 1000).toLocaleString()}</div>
                <div class="detail-row"><strong>Fee:</strong> ${ethers.utils.formatEther(details[3])} ETH</div>
                <div class="detail-row"><strong>Resolved:</strong> ${details[4] ? 'Yes' : 'No'}</div>
                <div class="detail-row"><strong>Paid:</strong> ${details[5] ? 'Yes' : 'No'}</div>
            `;

            this.showStatus('Consultation loaded successfully', 'success');

        } catch (error) {
            console.error('Load consultation error:', error);
            this.showStatus('Failed to load consultation: ' + error.message, 'error');
        }
    }

    async registerLawyer() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const specialty = parseInt(document.getElementById('lawyerSpecialty').value);

            if (!specialty || specialty < 1 || specialty > 8) {
                this.showStatus('Please select a valid specialty (1-8)', 'error');
                return;
            }

            this.showStatus('Registering as lawyer...', 'info');

            const tx = await this.contract.registerLawyer(specialty);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Registered as lawyer successfully!', 'success');

            await this.checkLawyerStatus();
            await this.loadStatistics();

        } catch (error) {
            console.error('Register lawyer error:', error);
            this.showStatus('Failed to register: ' + error.message, 'error');
        }
    }

    async provideResponse() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const consultationId = parseInt(document.getElementById('responseConsultationId').value);
            const response = document.getElementById('lawyerResponse').value;

            if (!consultationId || !response) {
                this.showStatus('Please fill all fields', 'error');
                return;
            }

            this.showStatus('Submitting response...', 'info');

            const tx = await this.contract.provideResponse(consultationId, response);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Response submitted successfully!', 'success');

            document.getElementById('responseConsultationId').value = '';
            document.getElementById('lawyerResponse').value = '';

        } catch (error) {
            console.error('Provide response error:', error);
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
                    <div class="status-badge success">✓ Registered Lawyer</div>
                    <div class="detail-row"><strong>Lawyer ID:</strong> ${lawyerId}</div>
                    <div class="detail-row"><strong>Consultations Handled:</strong> ${profile[0]}</div>
                    <div class="detail-row"><strong>Verified:</strong> ${profile[1] ? '✓ Yes' : '✗ No'}</div>
                    <div class="detail-row"><strong>Active:</strong> ${profile[2] ? '✓ Yes' : '✗ No'}</div>
                `;
            } else {
                statusDiv.innerHTML = '<div class="status-badge warning">Not registered as lawyer yet</div>';
            }
        } catch (error) {
            console.error('Check lawyer status error:', error);
        }
    }

    async checkAdminStatus() {
        if (!this.contract || !this.userAccount) return;

        try {
            const adminAddress = await this.contract.admin();
            const statusDiv = document.getElementById('adminStatus');

            if (adminAddress.toLowerCase() === this.userAccount.toLowerCase()) {
                statusDiv.innerHTML = `
                    <div class="status-badge success">✓ You are the Admin</div>
                    <div class="detail-row"><strong>Admin Address:</strong> ${adminAddress}</div>
                    <div class="detail-row">You have full administrative privileges</div>
                `;
            } else {
                statusDiv.innerHTML = `
                    <div class="status-badge warning">⚠ You are NOT the Admin</div>
                    <div class="detail-row"><strong>Your Address:</strong> ${this.userAccount}</div>
                    <div class="detail-row"><strong>Admin Address:</strong> ${adminAddress}</div>
                    <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        You cannot perform administrative functions. Switch to the admin wallet to access these features.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Check admin status error:', error);
        }
    }

    async assignConsultation() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const consultationId = parseInt(document.getElementById('assignConsultationId').value);
            const lawyerId = parseInt(document.getElementById('assignLawyerId').value);

            if (!consultationId || !lawyerId) {
                this.showStatus('Please fill all fields', 'error');
                return;
            }

            this.showStatus('Assigning consultation...', 'info');

            const tx = await this.contract.assignConsultation(consultationId, lawyerId);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Consultation assigned successfully!', 'success');

            document.getElementById('assignConsultationId').value = '';
            document.getElementById('assignLawyerId').value = '';

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

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Lawyer verified successfully!', 'success');

            document.getElementById('verifyLawyerId').value = '';

        } catch (error) {
            console.error('Verify lawyer error:', error);
            this.showStatus('Failed to verify lawyer: ' + error.message, 'error');
        }
    }

    async deactivateLawyer() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const lawyerId = parseInt(document.getElementById('deactivateLawyerId').value);

            if (!lawyerId) {
                this.showStatus('Please enter lawyer ID', 'error');
                return;
            }

            this.showStatus('Deactivating lawyer...', 'info');

            const tx = await this.contract.deactivateLawyer(lawyerId);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Lawyer deactivated successfully!', 'success');

            document.getElementById('deactivateLawyerId').value = '';

        } catch (error) {
            console.error('Deactivate lawyer error:', error);
            this.showStatus('Failed to deactivate lawyer: ' + error.message, 'error');
        }
    }

    async updateLawyerRating() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const lawyerId = parseInt(document.getElementById('ratingLawyerId').value);
            const rating = parseInt(document.getElementById('newRating').value);

            if (!lawyerId || rating === undefined) {
                this.showStatus('Please fill all fields', 'error');
                return;
            }

            if (rating < 0 || rating > 100) {
                this.showStatus('Rating must be between 0 and 100', 'error');
                return;
            }

            this.showStatus('Updating lawyer rating...', 'info');

            const tx = await this.contract.updateLawyerRating(lawyerId, rating);

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Lawyer rating updated successfully!', 'success');

            document.getElementById('ratingLawyerId').value = '';
            document.getElementById('newRating').value = '';

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
            const amountEth = document.getElementById('withdrawAmount').value;

            if (!amountEth || parseFloat(amountEth) <= 0) {
                this.showStatus('Please enter valid amount', 'error');
                return;
            }

            this.showStatus('Withdrawing fees...', 'info');

            const tx = await this.contract.withdrawFees(ethers.utils.parseEther(amountEth));

            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            this.showStatus('Fees withdrawn successfully!', 'success');

            document.getElementById('withdrawAmount').value = '';

        } catch (error) {
            console.error('Withdraw fees error:', error);
            this.showStatus('Failed to withdraw fees: ' + error.message, 'error');
        }
    }

    async loadStatistics() {
        if (!this.contract) return;

        try {
            const stats = await this.contract.getSystemStats();

            document.getElementById('totalConsultations').textContent = stats[0].toString();
            document.getElementById('totalLawyers').textContent = stats[1].toString();
            document.getElementById('verifiedLawyers').textContent = stats[2].toString();

            if (this.userAccount) {
                const clientStats = await this.contract.getClientStats(this.userAccount);
                document.getElementById('clientStats').innerHTML = `
                    <div class="detail-row"><strong>Your Total Consultations:</strong> ${clientStats[0]}</div>
                    <div class="detail-row"><strong>Your Total Spent:</strong> ${ethers.utils.formatEther(clientStats[1])} ETH</div>
                `;
            }

            this.showStatus('Statistics loaded successfully', 'success');

        } catch (error) {
            console.error('Load statistics error:', error);
            this.showStatus('Failed to load statistics: ' + error.message, 'error');
        }
    }

    async loadLawyerProfile() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const lawyerId = parseInt(document.getElementById('viewLawyerId').value);

            if (!lawyerId) {
                this.showStatus('Please enter lawyer ID', 'error');
                return;
            }

            const profile = await this.contract.getLawyerProfile(lawyerId);

            const profileDiv = document.getElementById('lawyerProfileDetails');
            profileDiv.innerHTML = `
                <h3>Lawyer #${lawyerId} Profile</h3>
                <div class="detail-row"><strong>Consultations Handled:</strong> ${profile[0]}</div>
                <div class="detail-row"><strong>Verified:</strong> ${profile[1] ? '✓ Yes' : '✗ No'}</div>
                <div class="detail-row"><strong>Active:</strong> ${profile[2] ? '✓ Yes' : '✗ No'}</div>
            `;

            this.showStatus('Lawyer profile loaded successfully', 'success');

        } catch (error) {
            console.error('Load lawyer profile error:', error);
            this.showStatus('Failed to load lawyer profile: ' + error.message, 'error');
        }
    }

    async loadClientStats() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const clientAddress = document.getElementById('viewClientAddress').value;

            if (!clientAddress || !clientAddress.startsWith('0x') || clientAddress.length !== 42) {
                this.showStatus('Please enter valid address', 'error');
                return;
            }

            const stats = await this.contract.getClientStats(clientAddress);

            const statsDiv = document.getElementById('clientStatsDetails');
            statsDiv.innerHTML = `
                <h3>Client Statistics</h3>
                <div class="detail-row"><strong>Address:</strong> ${clientAddress}</div>
                <div class="detail-row"><strong>Total Consultations:</strong> ${stats[0]}</div>
                <div class="detail-row"><strong>Total Spent:</strong> ${ethers.utils.formatEther(stats[1])} ETH</div>
            `;

            this.showStatus('Client statistics loaded successfully', 'success');

        } catch (error) {
            console.error('Load client stats error:', error);
            this.showStatus('Failed to load client statistics: ' + error.message, 'error');
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type}`;
        messageDiv.textContent = message;

        statusDiv.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);

        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LegalConsultationApp();
});

// Handle account/network changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}