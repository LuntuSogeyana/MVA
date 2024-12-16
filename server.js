const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Set up storage for uploaded files (this stores files locally)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);  // Store files in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve static files (index.html, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// Serve uploaded videos as static files
app.use('/uploads', express.static('uploads'));

// Route to handle video uploads
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    const videoMetadata = {
        title: req.body.title,
        url: `/uploads/${req.file.filename}`
    };

    // Read current video data from videos.json, add new video, and save it back
    fs.readFile('videos.json', (err, data) => {
        if (err) throw err;
        const videos = JSON.parse(data);
        videos.push(videoMetadata);
        fs.writeFile('videos.json', JSON.stringify(videos, null, 2), (err) => {
            if (err) throw err;
            res.json(videoMetadata);
        });
    });
});

app.get('/videos', (req, res) => {
    fs.readFile('videos.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading videos.');
        }
        const videos = JSON.parse(data);
        res.json(videos);
    });
});

// Route to the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
