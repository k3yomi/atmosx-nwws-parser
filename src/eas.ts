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
     * @function generateEASAudio
     * @description
     *     Generates an EAS (Emergency Alert System) audio file for a given message
     *     and SAME/VTEC code. The audio is composed of optional intro tones, SAME
     *     headers, attention tones, TTS narration of the message, and repeated
     *     SAME headers. The resulting audio is processed for NWR-style broadcast
     *     quality and saved as a WAV file.
     *
     * @static
     * @async
     * @param {string} message
     *     The text message to be converted into EAS TTS audio.
     * @param {string} vtec
     *     The SAME/VTEC code used for generating SAME headers.
     *
     * @returns {Promise<string | null>}
     *     Resolves with the path to the generated WAV file, or `null` if generation fails.
     *
     * @example
     *     const outputFile = await EAS.generateEASAudio(
     *         "Severe Thunderstorm Warning in effect for your area.",
     *         "TO.WSW.KXYZ.SV.W.0001.230102T1234Z-230102T1300Z"
     *     );
     *     console.log(`EAS audio saved to: ${outputFile}`);
     */
    public static generateEASAudio(message: string, vtec: string) {
        return new Promise(async (resolve) => {
            const settings = loader.settings as types.ClientSettingsTypes;
            const assetsDir = settings.global_settings.eas_settings.directory;
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

            if (loader.packages.fs.existsSync(settings.global_settings.eas_settings.intro_wav)) {
                const toneBuffer = loader.packages.fs.readFileSync(settings.global_settings.eas_settings.intro_wav);
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
     * @function encodeWavPCM16
     * @description
     *     Encodes an array of 16-bit PCM samples into a standard WAV file buffer.
     *     Produces mono audio with 16 bits per sample and a specified sample rate.
     *
     *     The input `samples` array should be an array of objects containing a
     *     numeric `value` property representing the PCM sample.
     *
     * @private
     * @static
     * @param {Record<string, number>[]} samples
     *     An array of objects each containing a numeric `value` representing a
     *     16-bit PCM audio sample.
     * @param {number} [sampleRate=8000]
     *     The audio sample rate in Hz. Defaults to 8000 Hz.
     *
     * @returns {Buffer}
     *     A Node.js Buffer containing the WAV file bytes.
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
     * @function parseWavPCM16
     * @description
     *     Parses a WAV buffer containing 16-bit PCM mono audio and extracts
     *     the sample data along with format information.
     *
     *     Only supports PCM format (audioFormat = 1), 16 bits per sample,
     *     and single-channel (mono) audio. Returns `null` if the buffer
     *     is invalid or does not meet these requirements.
     *
     * @private
     * @static
     * @param {Buffer} buffer
     *     The WAV file data to parse.
     *
     * @returns { { samples: Int16Array; sampleRate: number; channels: number; bitsPerSample: number } | null }
     *     Returns an object with the extracted audio samples and format
     *     information, or `null` if parsing fails or format is unsupported.
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
     * @function concatPCM16
     * @description
     *     Concatenates multiple Int16Array PCM audio buffers into a single
     *     contiguous Int16Array.
     *
     * @private
     * @static
     * @param {Int16Array[]} arrays
     *     An array of Int16Array buffers to concatenate.
     *
     * @returns {Int16Array}
     *     A single Int16Array containing all input buffers in sequence.
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
     * @function pcm16toFloat
     * @description
     *     Converts a PCM16 Int16Array audio buffer to a Float32Array
     *     with normalized values in the range [-1, 1).
     *
     * @private
     * @static
     * @param {Int16Array} int16
     *     The input PCM16 Int16Array buffer.
     *
     * @returns {Float32Array}
     *     A Float32Array containing normalized audio samples.
     */
    private static pcm16toFloat(int16: Int16Array) {
        const out = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 32768;
        return out;
    }

    /**
     * @function floatToPcm16
     * @description
     *     Converts a Float32Array of audio samples in the range [-1, 1]
     *     to a PCM16 Int16Array.
     *
     * @private
     * @static
     * @param {Float32Array} float32
     *     The input Float32Array containing normalized audio samples.
     *
     * @returns {Int16Array}
     *     A PCM16 Int16Array with values scaled to the [-32767, 32767] range.
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
     * @function resamplePCM16
     * @description
     *     Resamples a PCM16 audio buffer from an original sample rate to a
     *     target sample rate using linear interpolation.
     *
     * @private
     * @static
     * @param {Int16Array} int16
     *     The original PCM16 audio buffer to resample.
     * @param {number} originalRate
     *     The sample rate (in Hz) of the original audio buffer.
     * @param {number} targetRate
     *     The desired sample rate (in Hz) for the output buffer.
     *
     * @returns {Int16Array}
     *     A new PCM16 buffer resampled to the target sample rate.
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
     * @function generateSilence
     * @description
     *     Generates a PCM16 audio buffer containing silence for a specified
     *     duration.
     *
     * @private
     * @static
     * @param {number} ms
     *     Duration of the silence in milliseconds.
     * @param {number} [sampleRate=8000]
     *     Sample rate in Hz for the generated PCM16 audio.
     *
     * @returns {Int16Array}
     *     A PCM16 buffer filled with zeros representing silence.
     */
    private static generateSilence(ms: number, sampleRate:number = 8000) { 
        return new Int16Array(Math.floor(ms * sampleRate));
    }

    /**
     * @function generateAttentionTone
     * @description
     *     Generates a dual-frequency Attention Tone (853 Hz and 960 Hz) used in
     *     EAS/SAME alerts. Produces a PCM16 buffer of the specified duration.
     *
     * @private
     * @static
     * @param {number} ms
     *     Duration of the tone in milliseconds.
     * @param {number} [sampleRate=8000]
     *     Sample rate in Hz for the generated PCM16 audio.
     *
     * @returns {Int16Array}
     *     A PCM16 buffer containing the generated Attention Tone.
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
     * @function applyNWREffect
     * @description
     *     Applies a National Weather Radio (NWR)-style audio effect to a PCM16
     *     buffer, including high-pass and low-pass filtering, soft clipping
     *     compression, and optional bit reduction to simulate vintage broadcast
     *     characteristics.
     *
     * @private
     * @static
     * @param {Int16Array} int16
     *     The input PCM16 audio data.
     * @param {number} [sampleRate=8000]
     *     The sample rate in Hz of the input audio.
     *
     * @returns {Int16Array}
     *     A new PCM16 buffer with the NWR-style audio effect applied.
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
     * @function addNoise
     * @description
     *     Adds random noise to a PCM16 audio buffer and normalizes the signal
     *     to prevent clipping. Useful for simulating real-world signal conditions
     *     or reducing digital artifacts.
     *
     * @private
     * @static
     * @param {Int16Array} int16
     *     The input PCM16 audio data.
     * @param {number} [noiseLevel=0.02]
     *     The amplitude of noise to add (0.0–1.0 scale).
     *
     * @returns {Int16Array}
     *     A new PCM16 buffer with added noise and normalized amplitude.
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
     * @function asciiTo8N1Bits
     * @description
     *     Converts an ASCII string into a sequence of bits using the 8N1 framing
     *     convention (1 start bit, 8 data bits, 2 stop bits) commonly used in
     *     serial and EAS transmissions.
     *
     * @private
     * @static
     * @param {string} str
     *     The ASCII string to convert into a bit sequence.
     *
     * @returns {number[]}
     *     An array of 0s and 1s representing the framed bit sequence for each character.
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
     * @function generateAFSK
     * @description
     *     Converts a sequence of bits into AFSK-modulated PCM16 audio data for EAS
     *     alerts. Applies a fade-in and fade-out to reduce clicks and generates
     *     the audio at the specified sample rate.
     *
     * @private
     * @static
     * @param {number[]} bits
     *     Array of 0 and 1 representing the bit sequence to encode.
     * @param {number} [sampleRate=8000]
     *     Sample rate in Hz for the generated audio.
     *
     * @returns {Int16Array}
     *     The PCM16 audio data representing the AFSK-modulated bit sequence.
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
     * @function generateSAMEHeader
     * @description
     *     Generates a SAME (Specific Area Message Encoding) audio header for
     *     EAS alerts. Converts a VTEC string into AFSK-modulated PCM16 audio,
     *     optionally repeating the signal with pre-mark and gap intervals.
     *
     * @private
     * @static
     * @param {string} vtec
     *     The VTEC code string to encode into the SAME header.
     * @param {number} repeats
     *     Number of times to repeat the SAME burst sequence.
     * @param {number} [sampleRate=8000]
     *     Sample rate in Hz for the generated audio.
     * @param {{preMarkSec?: number, gapSec?: number}} [options={}]
     *     Optional timing adjustments:
     *       - preMarkSec: Duration of the pre-mark tone before the data (seconds).
     *       - gapSec: Silence gap between bursts (seconds).
     *
     * @returns {Int16Array}
     *     The concatenated PCM16 audio data representing the SAME header.
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