/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| "_ ` _ \ / _ \/ __| "_ \| "_ \ / _ \ "__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: KiyoWx (k3yomi)                
*/


import * as loader from './bootstrap';
import * as types from './types';
import Utils from './utils';



export class EAS {

    /**
     * generateEASAudio creates an EAS-compliant audio file in WAV format containing the provided message and VTEC header.
     *
     * @public
     * @static
     * @param {string} message 
     * @param {string} vtec 
     * @returns {*} 
     */
    public static generateEASAudio(message: string, vtec: string) {
        return new Promise(async (resolve) => {
            const settings = loader.settings as types.ClientSettings;
            const assetsDir = settings.global.easSettings.easDirectory;
            const rngFile = `${vtec.replace(/[^a-zA-Z0-9]/g, `_`)}`.substring(0, 32).replace(/^_+|_+$/g, '');
            const os = loader.packages.os.platform();
            for (const { regex, replacement } of loader.definitions.messageSignatures) { message = message.replace(regex, replacement); }
            if (!assetsDir) { Utils.warn(loader.definitions.messages.eas_no_directory); return resolve(null); }
            if (!loader.packages.fs.existsSync(assetsDir)) { loader.packages.fs.mkdirSync(assetsDir); }

            const tmpTTS = loader.packages.path.join(assetsDir, `/tmp/${rngFile}.wav`);
            const outTTS = loader.packages.path.join(assetsDir, `/output/${rngFile}.wav`);
            const voice = process.platform === 'win32' ? 'Microsoft David Desktop' : 'en-US-GuyNeural';


            if (!loader.packages.fs.existsSync(loader.packages.path.join(assetsDir, `/tmp`))) { loader.packages.fs.mkdirSync(loader.packages.path.join(assetsDir, `/tmp`), { recursive: true }); }
            if (!loader.packages.fs.existsSync(loader.packages.path.join(assetsDir, `/output`))) { loader.packages.fs.mkdirSync(loader.packages.path.join(assetsDir, `/output`), { recursive: true }); }
            if (os === 'win32') { loader.packages.say.export(message, voice, 1.0, tmpTTS); }
            await Utils.sleep(3500);
            let ttsBuffer: Buffer = null;
            while (!loader.packages.fs.existsSync(tmpTTS) || (ttsBuffer = loader.packages.fs.readFileSync(tmpTTS)).length === 0) {
                await Utils.sleep(500); // Wait for 500ms before retrying
            }

            const ttsWav = this.parseWavPCM16(ttsBuffer);
            const ttsSamples = this.resamplePCM16(ttsWav.samples, ttsWav.sampleRate, 8000);
            const ttsRadio = this.applyNWREffect(ttsSamples, 8000);
            let toneRadio = null;

            if (loader.packages.fs.existsSync(settings.global.easSettings.easIntroWav)) {
                const toneBuffer = loader.packages.fs.readFileSync(settings.global.easSettings.easIntroWav);
                const toneWav = this.parseWavPCM16(toneBuffer);
                if (toneWav == null) { console.log(`[EAS] Intro tone WAV file is not valid PCM 16-bit format.`); return resolve(null); }
                const toneSamples = (toneWav.sampleRate !== 8000 ? this.resamplePCM16(toneWav.samples, toneWav.sampleRate, 8000) : toneWav.samples);
                toneRadio = this.applyNWREffect(toneSamples, 8000);
            }
            let build = toneRadio != null  ? [toneRadio, this.generateSilence(0.5, 8000)] : [];
            build.push( this.generateSAMEHeader(vtec, 3, 8000, { preMarkSec: 1.1, gapSec: 0.5 }), this.generateSilence(0.5, 8000), this.generateAttentionTone(8, 8000), this.generateSilence(0.5, 8000), ttsRadio);

            for (let i = 0; i < 3; i++) {
                build.push(this.generateSAMEHeader(vtec, 1, 8000, { preMarkSec: 0.5, gapSec: 0.1 }));
                build.push(this.generateSilence(0.5, 8000));
            }
            const allSamples = this.concatPCM16(build);
            const finalSamples = this.addNoise(allSamples, 0.002);
            const outBuffer = this.encodeWavPCM16(Array.from(finalSamples).map(v => ({ value: v })), 8000);
            loader.packages.fs.writeFileSync(outTTS, outBuffer);
            try {
                loader.packages.fs.unlinkSync(tmpTTS);
            } catch (error) {
                if (error.code !== 'EBUSY') { throw error; }
            }
            return resolve(outTTS);
        });
    }

    /**
     * encodeWavPCM16 encodes an array of samples into a WAV PCM 16-bit Buffer.
     *
     * @private
     * @static
     * @param {Record<string, number>[]} samples 
     * @param {number} [sampleRate=8000] 
     * @returns {Buffer} 
     */
    private static encodeWavPCM16(samples: Record<string, number>[], sampleRate: number = 8000) {
        const bytesPerSample = 2;
        const blockAlign = 1 * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const subchunk2Size = samples.length * bytesPerSample;
        const chunkSize = 36 + subchunk2Size;

        const buffer = Buffer.alloc(44 + subchunk2Size);
        let o = 0;
        buffer.write("RIFF", o); o += 4;
        buffer.writeUInt32LE(chunkSize, o); o += 4;
        buffer.write("WAVE", o); o += 4;

        buffer.write("fmt ", o); o += 4;
        buffer.writeUInt32LE(16, o); o += 4;                 
        buffer.writeUInt16LE(1, o); o += 2;                  
        buffer.writeUInt16LE(1, o); o += 2;
        buffer.writeUInt32LE(sampleRate, o); o += 4;
        buffer.writeUInt32LE(byteRate, o); o += 4;
        buffer.writeUInt16LE(blockAlign, o); o += 2;
        buffer.writeUInt16LE(16, o); o += 2;

        buffer.write("data", o); o += 4;
        buffer.writeUInt32LE(subchunk2Size, o); o += 4;

        for (let i = 0; i < samples.length; i++, o += 2) {
            buffer.writeInt16LE(samples[i].value, o);
        }
        return buffer;
    }

    /**
     * parseWavPCM16 decodes a WAV PCM 16-bit Buffer into its sample data and format information.
     *
     * @private
     * @static
     * @param {Buffer} buffer 
     * @returns {{ samples: any; sampleRate: any; channels: any; bitsPerSample: any; }} 
     */
    private static parseWavPCM16(buffer: Buffer) {
        if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") { return null; }
        let fmt = null;
        let data = null;
        let i = 12;
        while (i + 8 <= buffer.length) {
            const id = buffer.toString("ascii", i, i + 4);
            const size = buffer.readUInt32LE(i + 4);
            const start = i + 8;
            const end = start + size;
            if (id === "fmt ") fmt = buffer.slice(start, end);
            if (id === "data") data = buffer.slice(start, end);
            i = end + (size % 2); 
        }
        if (!fmt || !data) return null;
        const audioFormat = fmt.readUInt16LE(0);
        const channels = fmt.readUInt16LE(2);
        const sampleRate = fmt.readUInt32LE(4);
        const bitsPerSample = fmt.readUInt16LE(14);
        if (audioFormat !== 1 || bitsPerSample !== 16 || channels !== 1) { return null; }
        const samples = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
        return { samples: new Int16Array(samples), sampleRate, channels, bitsPerSample };
    }

    /**
     * concatPCM16 concatenates multiple Int16Array buffers into a single Int16Array buffer.
     *
     * @private
     * @static
     * @param {Int16Array[]} arrays 
     * @returns {*} 
     */
    private static concatPCM16(arrays: Int16Array[]) {
        let total = 0;
        for (const a of arrays) total += a.length;
        const out = new Int16Array(total);
        let o = 0;
        for (const a of arrays) {
            out.set(a, o);
            o += a.length;
        }
        return out;
    }

    /**
     * pcm16toFloat converts an Int16Array of PCM 16-bit samples to a Float32Array of normalized float samples.
     *
     * @private
     * @static
     * @param {Int16Array} int16 
     * @returns {*} 
     */
    private static pcm16toFloat(int16: Int16Array) {
        const out = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 32768;
        return out;
    }

    /**
     * floatToPcm16 converts a Float32Array of normalized float samples to an Int16Array of PCM 16-bit samples.
     *
     * @private
     * @static
     * @param {Float32Array} float32 
     * @returns {*} 
     */
    private static floatToPcm16(float32: Float32Array) {
        const out = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            let v = Math.max(-1, Math.min(1, float32[i]));
            out[i] = Math.round(v * 32767);
        }
        return out;
    }

    /**
     * resamplePCM16 resamples an Int16Array of PCM 16-bit samples from the original sample rate to the target sample rate using linear interpolation.
     *
     * @private
     * @static
     * @param {Int16Array} int16 
     * @param {number} originalRate 
     * @param {number} targetRate 
     * @returns {*} 
     */
    private static resamplePCM16(int16: Int16Array, originalRate: number, targetRate: number) {
        if (originalRate === targetRate) return int16;
        const ratio = targetRate / originalRate;
        const outLen = Math.max(1, Math.round(int16.length * ratio));
        const out = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
            const pos = i / ratio;
            const i0 = Math.floor(pos);
            const i1 = Math.min(i0 + 1, int16.length - 1);
            const frac = pos - i0;
            const v = int16[i0] * (1 - frac) + int16[i1] * frac;
            out[i] = Math.round(v);
        }
        return out;
    }
    
    /**
     * generateSilence creates an Int16Array of PCM 16-bit samples representing silence for the specified duration in milliseconds.
     *
     * @private
     * @static
     * @param {number} ms 
     * @param {number} [sampleRate=8000] 
     * @returns {*} 
     */
    private static generateSilence(ms: number, sampleRate:number = 8000) { 
        return new Int16Array(Math.floor(ms * sampleRate));
    }
    
    /**
     * generateAttentionTone creates an Int16Array of PCM 16-bit samples representing the EAS attention tone for the specified duration in milliseconds.
     *
     * @private
     * @static
     * @param {*} ms 
     * @param {number} [sampleRate=8000] 
     * @returns {*} 
     */
    private static generateAttentionTone(ms, sampleRate: number = 8000) {
        const len = Math.floor(ms * sampleRate);
        const out = new Int16Array(len);
        const f1 = 853;
        const f2 = 960;
        const twoPi = Math.PI * 2;
        const amp = 0.1;
        const fadeLen = Math.floor(sampleRate * 0.00); 
        for (let i = 0; i < len; i++) {
            const t = i / sampleRate;
            const s = Math.sin(twoPi * f1 * t) + Math.sin(twoPi * f2 * t);
            let gain = 1;
            if (i < fadeLen) gain = i / fadeLen;
            else if (i > len - fadeLen) gain = (len - i) / fadeLen;
            const v = Math.max(-1, Math.min(1, (s / 2) * amp * gain));
            out[i] = Math.round(v * 32767);
        }
        return out;
    }
    
    /**
     * applyNWREffect applies a series of audio processing effects to simulate the sound characteristics of NOAA Weather Radio broadcasts.
     *
     * @private
     * @static
     * @param {Int16Array} int16 
     * @param {number} [sampleRate=8000] 
     * @returns {*} 
     */
    private static applyNWREffect(int16: Int16Array, sampleRate: number = 8000) {
        const hpCut = 3555;
        const lpCut = 1600;
        const noiseLevel = 0.0;
        const crushBits = 8;
        const x = this.pcm16toFloat(int16);
        const dt = 1 / sampleRate;
        const rcHP = 1 / (2 * Math.PI * hpCut);
        const aHP = rcHP / (rcHP + dt);
        let yHP = 0, xPrev = 0;
        for (let i = 0; i < x.length; i++) {
            const xi = x[i];
            yHP = aHP * (yHP + xi - xPrev);
            xPrev = xi;
            x[i] = yHP;
        }
        const rcLP = 1 / (2 * Math.PI * lpCut);
        const aLP = dt / (rcLP + dt);
        let yLP = 0;
        for (let i = 0; i < x.length; i++) {
            yLP = yLP + aLP * (x[i] - yLP);
            x[i] = yLP;
        }
        const compGain = 2.0;
        const norm = Math.tanh(compGain);
        for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * compGain) / norm;
        const levels = Math.pow(2, crushBits) - 1;
        return this.floatToPcm16(x);
    }
    
    /**
     * addNoise adds low-level white noise to an Int16Array of PCM 16-bit samples to simulate analog broadcast imperfections.
     *
     * @private
     * @static
     * @param {Int16Array} int16 
     * @param {number} [noiseLevel=0.02] 
     * @returns {*} 
     */
    private static addNoise(int16: Int16Array, noiseLevel: number = 0.02) {
        const x = this.pcm16toFloat(int16);
        for (let i = 0; i < x.length; i++) x[i] += (Math.random() * 2 - 1) * noiseLevel;
        let peak = 0;
        for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
        if (peak > 1) for (let i = 0; i < x.length; i++) x[i] *= 0.98 / peak;
        return this.floatToPcm16(x);
    }
    
    /**
     * asciiTo8N1Bits converts an ASCII string to a sequence of bits using 8-N-1 encoding (8 data bits, no parity, 1 stop bit).
     *
     * @private
     * @static
     * @param {string} str 
     * @returns {{}} 
     */
    private static asciiTo8N1Bits(str: string) { 
        const bits = [];
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i) & 0xFF;
            bits.push(0);
            for (let b = 0; b < 8; b++) bits.push((c >> b) & 1);
            bits.push(1, 1);
        }
        return bits;
    }
    
    /**
     * generateAFSK generates an Int16Array of PCM 16-bit samples representing AFSK modulation of the provided bit sequence.
     *
     * @private
     * @static
     * @param {number[]} bits 
     * @param {number} [sampleRate=8000] 
     * @returns {*} 
     */
    private static generateAFSK(bits: number[], sampleRate: number = 8000) {
        const baud = 520.83;
        const markFreq = 2083.3;
        const spaceFreq = 1562.5;
        const amplitude = 0.6;
        const twoPi = Math.PI * 2;
        const result = [];
        let phase = 0;
        let frac = 0;
        for (let b = 0; b < bits.length; b++) {
            const bit = bits[b];
            const freq = bit ? markFreq : spaceFreq;
            const samplesPerBit = sampleRate / baud + frac;
            const n = Math.round(samplesPerBit);
            frac = samplesPerBit - n;
            const inc = twoPi * freq / sampleRate;
            for (let i = 0; i < n; i++) {
                result.push(Math.round(Math.sin(phase) * amplitude * 32767));
                phase += inc;
                if (phase > twoPi) phase -= twoPi;
            }
        }
        const fadeSamples = Math.floor(sampleRate * 0.002);
        for (let i = 0; i < fadeSamples; i++) {
            const gain = i / fadeSamples;
            result[i] = Math.round(result[i] * gain);
            result[result.length - 1 - i] = Math.round(result[result.length - 1 - i] * gain);
        }

        return Int16Array.from(result);
    }
    
    /**
     * generateSAMEHeader generates an Int16Array of PCM 16-bit samples representing the SAME header repeated the specified number of times.
     *
     * @private
     * @static
     * @param {string} vtec 
     * @param {number} repeats 
     * @param {number} [sampleRate=8000] 
     * @param {{preMarkSec?: number, gapSec?: number}} [options={}] 
     * @returns {*} 
     */
    private static generateSAMEHeader(vtec: string, repeats: number, sampleRate: number = 8000, options: {preMarkSec?: number, gapSec?: number} = {}) {
        const preMarkSec = options.preMarkSec ?? 0.3;
        const gapSec = options.gapSec ?? 0.1;
        const bursts = [];
        const gap = this.generateSilence(gapSec, sampleRate);
        for (let i = 0; i < repeats; i++) {
            const bodyBits = this.asciiTo8N1Bits(vtec);
            const body = this.generateAFSK(bodyBits, sampleRate);
            const extendedBodyDuration = Math.round(preMarkSec * sampleRate);
            const extendedBody = new Int16Array(extendedBodyDuration + gap.length);
            for (let j = 0; j < extendedBodyDuration; j++) { 
                extendedBody[j] = Math.round(body[j % body.length] * 0.2); 
            }
            extendedBody.set(gap, extendedBodyDuration);
            bursts.push(extendedBody);
            if (i !== repeats - 1) bursts.push(gap);
        }
        return this.concatPCM16(bursts);
    }
}

export default EAS;