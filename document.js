document.addEventListener('DOMContentLoaded', async () => {
    let apiKey = prompt('Please enter your Etherscan API key:');
    const addresses = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        // Add more addresses if needed
    ];

    function createTransactionRow(transaction) {
        const row = document.createElement('tr');

        const hashCell = document.createElement('td');
        hashCell.innerText = transaction.hash.substring(0, 5) + '...';
        row.appendChild(hashCell);

        const fromCell = document.createElement('td');
        fromCell.innerText = transaction.from.substring(0, 5) + '...';
        row.appendChild(fromCell);

        const toCell = document.createElement('td');
        toCell.innerText = transaction.to.substring(0, 5) + '...';
        row.appendChild(toCell);

        const valueCell = document.createElement('td');
        const value = parseInt(transaction.value, 5) / Math.pow(10, 18);
        valueCell.innerText = value.toFixed(8) + ' ETH';
        row.appendChild(valueCell);

        return row;
    }

    function createCard(address, balance, lastActive, nonZeroTransactions) {
        const card = document.createElement('div');
        card.className = 'card';

        const addressInfo = document.createElement('div');
        addressInfo.className = 'address-info';

        const h2Address = document.createElement('h2');
        h2Address.innerText = 'Address Information';
        addressInfo.appendChild(h2Address);

        const addressDiv = document.createElement('div');
        addressDiv.className = 'info';

        const addressLabel = document.createElement('label');
        addressLabel.innerText = 'Address:';
        addressDiv.appendChild(addressLabel);

        const addressSpan = document.createElement('span');
        addressSpan.innerText = address;
        addressDiv.appendChild(addressSpan);

        addressInfo.appendChild(addressDiv);

        const balanceDiv = document.createElement('div');
        balanceDiv.className = 'info';

        const balanceLabel = document.createElement('label');
        balanceLabel.innerText = 'ETH Balance:';
        balanceDiv.appendChild(balanceLabel);

        const balanceSpan = document.createElement('span');
        balanceSpan.innerText = balance.toFixed(8) + ' ETH';
        balanceDiv.appendChild(balanceSpan);

        addressInfo.appendChild(balanceDiv);

        const lastActiveDiv = document.createElement('div');
        lastActiveDiv.className = 'info';

        const lastActiveLabel = document.createElement('label');
        lastActiveLabel.innerText = 'Last Active:';
        lastActiveDiv.appendChild(lastActiveLabel);

        const lastActiveSpan = document.createElement('span');
        lastActiveSpan.innerText = lastActive;
        lastActiveDiv.appendChild(lastActiveSpan);

        addressInfo.appendChild(lastActiveDiv);
        card.appendChild(addressInfo);

        const transactionInfo = document.createElement('div');
        transactionInfo.className = 'transaction-info';

        const h2Transactions = document.createElement('h2');
        h2Transactions.innerText = 'Recent Transactions';
        transactionInfo.appendChild(h2Transactions);

        const transactionTable = document.createElement('table');
        transactionTable.className = 'transaction-table';

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');

        const thHash = document.createElement('th');
        thHash.innerText = 'Hash';
        tr.appendChild(thHash);

        const thFrom = document.createElement('th');
        thFrom.innerText = 'From';
        tr.appendChild(thFrom);

        const thTo = document.createElement('th');
        thTo.innerText = 'To';
        tr.appendChild(thTo);

        const thValue = document.createElement('th');
        thValue.innerText = 'Value';
        tr.appendChild(thValue);

        thead.appendChild(tr);
        transactionTable.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.className = 'transaction-list';

        nonZeroTransactions.slice(0, 5).forEach(transaction => {
            tbody.appendChild(createTransactionRow(transaction));
        });

        transactionTable.appendChild(tbody);
        transactionInfo.appendChild(transactionTable);

        const loadMoreButton = document.createElement('button');
        loadMoreButton.className = 'load-more';
        loadMoreButton.innerText = 'Load More Transactions';
        loadMoreButton.addEventListener('click', () => {
            nonZeroTransactions.slice(5).forEach(transaction => {
                tbody.appendChild(createTransactionRow(transaction));
            });
            loadMoreButton.style.display = 'none';
        });

        if (nonZeroTransactions.length > 5) {
            transactionInfo.appendChild(loadMoreButton);
        }

        card.appendChild(transactionInfo);

        return card;
    }

    const cardContainer = document.getElementById('card-container');

    for (const address of addresses) {
        const balanceResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`);
        const balanceData = await balanceResponse.json();
        const balance = parseInt(balanceData.result, 10) / Math.pow(10, 18);

        const transactionsResponse = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey}`);
        const transactionsData = await transactionsResponse.json();
        const transactions = transactionsData.result;
        const nonZeroTransactions = transactions.filter(transaction => parseInt(transaction.value, 10) > 0);

        const lastActive = nonZeroTransactions.length > 0 ? new Date(nonZeroTransactions[0].timeStamp * 1000).toLocaleString() : 'N/A';

        const card = createCard(address, balance, lastActive, nonZeroTransactions);
        cardContainer.appendChild(card);
    }
});