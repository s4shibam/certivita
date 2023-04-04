// Import CSS File
import './style.css';

// Import required files
import certificateTemplate from './public/Certificate_Template.pdf';
import specimenCertificate from './public/Specimen_Certificate.png';

// Import required libraries
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import swal from 'sweetalert';
import saveAs from './FileSaver.js';

//All variable declaration

let genre = null,
  recipient = null,
  reason = null,
  date = null,
  displayDate = null,
  sign = null,
  logoButton = null,
  generateButton = null,
  loadingAnimation = null,
  downloadButton = null,
  existingPdfBytes = null,
  pdfDoc = null,
  pdfPage = null,
  pdfBytes = null,
  pdfFile = null,
  certificatePreview = null,
  certificateName = null;

let PFDFont = null,
  PSBFont = null,
  PLFont = null,
  ABRFont = null;

let modifiedPdfDoc = null,
  firstPage = null,
  viewport = null,
  hiddenCanvas = null,
  renderContext = null;

// Form validation using Sweet Alert
function formValidation() {
  if (genre.value.length < 5 || genre.value.length > 30) {
    swal(
      "Invalid 'Genre' Input!",
      'Length: ' + genre.value.length + ', not accepted! Range: 5-30 Letters',
      'error'
    );
    return false;
  }

  if (recipient.value.length < 5 || recipient.value.length > 25) {
    swal(
      "Invalid 'Recipient' Input!",
      'Length: ' +
        recipient.value.length +
        ', not accepted! Range: 5-25 Letters',
      'error'
    );
    return false;
  }

  if (reason.value.length < 5 || reason.value.length > 150) {
    swal(
      "Invalid 'Reason' Input!",
      'Length: ' + reason.value.length + ', not accepted! Range: 5-150 Letters',
      'error'
    );
    return false;
  }

  if (
    date.value.length !== 8 ||
    date.value <= 0 ||
    date.value.substring(0, 2) < 1 ||
    date.value.substring(0, 2) > 31 ||
    date.value.substring(2, 4) < 1 ||
    date.value.substring(2, 4) > 12 ||
    date.value.substring(4, 8) < 1
  ) {
    swal("Invalid 'Date' Input!", 'Follow the given format!', 'error');
    return false;
  }

  if (sign.value.length < 5 || sign.value.length > 30) {
    swal(
      "Invalid 'Signature' Input!",
      'Length: ' + sign.value.length + ', not accepted! Range: 5-20 Letters',
      'error'
    );
    return false;
  }

  return true;
}

// Draw the text on the page - Certificate Modification
function modifyCertificate(text, xVal, yVal, fontSize, fontName) {
  pdfPage.drawText(text, {
    x: xVal,
    y: yVal,
    size: fontSize,
    font: fontName
  });
}

// Converts certificate from .pdf format to .png format for preview image
async function getPreview(pdf_url) {
  // Get handle of pdf document
  try {
    modifiedPdfDoc = await pdfjsLib.getDocument({ url: pdf_url }).promise;
  } catch (error) {
    alert(error.message);
  }

  // Get the first page of the pdf
  try {
    firstPage = await modifiedPdfDoc.getPage(1);
  } catch (error) {
    alert(error.message);
  }

  // Get viewport to render the page at required scale
  viewport = firstPage.getViewport({ scale: 1 });

  // Set canvas height same as viewport height
  hiddenCanvas.height = viewport.height;
  hiddenCanvas.width = viewport.width;

  // Set the render context
  renderContext = {
    canvasContext: hiddenCanvas.getContext('2d'),
    viewport: viewport
  };

  // Render the page contents in the canvas
  try {
    await firstPage.render(renderContext).promise;
  } catch (error) {
    alert(error.message);
  }

  // Remove loading animation
  loadingAnimation.classList.add('hidden');
  loadingAnimation.classList.remove('flex');

  // Generate an url from canvas and assign that to the certificatePreview (img tag)
  certificatePreview.src = await hiddenCanvas.toDataURL();
}

// Generate Certificate
async function generateCertificate() {
  // Check data accuracy, validity to generate Certificate
  if (!formValidation()) {
    console.log('Form Validation Failed!');

    // Disable download Button
    downloadButton.disabled = true;
    downloadButton.classList.add('cursor-not-allowed');

    // Show default preview certificate
    certificatePreview.src = specimenCertificate;

    return;
  }

  // On success ...
  // Show loading animation
  loadingAnimation.classList.remove('hidden');
  loadingAnimation.classList.add('flex');

  // Get the available PDFDocument and convert it into arrayBuffer
  existingPdfBytes = await fetch(certificateTemplate).then((res) =>
    res.arrayBuffer()
  );

  // Load a PDFDocument from the existing PDF bytes
  pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Register the `fontkit` instance
  pdfDoc.registerFontkit(fontkit);

  // Fetch custom fonts
  PFDFont = await pdfDoc.embedFont(
    await fetch('/fonts/PlayfairDisplay-Bold.ttf').then((res) =>
      res.arrayBuffer()
    )
  );

  PSBFont = await pdfDoc.embedFont(
    await fetch('/fonts/Poppins-SemiBold.ttf').then((res) => res.arrayBuffer())
  );

  PLFont = await pdfDoc.embedFont(
    await fetch('/fonts/Poppins-Light.ttf').then((res) => res.arrayBuffer())
  );

  ABRFont = await pdfDoc.embedFont(
    await fetch('/fonts/AlexBrush-Regular.ttf').then((res) => res.arrayBuffer())
  );

  // Get the first page of the document
  pdfPage = pdfDoc.getPages()[0];

  // Date formatting
  displayDate =
    date.value.substring(0, 2) +
    ' / ' +
    date.value.substring(2, 4) +
    ' / ' +
    date.value.substring(4, 8);

  // Modification Section
  modifyCertificate(genre.value, 75, 425, 45, PFDFont);
  modifyCertificate(recipient.value, 76, 260, 35, PSBFont);
  modifyCertificate(reason.value, 78, 228, 14, PLFont);
  modifyCertificate(displayDate, 539, 110, 15, PLFont);
  modifyCertificate(sign.value, 160, 110, 35, ABRFont);

  // Uint8Array formation from modified pdf
  pdfBytes = await pdfDoc.save();
  console.log('Your Certificate has been created successfully!');

  certificateName = recipient.value + "'s Certificate.pdf";
  // Create a new File object instance.
  pdfFile = new File([pdfBytes], certificateName, {
    type: 'application/pdf;charset=utf-8'
  });

  // Preview certificate
  getPreview(URL.createObjectURL(pdfFile));

  // Enable download Button
  downloadButton.disabled = false;
  downloadButton.classList.remove('cursor-not-allowed');
}

// Download certificate (PDF Format)
function downloadCertificate() {
  saveAs(pdfFile);
}

// Home button
function backToHome() {
  window.location.reload();
}

// Program starts here - After page is fully loaded
window.addEventListener('load', () => {
  logoButton = document.getElementById('logo');
  generateButton = document.getElementById('generate');
  genre = document.getElementById('genre');
  recipient = document.getElementById('recipient');
  reason = document.getElementById('reason');
  date = document.getElementById('date');
  sign = document.getElementById('sign');
  loadingAnimation = document.getElementById('loading-animation');
  hiddenCanvas = document.getElementById('hiddenCanvas');
  certificatePreview = document.getElementById('preview');
  downloadButton = document.getElementById('download');

  if (generateButton) {
    generateButton.addEventListener('click', generateCertificate);
  }

  if (downloadButton) {
    downloadButton.addEventListener('click', downloadCertificate);
  }

  // Takes to home page
  if (logoButton) {
    logoButton.addEventListener('click', backToHome);
  }
});

// Developed with love by Shibam Saha
