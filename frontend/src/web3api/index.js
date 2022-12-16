import { ethers } from 'ethers';

import cubieTAbi from './abi/cubiet';

window.ethereum.on('accountsChanged', (accounts) => window.location.reload());
window.ethereum.on('chainChanged', (chainId) => window.location.reload());

export const provider = new ethers.providers.Web3Provider(window.ethereum);
export const address = provider.send("eth_requestAccounts", []).then((addresses) => addresses[0]);

// 0x28ccb1d3d3dd3814b3e5fd11d5a86abf122a6e1d
export const cubiet = provider.send("eth_requestAccounts", [])
    .then(() => new ethers.Contract("0xc1962fd53515baf49f490828dbd19204003e685b", cubieTAbi, provider).connect(provider.getSigner()));