import {
  getNaturalImageProperties,
  convertBlobToBase64,
  getVideoMetadata
} from "./utils";

export const analyzeImage = file => {
  console.group(`[BrowserFile] Analyzing image file...`);

  return new Promise((resolve, reject) => {
    const srcBlob = window.URL.createObjectURL(file);

    Promise.all([getNaturalImageProperties(srcBlob), convertBlobToBase64(file)])
      .then(results => {
        const dimensions = results[0];
        const thumbnail = results[1];
        resolve({
          ...dimensions,
          thumbnail
        });
      })
      .catch(error => {
        console.error("[FileAnalyzer] Analyzing image failed", error);
        reject(error);
      })
      .finally(() => {
        // Cleanup.
        window.URL.revokeObjectURL(srcBlob);
      });
  });
};

export const analyzeVideo = file => {
  console.group("Analyzing video file...");

  return new Promise((resolve, reject) => {
    const srcBlob = window.URL.createObjectURL(file);
    getVideoMetadata(srcBlob)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        console.error("[FileAnalyzer] Analyzing video failed", error);
        reject(error);
      })
      .finally(() => {
        // Cleanup.
        window.URL.revokeObjectURL(srcBlob);
      });
  });
};

export const splitToChunks = (file, chunkSize) => {
  const { size, type } = file;

  const chunks = [];
  let begin = 0;
  let continueSplitChunks = true;

  while (continueSplitChunks) {
    let end = begin + chunkSize;

    if (size - end < 0) {
      end = size;
      continueSplitChunks = false;
    }

    console.log(
      `[FileAnalyzer] Processing chunk, begin: ${begin} end: ${end} of: ${size}`
    );

    const chunk = file.slice(begin, end, type);
    chunks.push(chunk);

    begin = end;
  }

  return chunks;
};

export default class FileAnalyzer {
  static async analyze(file) {
    const { type, size, name } = file;
    let analyzeResult = null;

    const chunks = splitToChunks(file, 1048576);

    if (type.includes("image")) {
      analyzeResult = await analyzeImage(file);
    }

    if (type.includes("video")) {
      analyzeResult = await analyzeVideo(file);
    }

    return {
      type,
      size,
      name,
      chunks,
      ...analyzeResult
    };
  }
}
