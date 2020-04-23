'use strict';

const express = require('express');
const Jimp = require('jimp');
const jsQR = require('jsqr'); 
const QRCode = require('qrcode');

const app = express();
app.use(express.urlencoded());
const port = 8000;

const rootHandler = (req, res) => {
  res.send(`
  <b>Enter a Youtube url:</b>
  <form method="POST" action="/generate">
    <input type="text" name="url" />
    <input type="submit" />
  </form>`
  );
}

const generateHandler = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.send(`Please enter a youtube url!`);
    return;
  }
  // parse youtube url
  const re = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(re);
  const id = (match && match[1].length==11)? match[1] : undefined;
  if (!id) {
    res.send(`${url} is not a youtube url!`);
    return;
  }
  await QRCode.toFile('qr.png', url, { 
    errorCorrectionLevel: 'low',
    scale: 2,
    color: {
      //light: '#0000' // Transparent background
    },
   }
  );
  //const thumbnailUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  //const thumbnailUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  //const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const qr = await Jimp.read('qr.png');
  let img = await Jimp.read(thumbnailUrl);
  //const out = img.blit(qr, 0, 0); // top left
  const out = img.blit(qr, img.bitmap.width - qr.bitmap.width, img.bitmap.height - qr.bitmap.height); // bottom right
  const contentType = Jimp.MIME_JPEG;
  const outBuf = await out.getBufferAsync(contentType);
  res.setHeader('content-type', contentType);   
  res.send(outBuf);
}

app.get('/', rootHandler);
app.post('/generate', generateHandler);


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

