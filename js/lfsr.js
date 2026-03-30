class LFSR39 {
    constructor(seed) {
        this.register = seed.split('').map(Number);
    }

    getNextBit() {
        // x^39 + x^4 + 1
        const feedback = this.register[38] ^ this.register[3];
        const output = this.register.pop();
        this.register.unshift(feedback);
        return output;
    }

    getNextByte() {
        let byte = 0;
        for (let i = 0; i < 8; i++) {
            byte = (byte << 1) | this.getNextBit();
        }
        return byte;
    }
}