export const getNaturalImageProperties = src => {
  return new Promise((resolve, reject) => {
    const imageElement = document.createElement("img");
    imageElement.addEventListener("onload", () => {
      const { naturalHeight, naturalWidth } = imageElement;
      console.log(
        `Analyzing image natural size: [h:${naturalHeight},w:${naturalWidth}]`
      );

      resolve({
        height: naturalHeight,
        width: naturalWidth
      });
    });

    imageElement.src = src;
  });
};

export const getVideoMetadata = src => {
  return new Promise((resolve, reject) => {
    // Load only 0.5 second from the video.
    const partialSource = `${src}#t=0.5`;
    const videoElement = document.createElement("video");

    videoElement.addEventListener("loadedmetadata", () => {
      // retrieve dimensions and duration.
      const { videoHeight: height, videoWidth: width, duration } = videoElement;
      const thumbnail = getVideoSnapShot(videoElement, width, height);

      resolve({
        height,
        width,
        duration,
        thumbnail
      });
    });

    videoElement.onerror = error => {
      console.error("Could not load video metadata", error);
    };

    videoElement.src = partialSource;
  });
};

export const getVideoSnapShot = (videoElement, width, height) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(videoElement, 0, 0, width, height);

  return canvas.toDataURL();
};

export const convertBlobToBase64 = blob => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const { result } = reader;
      resolve(result);
    };
    reader.readAsDataURL(blob);
  });
};
