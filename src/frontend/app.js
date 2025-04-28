// Function to format JSON responses
function formatResponse(data) {
    return JSON.stringify(data, null, 2);
}

// Function to display error messages
function displayError(elementId, error) {
    const errorMessage = {
        error: error.message,
        status: error.response?.status,
        details: error.response?.data
    };
    document.getElementById(elementId).innerHTML = formatResponse(errorMessage);
    document.getElementById(elementId).style.color = 'red';
}

// Function to display success responses
function displayResponse(elementId, data) {
    document.getElementById(elementId).innerHTML = formatResponse(data);
    document.getElementById(elementId).style.color = 'black';
}

// Get Token Info
async function getTokenInfo() {
    const mintAddress = document.getElementById('mintAddress').value;
    if (!mintAddress) {
        alert('Please enter a mint address');
        return;
    }

    try {
        const response = await fetch(`/api/token/${mintAddress}`);
        const data = await response.json();
        displayResponse('tokenInfoResponse', data);
        console.log('Token Info Response:', data);
    } catch (error) {
        displayError('tokenInfoResponse', error);
        console.error('Error fetching token info:', error);
    }
}

// Get Whale Transactions
async function getWhaleTransactions() {
    const mintAddress = document.getElementById('whaleMintAddress').value;
    const minUsdAmount = document.getElementById('minUsdAmount').value;

    if (!mintAddress) {
        alert('Please enter a mint address');
        return;
    }

    try {
        const params = new URLSearchParams({
            mintAddress,
            ...(minUsdAmount && { minUsdAmount }),
            limit: 10,
            sortByDesc: 'amount'
        });

        const response = await fetch(`/api/token/transfers?${params}`);
        const data = await response.json();
        displayResponse('whaleTransactionsResponse', data);
        console.log('Whale Transactions Response:', data);
    } catch (error) {
        displayError('whaleTransactionsResponse', error);
        console.error('Error fetching whale transactions:', error);
    }
}

// Get Wallet Token Balance
async function getWalletTokenBalance() {
    const ownerAddress = document.getElementById('ownerAddress').value;
    if (!ownerAddress) {
        alert('Please enter an owner address');
        return;
    }

    try {
        const params = new URLSearchParams({
            includeNoPriceBalance: true,
            limit: 100
        });

        const response = await fetch(`/api/account/token-balance/${ownerAddress}?${params}`);
        const data = await response.json();
        displayResponse('walletBalanceResponse', data);
        console.log('Wallet Balance Response:', data);
    } catch (error) {
        displayError('walletBalanceResponse', error);
        console.error('Error fetching wallet balance:', error);
    }
}

// Get Token Top Holders
async function getTokenTopHolders() {
    const mintAddress = document.getElementById('topHoldersMintAddress').value;
    if (!mintAddress) {
        alert('Please enter a mint address');
        return;
    }

    try {
        const params = new URLSearchParams({
            limit: 10
        });

        const response = await fetch(`/api/token/${mintAddress}/top-holders?${params}`);
        const data = await response.json();
        displayResponse('topHoldersResponse', data);
        console.log('Top Holders Response:', data);
    } catch (error) {
        displayError('topHoldersResponse', error);
        console.error('Error fetching top holders:', error);
    }
}

// Get Token Transfer Volume
async function getTokenTransferVolume() {
    const mintId = document.getElementById('transferVolumeMintId').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!mintId || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const params = new URLSearchParams({
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            interval: '1d'
        });

        const response = await fetch(`/api/token/${mintId}/transfer-volume?${params}`);
        const data = await response.json();
        displayResponse('transferVolumeResponse', data);
        console.log('Transfer Volume Response:', data);
    } catch (error) {
        displayError('transferVolumeResponse', error);
        console.error('Error fetching transfer volume:', error);
    }
}