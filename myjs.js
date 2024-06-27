document.addEventListener('DOMContentLoaded', () => {
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('file-input');
  const convertBtn = document.getElementById('convert-btn');
  const downloadLink = document.getElementById('download-link');
  const statusMessage = document.getElementById('status-message');
  
  let file = null;

  // Event listeners for file selection
  uploadBox.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadBox.classList.add('drag-over');
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
  });

  uploadBox.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadBox.classList.remove('drag-over');
    file = event.dataTransfer.files[0];
    handleFileSelection();
  });

  uploadBox.addEventListener('click', (event) => {
    // Prevent the file input from being triggered twice
    if (event.target !== fileInput) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (event) => {
    file = event.target.files[0];
    handleFileSelection();
  });

  // Function to handle file selection
  function handleFileSelection() {
    resetUI();
    statusMessage.textContent = 'Please wait, we are checking your file...';
    checkFile(file).then((isValid) => {
      if (isValid) {
        convertBtn.style.display = 'block';
        statusMessage.textContent = 'File is valid. Click the "Convert" button to proceed.';
      } else {
        statusMessage.textContent = 'File is not valid. Please select a different file.';
      }
    });
  }

  // Function to check if the file extension is supported
  function checkFile(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve(false);
      } else {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const supportedFormats = [
          '3ds', 'obj', 'dwg', 'dxf', 'brep', 'brp', 'bms', 'dae', 'dat', 'svg', 'svgz', 'xlsx',
          'xml', 'xdmf', 'meshyaml', 'meshjson', 'yaml', 'json', 'i1.txt', 'bdf', 'inp', 'med',
          'unv', 'vtk', 'vtu', 'z88', 'frd', 'nc', 'gc', 'ncc', 'ngc', 'cnc', 'tap', 'gcode',
          'emn', 'iges', 'igs', 'bmp', 'jpg', 'png', 'xpm', 'ifc', 'iv', 'off', 'oca', 'csg',
          'ply', 'pov', 'inc', 'py', 'FCMacro', 'FCScript', 'step', 'stp', 'stpz', 'stpl', 'ast'
        ];
        resolve(supportedFormats.includes(fileExtension));
      }
    });
  }

  // Event listener for convert button click
  convertBtn.addEventListener('click', () => {
    if (file) {
      statusMessage.textContent = 'Please wait, we are converting your file...';
      convertFile(file);
    } else {
      statusMessage.textContent = 'No file selected. Please choose a file.';
    }
  });

  // Function to convert the selected file
  function convertFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = `${file.name.split('.')[0]}.stl`;
      downloadLink.textContent = 'Click here to download';
      downloadLink.style.display = 'block';
      statusMessage.textContent = 'Conversion complete. Click the link to download your file.';
    })
    .catch(error => {
      console.error('Error:', error);
      statusMessage.textContent = `Conversion error: ${error.message}`;
    });
  }

  // Function to reset UI
  function resetUI() {
    statusMessage.textContent = '';
    downloadLink.style.display = 'none';
    convertBtn.style.display = 'none';
  }
});