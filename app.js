const fileInput = document.getElementById('fileinput');

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

const srcImage = new Image;

let imgData = null;

let originalPixels = null;

let currentPixels = null; //this will hold the current values of the pixels

const red = document.getElementById('red')
const green = document.getElementById('green')
const blue = document.getElementById('blue')
const brightness = document.getElementById('brightness')
const grayscale = document.getElementById('grayscale')
const orginal = document.getElementById('original');
const contrast = document.getElementById('contrast')
const R_OFFSET = 0;
const G_OFFSET = 1;  // these offset help to get the current value of the particular color of the pixel
const B_OFFSET = 2;
const button = document.getElementById('button');


fileinput.onchange = function (e) {
    if (e.target.files && e.target.files.item(0)) {
      srcImage.src = URL.createObjectURL(e.target.files[0])
    }
  }
  
  srcImage.onload = function () {
    canvas.width = srcImage.width
    canvas.height = srcImage.height
    ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
    imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
    originalPixels = imgData.data.slice();
    console.log(imgData);
    console.log(originalPixels);
  }

//function to manipulate brightness
const brightnessManipulate = (x,y,value) => {
    addRed(x,y,value);
    addGreen(x,y,value);
    addBlue(x,y,value);
}  

//function to manipulate contrast
const addContrast = (x,y,value) => {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  const alpha = (value + 255) / 255 // Goes from 0 to 2, where 0 to 1 is less contrast and 1 to 2 is more contrast

  const nextRed = alpha * (redValue - 128) + 128
  const nextGreen = alpha * (greenValue - 128) + 128
  const nextBlue = alpha * (blueValue - 128) + 128

  currentPixels[redIndex] = clamp(nextRed)
  currentPixels[greenIndex] = clamp(nextGreen)
  currentPixels[blueIndex] = clamp(nextBlue)
}

//function to make grayscale
const setGrayscale = (x,y) => {
    const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  const mean = (redValue + greenValue + blueValue) / 3

  currentPixels[redIndex] = clamp(mean)
  currentPixels[greenIndex] = clamp(mean)
  currentPixels[blueIndex] = clamp(mean)
}

//functions to manipulate the colors of the pixel
const addBlue = (x,y,value) => {
    const index = getIndex(x,y) + B_OFFSET;
    const currentValue = currentPixels[index]; // this currently has no value
    currentPixels[index] = clamp(currentValue + value);
}

const addRed = (x,y,value) => {
    const index = getIndex(x,y) + R_OFFSET;
    const currentValue = currentPixels[index]; // this currently has no value
    currentPixels[index] = clamp(currentValue + value);
}

const addGreen = (x,y,value) => {
    const index = getIndex(x,y) + G_OFFSET;
    const currentValue = currentPixels[index]; // this currently has no value
    currentPixels[index] = clamp(currentValue + value);
}

//main function to run everything

const runPipeline = () => {
    currentPixels = originalPixels.slice()

  const grayscaleFilter = grayscale.checked
  const brightnessFilter = Number(brightness.value)
  const contrastFilter = Number(contrast.value)
  const redFilter = Number(red.value)
  const greenFilter = Number(green.value)
  const blueFilter = Number(blue.value)

  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      if (grayscaleFilter) {
        setGrayscale(j, i)
      }

      brightnessManipulate(j, i, brightnessFilter)
      addContrast(j, i, contrastFilter)

      if (!grayscaleFilter) {
        addRed(j, i, redFilter)
        addGreen(j, i, greenFilter)
        addBlue(j, i, blueFilter)
      }
    }
  }

  commitChanges()
}
const setOriginal = () => {
    const orginalChecked = original.checked;
    if(orginalChecked){
        currentPixels = originalPixels;
        commitChanges();
        red.value = 0;
        blue.value = 0;
        green.value = 0;
        contrast.value = 0;
        brightness.value = 0;
    }
}

red.onchange = runPipeline
green.onchange = runPipeline
blue.onchange = runPipeline
brightness.onchange = runPipeline
grayscale.onchange = runPipeline
contrast.onchange = runPipeline
original.onchange = setOriginal;
//function to commit the changes made to the canvas


const commitChanges = () => {
    for (let i = 0; i < imgData.data.length; i++) {
        imgData.data[i] = currentPixels[i]
      }
    
      ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
    
}

// function to return the index of the pixel in the 1d array
const getIndex = (x,y) => {
    return (x + (y*srcImage.width)) * 4; // 1pixel is represented by 4 values in the array so that's why 4
                                         // and the values are present in a row wise system in the array that why we are multiplying y with img width                                         
}  


// helper function to keep the value between 0 and 255
const clamp = (value) => {
    return (Math.max(0, Math.min(Math.floor(value), 255)));
}



const  Blur = () => {
    console.log('inside gaussion funtion');
    var data = ctx.getImageData(0,0,canvas.width,canvas.height);
    var px = data.data; // a pointer to the pixels array from the image
    var tmpPx = new Uint8ClampedArray(px.length); // creating a new array to avoid any confusion
    tmpPx.set(px); 
    //console.log(tmpPx);
  
    for (var i = 0; i < px.length; i++) {
       if (i % 4 === 3) {continue;}
  
       px[i] = ( tmpPx[i] 
          + (tmpPx[i - 4] || tmpPx[i])
          + (tmpPx[i + 4] || tmpPx[i]) 
          + (tmpPx[i - 4 * data.width] || tmpPx[i])
          + (tmpPx[i + 4 * data.width] || tmpPx[i]) 
          + (tmpPx[i - 4 * data.width - 4] || tmpPx[i])
          + (tmpPx[i + 4 * data.width + 4] || tmpPx[i])
          + (tmpPx[i + 4 * data.width - 4] || tmpPx[i])
          + (tmpPx[i - 4 * data.width + 4] || tmpPx[i])
          )/9;
    };
    // px was just a refernce to data.data so we dont have to change anything further
    ctx.putImageData(data,0,0);
    delete tmpPx;
}    

button.onclick = Blur;