
function minifyTezosAddress(address: string): string {
    if (address)
        return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
    return address;
}

function splitNumber(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function roundBalance(balance: number): number {
    return Math.trunc(balance / 10000) / 100;
}

function toBalance(balance: number): string {
    let roundedBalance = roundBalance(balance);
    return splitNumber(roundedBalance);
}

export { minifyTezosAddress, roundBalance, toBalance };
