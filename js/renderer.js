const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const fileName = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
  const file = e.target.files[0];
  const isValidFileType = isFileImage(file);
  if (!isValidFileType) {
    alertError('Please enter a valid image file');
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height+1;
  };

  form.style.display = 'block';
  fileName.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]) {
    alertError('Please upload an image');
    return;
  }

  if(width == ''|| height == '') {
    alertError('Please enter  a width and height');
    return;
  }

  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  });
}

ipcRenderer.on('image:done', () => {
  alertSuccess('Image file was successfully resized');
});

function isFileImage(file) {
  const acceptedImageTypes = ['image/png', 'image/gif', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);