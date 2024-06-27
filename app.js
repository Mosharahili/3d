const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Default route handler
app.get('/', (req, res) => {
  res.send('Welcome to the 3D Model Converter. Please upload a file to convert.');
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  const fileExtension = getFileExtension(filePath);

  if (!isSupportedFormat(fileExtension)) {
    fs.unlinkSync(filePath); // Delete the uploaded file
    return res.status(400).send('Unsupported file format.');
  }

  const outputDir = path.join(__dirname, 'public', 'converted');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.stl`);

  // FreeCAD command to run the Python script for conversion
  const command = `"C:\\Users\\mosha\\Desktop\\3dProject\\FreeCAD_0.21.2-2023-12-17-conda-Windows-x86_64-py310\\bin\\FreeCADCmd" "C:\\Users\\mosha\\Desktop\\3dProject\\convert_to_stl.py" "${filePath}" "${outputFilePath}"`;

  console.log(`Executing command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Conversion Error: ${error.message}`);
      fs.unlinkSync(filePath); // Delete the uploaded file
      return res.status(500).send(`Error converting file: ${error.message}`);
    }
    if (stderr) {
      console.error(`FreeCAD Error: ${stderr}`);
      fs.unlinkSync(filePath); // Delete the uploaded file
      return res.status(500).send(`FreeCAD error: ${stderr}`);
    }

    // Check if output file was created
    fs.access(outputFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File Access Error: ${err.message}`);
        fs.unlinkSync(filePath); // Delete the uploaded file
        return res.status(500).send(`Error accessing converted file: ${err.message}`);
      }

      // Read the converted STL file
      fs.readFile(outputFilePath, (err, data) => {
        if (err) {
          console.error(`File Read Error: ${err.message}`);
          fs.unlinkSync(filePath); // Delete the uploaded file
          return res.status(500).send(`Error reading converted file: ${err.message}`);
        }

        // Send the converted STL file back to the client for download
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename=${path.parse(req.file.filename).name}.stl`);
        res.send(data);

        // Clean up: Delete uploaded and converted files after sending
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputFilePath);
      });
    });
  });
});

// Function to get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Function to check if the file format is supported
function isSupportedFormat(extension) {
  const supportedFormats = [
    '3ds', 'obj', 'dwg', 'dxf', 'brep', 'brp', 'bms', 'dae', 'dat', 'svg', 'svgz', 'xlsx',
    'xml', 'xdmf', 'meshyaml', 'meshjson', 'yaml', 'json', 'i1.txt', 'bdf', 'inp', 'med',
    'unv', 'vtk', 'vtu', 'z88', 'frd', 'nc', 'gc', 'ncc', 'ngc', 'cnc', 'tap', 'gcode',
    'emn', 'iges', 'igs', 'bmp', 'jpg', 'png', 'xpm', 'ifc', 'iv', 'off', 'oca', 'csg',
    'ply', 'pov', 'inc', 'py', 'FCMacro', 'FCScript', 'step', 'stp', 'stpz', 'stpl', 'ast'
  ];
  return supportedFormats.includes(extension);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
