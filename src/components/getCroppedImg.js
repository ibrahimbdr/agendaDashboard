function getCroppedImg(imageSrc, pixelCrop, fileName) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = imageSrc;
    image.onload = function () {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], fileName, { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        1
      );
    };
    image.onerror = function () {
      reject(new Error("Failed to load image"));
    };
  });
}

export default getCroppedImg;
