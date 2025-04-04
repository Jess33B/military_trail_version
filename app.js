const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = [
    {
        "inputs": [{ "internalType": "string", "name": "name", "type": "string" }],
        "name": "createAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "pubkey", "type": "address" }],
        "name": "checkUserExists",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "pubkey", "type": "address" }],
        "name": "getUsername",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "friend_key", "type": "address" },
            { "internalType": "string", "name": "name", "type": "string" }
        ],
        "name": "addFriend",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "friend_key", "type": "address" }],
        "name": "readMessage",
        "outputs": [{
            "components": [
                { "internalType": "address", "name": "sender", "type": "address" },
                { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                { "internalType": "string", "name": "msg", "type": "string" }
            ],
            "internalType": "struct Database.message[]",
            "name": "",
            "type": "tuple[]"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "friend_key", "type": "address" },
            { "internalType": "string", "name": "_msg", "type": "string" }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let web3;
let contract;
let accounts;

window.onload = async () => {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            accounts = await web3.eth.getAccounts();
            contract = new web3.eth.Contract(contractABI, contractAddress);

            console.log("Connected to account:", accounts[0]);

            // Detect account changes in MetaMask
            window.ethereum.on("accountsChanged", async (newAccounts) => {
                accounts = newAccounts;
                console.log("Switched to account:", accounts[0]);
                alert("Account switched to: " + accounts[0]);
            });

        } catch (error) {
            console.error("Error initializing Web3:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        alert("Please install MetaMask!");
    }
};


// Create Account
async function createAccount() {
    const username = prompt("Enter your username:");
    if (!username) {
        alert("Username cannot be empty!");
        return;
    }

    try {
        await contract.methods.createAccount(username).send({ from: accounts[0] });
        alert("Account created successfully!");

        // Display the registered address on the page
        document.getElementById("accountAddress").innerText = "Your Address: " + accounts[0];

    } catch (error) {
        console.error("Error creating account:", error);
        alert("Failed to create account.");
    }
}


// Get Username
async function getUsername() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    try {
        const username = await contract.methods.getUsername(accounts[0]).call();
        alert("Your username: " + username);
    } catch (error) {
        console.error("Error fetching username:", error);
        alert("Failed to fetch username. Check console for details.");
    }
}

// Add Friend
async function addFriend() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("friendAddress").value;
    const friendName = document.getElementById("friendName").value;

    if (!friendAddress || !friendName) {
        alert("Please enter both fields.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to add is not registered.");
            return;
        }

        await contract.methods.addFriend(friendAddress, friendName).send({ from: accounts[0] });
        alert("Friend added successfully!");
    } catch (error) {
        console.error("Error adding friend:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Send Message
async function sendMessage() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("chatFriendAddress").value;
    const message = document.getElementById("messageInput").value;

    if (!friendAddress || !message) {
        alert("Please enter both fields.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to message is not registered.");
            return;
        }

        await contract.methods.sendMessage(friendAddress, message).send({ from: accounts[0] });
        document.getElementById("messageInput").value = "";
        alert("Message sent successfully!");
        readMessages();
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Read Messages
async function readMessages() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("chatFriendAddress").value;
    if (!friendAddress) {
        alert("Enter friend's address to load messages.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to message is not registered.");
            return;
        }

        const messages = await contract.methods.readMessage(friendAddress).call();
        let messageBox = document.getElementById("messageBox");
        messageBox.innerHTML = ""; // Clear previous messages

        messages.forEach(msg => {
            const messageElement = document.createElement("div");
            messageElement.className = msg.sender.toLowerCase() === accounts[0].toLowerCase() ? "message sender" : "message receiver";
            messageElement.textContent = `${msg.sender.substring(0, 6)}: ${msg.msg}`;
            messageBox.appendChild(messageElement);
        });
    } catch (error) {
        console.error("Error reading messages:", error);
        alert("Could not load messages. Check console for details.");
    }
}


//jesna  : 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
//harsh  : 0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097
