const ethers = require('ethers');
require('dotenv').config();
//This contains an Endpoint URL, and a wallet private key!!!
const secrets = require('./secrets.json');
const predictionInterface = require('./prediction.json')
const provider = new ethers.providers.WebSocketProvider(secrets.provider);

const walletBull = new ethers.Wallet(secrets.privatekeyBull);
const signerBull = walletBull.connect(provider);

const predictionContractBull = new ethers.Contract(
    process.env.PREDICTION_ADDRESS,
    predictionInterface.abi,
    signerBull
);

const walletBear = new ethers.Wallet(secrets.privatekeyBear);
const signerBear = walletBear.connect(provider);
const predictionContractBear = new ethers.Contract(
    process.env.PREDICTION_ADDRESS,
    predictionInterface.abi,
    signerBear
);

const minUSD = +process.env.MIN_USD;
const maxUSD = +process.env.MAX_USD;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

predictionContractBull.on('StartRound', async (epoch) => {
    try {
    console.log(`
      StartRound: epoch: ${epoch}
    `);
    // random pull
    let randomPull = getRandomInt(maxUSD - minUSD) + minUSD;
    const usdtAmountPull = ethers.utils.parseUnits(randomPull.toString(), 6);
    // betBull
    const betBull = await predictionContractBull.betBull(
        epoch,
        usdtAmountPull,
        {gasLimit: 3000000, gasPrice: 125000000000}
    )
    let receiptBull = await betBull.wait();
    console.log(receiptBull);

    // random bear
    let randomBear = getRandomInt(maxUSD - minUSD) + minUSD;
    const usdtAmountBear = ethers.utils.parseUnits(randomBear.toString(), 6);
    // betBear
    const betBear = await predictionContractBear.betBear(
        epoch,
        usdtAmountBear,
        {gasLimit: 3000000, gasPrice: 125000000000}
    )
    let receiptBear = await betBear.wait();
    console.log(receiptBear);

    } catch(err) {
        console.log(err);
    }
});
