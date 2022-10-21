import React, { useEffect, useState } from 'react';
import { findMetaMaskAccount, getEthereumObject, getWavePortalContract } from './utils/utils';

import './App.css';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [totalWaves, setTotalWaves] = useState(0);
    const [wavedAddresses, setWavedAddresses] = useState([]);
    const [isMining, setisMining] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const ethereum = getEthereumObject();

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });

            console.log('Connected', accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    };

    const wave = async () => {
        try {
            if (ethereum) {
                const wavePortalContract = getWavePortalContract();

                const waveTxn = await wavePortalContract.wave();
                setisMining(true);
                console.log('Mining...', waveTxn.hash);

                await waveTxn.wait();
                console.log('Mined -- ', waveTxn.hash);

                const count = await wavePortalContract.getTotalWaves();
                setTotalWaves(count.toNumber());

                const addresses = await wavePortalContract.getAddresses();

                setWavedAddresses(addresses);

                console.log('Retrieved total wave count...', count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setisMining(false);
        }
    };

    const getInitialData = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const wavePortalContract = getWavePortalContract();

                const count = await wavePortalContract.getTotalWaves();
                setTotalWaves(count.toNumber());

                const addresses = await wavePortalContract.getAddresses();
                setWavedAddresses(addresses);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsInitialized(true);
        }
    };

    const find = async () => {
        const account = await findMetaMaskAccount();
        setCurrentAccount(account);
        getInitialData();
    };

    useEffect(() => {
        find();
    }, []);

    return (
        <div className='mainContainer'>
            <div className='dataContainer'>
                <div className='header'>👋 Xin chào!</div>

                <div className='bio'>
                    I am Nikita and I live in Việt Nam so that's pretty cool right? Connect your Ethereum wallet and
                    wave at me!
                </div>

                {!isInitialized && (
                    <div className='bio' data-isloading={true}>
                        Loading data
                    </div>
                )}

                {currentAccount && isInitialized && (
                    <button className='waveButton' onClick={wave} disabled={isMining} data-isloading={isMining}>
                        {isMining ? 'Mining' : 'Wave at Me'}
                    </button>
                )}

                {!currentAccount && (
                    <button
                        className='waveButton'
                        onClick={connectWallet}
                        disabled={isMining}
                        data-isloading={isMining}
                    >
                        Connect Wallet
                    </button>
                )}

                {currentAccount && isInitialized && (
                    <div className='stats'>
                        {!!wavedAddresses.length ? (
                            <div>
                                I have {totalWaves} waves from these addresses:
                                <ul>
                                    {wavedAddresses.map((address) => (
                                        <li key={address}>{address}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            'No one send wave to me :('
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
