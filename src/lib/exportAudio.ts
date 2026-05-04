import * as Tone from "tone";

function audioBufferToPcm(buffer: AudioBuffer): Int16Array {
  const channelData = buffer.getChannelData(0);
  const pcm = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm;
}

export async function exportToMp3(webmBlob: Blob, filename: string = "collision-mix.mp3") {
  // @ts-ignore
  const lame = typeof window !== 'undefined' ? (window as any).lamejs : null;
  if (!lame) {
    console.error("lamejs not loaded");
    return;
  }

  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
  
  const pcm = audioBufferToPcm(audioBuffer);
  
  const mp3encoder = new lame.Mp3Encoder(1, audioBuffer.sampleRate, 128);
  const mp3Data = [];
  
  const sampleBlockSize = 1152;
  for (let i = 0; i < pcm.length; i += sampleBlockSize) {
    const sampleChunk = pcm.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
  downloadBlob(mp3Blob, filename);
}

export async function exportToWav(webmBlob: Blob, filename: string = "collision-mix.wav") {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
  
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  let offset = 0;
  
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
    offset += s.length;
  };

  writeString('RIFF');
  view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numOfChan, true); offset += 2;
  view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4;
  view.setUint32(offset, audioBuffer.sampleRate * 2 * numOfChan, true); offset += 4;
  view.setUint16(offset, numOfChan * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString('data');
  view.setUint32(offset, audioBuffer.length * numOfChan * 2, true); offset += 4;

  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  const wavBlob = new Blob([view], { type: "audio/wav" });
  downloadBlob(wavBlob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
