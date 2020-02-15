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

export default class FileAnalyzer {
  static async analyze(file) {
    const { type, size, name } = file;
    let analyzeResult = null;

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
      ...analyzeResult
    };
  }
}
