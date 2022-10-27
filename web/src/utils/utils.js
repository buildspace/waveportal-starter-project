import { ethers } from 'ethers';
import { abi as contractABI } from './WavePortal.json';

export const contractAddress = '0xb15177B993b5fd539e035A5d386F41B32341Bd22';

export const getEthereumObject = () => window.ethereum;

export const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        /*
         * First make sure we have access to the Ethereum object.
         */
        if (!ethereum) {
            console.error('Make sure you have Metamask!');
            return null;
        }

        console.log('We have the Ethereum object', ethereum);
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (!!accounts.length) {
            const account = accounts[0];
            console.log('Found an authorized account:', account);
            return account;
        } else {
            console.error('No authorized account found');
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getWavePortalContract = () => {
    const provider = new ethers.providers.Web3Provider(getEthereumObject());
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );

    return wavePortalContract;
};
