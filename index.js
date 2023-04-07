// Import the ethers.js library and constants for the contract
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constant.js"

// Get references to the connect, withdraw, fund, and balance buttons
const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")

// Set up click event listeners for each button
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

// Function to connect to MetaMask
async function connect() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== "undefined") {
        try {
            // Request user to connect their MetaMask account
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        // Update the text of the connect button to indicate that the user is connected
        connectButton.innerHTML = "Connected"
        // Get the user's MetaMask account address
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        alert("Please install MetaMask");
    }
}

// Function to withdraw funds from the contract
async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        // Set up the ethers.js provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        // Create an ethers.js Contract instance for the contract we want to interact with
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            // Call the withdraw() function on the contract and wait for the transaction to be mined
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please install MetaMask");
    }
}

// Function to fund the contract with Ether
async function fund() {
    // Get the amount of Ether to fund from the input field on the HTML page
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // Set up the ethers.js provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        // Create an ethers.js Contract instance for the contract we want to interact with
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            // Call the fund() function on the contract and wait for the transaction to be mined
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please install MetaMask");
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            // Listen for the transaction hash to be included in a block.
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}


async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        // Create a Web3Provider object using the current window's ethereum object.
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            // Get the balance of the contract using the Web3Provider object.
            const balance = await provider.getBalance(contractAddress)
            // Convert the balance from wei to Ether using ethers.utils.formatEther().
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please install MetaMask");
    }
}