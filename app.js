const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: 'us-east-1', // modified for deployment to VPC, my LocalStack set up was'us-east-1'
    // endpoint: 'http://localhost:4566', // LocalStack endpoint
    // forcePathStyle: true // LocalStack compatibility
});

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

const IMAGES_BUCKET = 't3.2.5-s3bucket-lambda'; // my LocalStack S3 bucket name was 't3.2.4-bucket-1nov24'
const ORIGINAL_FOLDER = 'original-images/';
const RESIZED_FOLDER = 'resized-images/';
const UPLOAD_TEMP_PATH = './uploads';
if (!fs.existsSync(UPLOAD_TEMP_PATH)) fs.mkdirSync(UPLOAD_TEMP_PATH); // Ensure upload directory exists

// Fetch original images
app.get('/images/original-images', async (req, res) => {
    const params = { Bucket: IMAGES_BUCKET, Prefix: ORIGINAL_FOLDER };
    try {
        const data = await s3Client.send(new ListObjectsV2Command(params));
        res.json(data.Contents || []); // Send list of objects in JSON format
    } catch (err) {
        console.error("Error listing objects:", err);
        res.status(500).send("Error listing objects");
    }
});

// Fetch resized images
app.get('/images/resized-images', async (req, res) => {
    const params = { Bucket: IMAGES_BUCKET, Prefix: RESIZED_FOLDER };
    try {
        const data = await s3Client.send(new ListObjectsV2Command(params));
        res.json(data.Contents || []);
    } catch (err) {
        console.error("Error listing objects:", err);
        res.status(500).send("Error listing objects");
    }
});

app.post('/images', async (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).send("No file uploaded.");
    }

    const file = req.files.image;
    const tempPath = `${UPLOAD_TEMP_PATH}/${file.name}`;

    // Move file to a temporary location
    file.mv(tempPath, async (err) => {
        if (err) {
            console.error("Error saving file:", err);
            return res.status(500).send("Error saving file");
        }

        // Read file and upload to S3
        try {
            const fileStream = fs.createReadStream(tempPath);
            const uploadParams = {
                Bucket: IMAGES_BUCKET,
                Key: file.name,
                Body: fileStream,
                ContentType: file.mimetype
            };
            
            const uploadCmd = new PutObjectCommand(uploadParams);
            await s3Client.send(uploadCmd);
            res.send("File uploaded successfully to S3!");

        } catch (uploadErr) {
            console.error("Error uploading to S3:", uploadErr);
            res.status(500).send("Error uploading to S3");
        } finally {
            // Clean up temporary file
            fs.unlinkSync(tempPath);
        }
    });
});

app.get('/images/:prefix/:filename', async (req, res) => {
    const { prefix, filename } = req.params;

    const getObjectParams = {
        Bucket: IMAGES_BUCKET,
        Key: `${prefix}/${filename}` // Include the prefix in the S3 key
    };

    try {
        const getObjectCmd = new GetObjectCommand(getObjectParams);
        const data = await s3Client.send(getObjectCmd);

        res.setHeader('Content-Type', data.ContentType); // Set content type for the response
        data.Body.pipe(res); // Pipe S3 object directly to response

    } catch (err) {
        console.error("Error retrieving object:", err);
        res.status(404).send("File not found");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`S3 Upload App listening at http://localhost:${PORT}`);
});
