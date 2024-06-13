import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const sourceDir = path.join(__dirname, '../../../_posts');
const destinationDir = path.join(__dirname, '../content/blog');

fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error('Error reading source directory:', err);
        return;
    }

    files.forEach((file) => {
        const sourceFile = path.join(sourceDir, file);
        const fileContent = fs.readFileSync(sourceFile, 'utf-8');
        const modifiedContent = fileContent.replace(/layout:\s*post/g, '');
        const fileNameWithoutExtension = path.parse(file).name;
        const folderPath = path.join(destinationDir, fileNameWithoutExtension);
        const destinationFile = path.join(folderPath, 'index.md');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        fs.writeFileSync(destinationFile, modifiedContent, 'utf-8');
        // copy images
        const imageDir = path.join(sourceDir, fileNameWithoutExtension);
        if (fs.existsSync(imageDir))
            fs.readdirSync(imageDir).forEach((image) => {
                const imageFile = path.join(imageDir, image);
                const destinationImageDir = path.join(folderPath, image);
                fs.copyFileSync(imageFile, destinationImageDir);
            });

    });
});