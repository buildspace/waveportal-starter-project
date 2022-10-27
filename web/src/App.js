import React, { useEffect, useState } from 'react';
import {
    findMetaMaskAccount,
    getEthereumObject,
    getWavePortalContract,
} from './utils/utils';

import './App.css';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [totalWaves, setTotalWaves] = useState(0);
    const [wavesInfo, setWavesInfo] = useState([]);
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

    const wave = async (e) => {
        e.persist();
        e.preventDefault();
        const message = e.target.message.value;
        try {
            if (ethereum) {
                const wavePortalContract = getWavePortalContract();

                const waveTxn = await wavePortalContract.wave(message, {
                    gasLimit: 300000,
                });
                setisMining(true);
                console.log('Mining...', waveTxn.hash);

                await waveTxn.wait();
                console.log('Mined -- ', waveTxn.hash);

                const count = await wavePortalContract.getTotalWaves();
                setTotalWaves(count.toNumber());

                const info = await wavePortalContract.getAllWaves();

                setWavesInfo(info);

                console.log('Retrieved total wave count...', count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setisMining(false);
            e.target.reset();
        }
    };

    const getInitialData = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const wavePortalContract = getWavePortalContract();

                const count = await wavePortalContract.getTotalWaves();
                setTotalWaves(count.toNumber());

                const info = await wavePortalContract.getAllWaves();
                setWavesInfo(info);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsInitialized(true);
        }
    };

    useEffect(() => {
        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            console.log('NewWave', from, timestamp, message);

            setTotalWaves((prevState) => prevState + 1);
            setWavesInfo((prevState) => [
                ...prevState,
                {
                    waver: from,
                    timestamp: new Date(timestamp.toString()),
                    message,
                },
            ]);
        };

        if (ethereum) {
            wavePortalContract = getWavePortalContract();
            wavePortalContract.on('NewWave', onNewWave);
        }

        return () => {
            if (wavePortalContract)
                wavePortalContract.off('NewWave', onNewWave);
        };
    }, []);

    useEffect(() => {
        const find = async () => {
            const account = await findMetaMaskAccount();
            setCurrentAccount(account);
            getInitialData();
        };

        find();
    }, []);

    return (
        <div className='mainContainer'>
            <div className='dataContainer'>
                <div className='header'>
                    <span role='img' aria-label='waving hand'>
                        👋
                    </span>
                    Xin chào!
                </div>

                <div className='bio'>
                    I am Nikita and I live in Việt Nam&nbsp;
                    <span role='img' aria-label='Vietnam flag'>
                        🇻🇳
                    </span>
                    &nbsp;so that's pretty cool right? Connect your Ethereum
                    wallet and wave at me!
                </div>

                <form onSubmit={wave} className='form'>
                    <label className='form__label bio'>
                        Write message for me!
                        <textarea
                            name='message'
                            required
                            className='form__textarea'
                        />
                    </label>

                    <button
                        className='waveButton'
                        type='submit'
                        disabled={isMining}
                        data-isloading={isMining}
                    >
                        {isMining ? 'Mining' : 'Wave at Me'}
                    </button>
                </form>

                {!currentAccount && isInitialized && (
                    <button
                        className='waveButton'
                        onClick={connectWallet}
                        disabled={isMining}
                        data-isloading={isMining}
                    >
                        {isMining ? 'Connect Wallet' : 'Connecting Wallet'}
                    </button>
                )}

                {!isInitialized && (
                    <div className='bio' data-isloading={isMining}>
                        Loading data
                    </div>
                )}
                <div className='stats'>
                    {!totalWaves ? (
                        <div>No one send wave to me :(</div>
                    ) : (
                        <>
                            <div>
                                I have {totalWaves} waves! You can see waved
                                messages bellow.
                            </div>
                            <div className='stats__list'>
                                {wavesInfo.map(
                                    ({ waver, timestamp, message }, index) => (
                                        <div className='list__el' key={index}>
                                            <div>Address: {waver}</div>
                                            <div>
                                                Time:&nbsp;
                                                {Date(timestamp.toString())}
                                            </div>
                                            <div>Message: {message}</div>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
