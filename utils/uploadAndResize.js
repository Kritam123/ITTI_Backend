import { v2 as cloudinary } from 'cloudinary';

async function uploadAndResize(imagePaths) {
    try {
        const uploadPromises = imagePaths?.map(file => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(file.path, {
                    folder: "products",
                    quality: "auto:good", 
                    fetch_format: "auto" 
                }, (error, result) => {
                    if (error) reject(error);
                    else {
                        let format = result.format;
                        let imgId = result.public_id;
                        // Generate URLs for resized images
                        const smallImgUrl = cloudinary.url(imgId, {
                            width: 256,
                            height: 197,
                            crop: 'scale',
                            format: format,
                            quality: 'auto:good', 
                            fetch_format: 'auto' 
                        });

                        const previewImgUrl = cloudinary.url(imgId, {
                            width: 1920,
                            height: 1475,
                            crop: 'scale',
                            format: format,
                            quality: 'auto:good',
                            fetch_format: 'auto' 
                        });
                        resolve({ smallImgUrl, smallImgId: imgId, previewImgUrl, previewImgId: imgId });
                    };
                });
            });
        });

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        throw error;
    }
}


export { uploadAndResize }