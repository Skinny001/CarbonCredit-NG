import { ethers } from 'ethers';
import CarbonProjectsABI from './abis/CarbonProjects.json';
import CarbonMarketABI from './abis/CarbonMarket.json';
import MockUSDTABI from './abis/MockUSDT.json';

export const PROJECTS_ADDRESS = process.env.NEXT_PUBLIC_PROJECTS_ADDRESS!;
export const MARKET_ADDRESS = process.env.NEXT_PUBLIC_MARKET_ADDRESS!;
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS!;
export const CHAIN_ID = '0x3C8'; // 968 for BOT Chain Testnet
export const RPC_URL = 'https://rpc.bohr.life';

export const getProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
};

export const getProjectsContract = () => {
    return new ethers.Contract(PROJECTS_ADDRESS, CarbonProjectsABI, getProvider());
};

export const getMarketContract = () => {
    return new ethers.Contract(MARKET_ADDRESS, CarbonMarketABI, getProvider());
};

export const getUSDTContract = () => {
    return new ethers.Contract(USDT_ADDRESS, MockUSDTABI, getProvider());
};

export const setupNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (currentChainId === CHAIN_ID) return;

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CHAIN_ID }],
            });
        } catch (switchError: any) {
            // Error code 4902 indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: CHAIN_ID,
                                chainName: 'BOT Chain Testnet',
                                rpcUrls: [RPC_URL],
                                nativeCurrency: {
                                    name: 'Test BOT',
                                    symbol: 'tBOT',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://scan.botchain.ai'], // updated to requested explorer
                            },
                        ],
                    });
                } catch (addError) {
                    console.error("Failed to add network:", addError);
                }
            } else if (switchError.code === -32002) {
                console.warn("A request to switch the network is already pending. Please check your wallet.");
                // We purposefully don't throw here so Next.js doesn't show a full screen error overlay
            } else {
                console.warn("User rejected network switch or another error occurred.");
                // We purposefully don't throw here so Next.js doesn't show a full screen error overlay
            }
        }
    }
}

export const getSigner = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        await setupNetwork();
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        return provider.getSigner();
    }
    throw new Error('No crypto wallet found. Please install it.');
};

export const getProjectsWithSigner = async () => {
    const signer = await getSigner();
    return new ethers.Contract(PROJECTS_ADDRESS, CarbonProjectsABI, signer);
};

export const getMarketWithSigner = async () => {
    const signer = await getSigner();
    return new ethers.Contract(MARKET_ADDRESS, CarbonMarketABI, signer);
};

export const getUSDTWithSigner = async () => {
    const signer = await getSigner();
    return new ethers.Contract(USDT_ADDRESS, MockUSDTABI, signer);
};
