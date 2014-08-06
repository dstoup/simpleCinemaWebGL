

var gl = 0, time = 0, phi = 90,
theta = 0, cache = {}, orderMapping = {},
activeKey, basepath = "data", shaderProgram = null,
layerOffset = {}, nbImages = 22,
currentPhi = 0, currentTheta = 0, currentTime = 0, textureList = [], imagesProcessed = 0;

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function initGL() {
  // Get A WebGL context
  var glcanvas = document.getElementById("glcanvas");
  gl = glcanvas.getContext("experimental-webgl") || glcanvas.getContext("webgl");
  if (!gl) {
    return null;
  }
  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);
  // Clear the color as well as the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, 500, 500);

};

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function initShader( src, type ) {
  var shader = gl.createShader( type );

  gl.shaderSource( shader, src );

  // Compile and check status
  gl.compileShader( shader );
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled)
  {
    // Something went wrong during compilation; get the error
    var lastError = gl.getShaderInfoLog(shader);
    console.error( "Error compiling shader '" + shader + "':" + lastError );
    gl.deleteShader( shader );

    return null;
  }

  return shader;
};

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function createShaderProgram( shaders ) {
  var program = gl.createProgram();

  for( i = 0; i < shaders.length; ++i ) {
    gl.attachShader( program, shaders[ i ] );
  }

  gl.linkProgram( program );

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog (program);
    console.error("Error in program linking:" + lastError);
    gl.deleteProgram(program);

    return null;
  }

  gl.useProgram(program);

  return program;
};



// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function init(image) {
  var shaders = [];

  //Inialize GL context
  initGL();

  //Initialize the shaders
  shaders.push( initShader( vertexShaderSource(), gl.VERTEX_SHADER) );
  shaders.push( initShader( fragmentShaderSource(), gl.FRAGMENT_SHADER) );
  shaderProgram = createShaderProgram( shaders );

}

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function createTexture(gl, image, index)
{
  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  gl.RGBA, gl.UNSIGNED_BYTE, image);

  textureList[index] = texture;
}


// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function draw() {
  var d0 = performance.now();
  var composite = cache[activeKey]['composite'];

  var singleImageSize = [500,500];
  var fullImageSize = [500,11000];

  var pixelBuffer, frontBuffer = null, frontPixels = null, pixelIdx = 0, localIdx;

  // lookup the sampler locations.
//  var u_textureLocation = gl.getUniformLocation(shaderProgram, "u_textures[0]");
  var ul0 = performance.now();
  var u_image0Location = gl.getUniformLocation(shaderProgram, "u_image0");
  var u_image1Location = gl.getUniformLocation(shaderProgram, "u_image1");
  var u_image2Location = gl.getUniformLocation(shaderProgram, "u_image2");
  var u_image3Location = gl.getUniformLocation(shaderProgram, "u_image3");

  var u_image4Location = gl.getUniformLocation(shaderProgram, "u_image4");
  var u_image5Location = gl.getUniformLocation(shaderProgram, "u_image5");
  var u_image6Location = gl.getUniformLocation(shaderProgram, "u_image6");
  var u_image7Location = gl.getUniformLocation(shaderProgram, "u_image7");

  var u_image8Location = gl.getUniformLocation(shaderProgram, "u_image8");
  var u_image9Location = gl.getUniformLocation(shaderProgram, "u_image9");
  var u_image10Location = gl.getUniformLocation(shaderProgram, "u_image10");
  var u_image11Location = gl.getUniformLocation(shaderProgram, "u_image11");

  var u_image12Location = gl.getUniformLocation(shaderProgram, "u_image12");
  var u_image13Location = gl.getUniformLocation(shaderProgram, "u_image13");
  var u_image14Location = gl.getUniformLocation(shaderProgram, "u_image14");
  var u_image15Location = gl.getUniformLocation(shaderProgram, "u_image15");

  var ul1 = performance.now();
  var ulTime = ul1 - ul0;
//  var u_image16Location = gl.getUniformLocation(shaderProgram, "u_image16");
//  var u_image17Location = gl.getUniformLocation(shaderProgram, "u_image17");
//  var u_image18Location = gl.getUniformLocation(shaderProgram, "u_image18");
//  var u_image19Location = gl.getUniformLocation(shaderProgram, "u_image19");

//  var u_image20Location = gl.getUniformLocation(shaderProgram, "u_image20");
//  var u_image21Location = gl.getUniformLocation(shaderProgram, "u_image21");

  // set which texture units to render with.
//  gl.uniform1i(u_textureLocation, [0, 1, 2, 3] );  // texture unit 0

  var st0 = performance.now();
  gl.uniform1i(u_image0Location, 0);  // texture unit 0
  gl.uniform1i(u_image1Location, 1);  // texture unit 1
  gl.uniform1i(u_image2Location, 2);  // texture unit 2
  gl.uniform1i(u_image3Location, 3);  // texture unit 3

  gl.uniform1i(u_image4Location, 4);  // texture unit 4
  gl.uniform1i(u_image1Location, 5);  // texture unit 5
  gl.uniform1i(u_image2Location, 6);  // texture unit 6
  gl.uniform1i(u_image3Location, 7);  // texture unit 7

  gl.uniform1i(u_image4Location, 8);  // texture unit 8
  gl.uniform1i(u_image1Location, 9);  // texture unit 9
  gl.uniform1i(u_image2Location, 10);  // texture unit 10
  gl.uniform1i(u_image3Location, 11);  // texture unit 11

  gl.uniform1i(u_image4Location, 12);  // texture unit 12
  gl.uniform1i(u_image1Location, 13);  // texture unit 13
  gl.uniform1i(u_image2Location, 14);  // texture unit 14
  gl.uniform1i(u_image3Location, 15);  // texture unit 15

//  gl.uniform1i(u_image4Location, 16);  // texture unit 16
//  gl.uniform1i(u_image2Location, 17);  // texture unit 17
//  gl.uniform1i(u_image3Location, 18);  // texture unit 18
//  gl.uniform1i(u_image4Location, 19);  // texture unit 19

 // gl.uniform1i(u_image3Location, 20);  // texture unit 20
//  gl.uniform1i(u_image4Location, 21);  // texture unit 21

  // Set each texture unit to use a particular texture.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureList[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureList[1]);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, textureList[2]);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, textureList[3]);

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, textureList[4]);
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, textureList[5]);
  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_2D, textureList[6]);
  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, textureList[7]);

  gl.activeTexture(gl.TEXTURE8);
  gl.bindTexture(gl.TEXTURE_2D, textureList[8]);
  gl.activeTexture(gl.TEXTURE9);
  gl.bindTexture(gl.TEXTURE_2D, textureList[9]);
  gl.activeTexture(gl.TEXTURE10);
  gl.bindTexture(gl.TEXTURE_2D, textureList[10]);
  gl.activeTexture(gl.TEXTURE11);
  gl.bindTexture(gl.TEXTURE_2D, textureList[11]);

  gl.activeTexture(gl.TEXTURE12);
  gl.bindTexture(gl.TEXTURE_2D, textureList[12]);
  gl.activeTexture(gl.TEXTURE13);
  gl.bindTexture(gl.TEXTURE_2D, textureList[13]);
  gl.activeTexture(gl.TEXTURE14);
  gl.bindTexture(gl.TEXTURE_2D, textureList[14]);
  gl.activeTexture(gl.TEXTURE15);
  gl.bindTexture(gl.TEXTURE_2D, textureList[15]);

  var st1 = performance.now();
  var stTime = st1 - st0;

//  gl.activeTexture(gl.TEXTURE16);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[16]);
//  gl.activeTexture(gl.TEXTURE17);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[17]);
//  gl.activeTexture(gl.TEXTURE18);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[18]);
//  gl.activeTexture(gl.TEXTURE19);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[19]);

// gl.activeTexture(gl.TEXTURE20);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[20]);
//  gl.activeTexture(gl.TEXTURE21);
//  gl.bindTexture(gl.TEXTURE_2D, textureList[21]);




//  frontPixels = new Uint8ClampedArray(singleImageSize[0] * singleImageSize[1] * 4);

//  var count = composite.length;
//  var fullPixelOffset = singleImageSize[0] * singleImageSize[1] * 4;

/*

  for(var i = 0; i < count; ++i)
  {
    var offset = composite[i];

    if(offset > -1) {
      localIdx = 4 * pixelIdx;
      offset *= fullPixelOffset;
      offset += localIdx;

      listOffset = Math.floor(offset/(quarterFullY*w*4));
      localOffset = offset%(quarterFullY*w*4);
      pixelBuffer = textureList[listOffset];
      frontPixels[ localIdx     ] = pixelBuffer[ localOffset     ];
      frontPixels[ localIdx + 1 ] = pixelBuffer[ localOffset + 1 ];
      frontPixels[ localIdx + 2 ] = pixelBuffer[ localOffset + 2 ];
      frontPixels[ localIdx + 3 ] = 255;

      //          console.debug("p: "+pixelIdx+" r: "+frontPixels[localIdx]+" g:"+frontPixels[localIdx+1]+" b: "+frontPixels[localIdx+2]+" localIdx: "+localIdx+" offset: "+offset+" listOffset: "+listOffset+" localOffset: "+localOffset);
    }
    // Move forward
    ++pixelIdx;
  }
*/

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
  var texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");

  // provide texture coordinates for the rectangle.
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
//  var indexScalar = gl.getUniformLocation(shaderProgram, "u_indexScalar");
//  var pixelOffset = gl.getUniformLocation(shaderProgram, "u_pixelOffset");

  // set the resolution
  gl.uniform2f(resolutionLocation, glcanvas.width, glcanvas.height);
//  gl.uniform1f(indexScalar, quarterFullY*w*4);
//  gl.uniform1f(pixelOffset, fullPixelOffset);

  // Create a buffer for the position of the rectangle corners.
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, 500, 500);

  var dt0 = performance.now();
  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  var dt1 = performance.now();
  var dtTime = dt1 - dt0;

  var d1 = performance.now();

//  var d1 = performance.now();
  var msg = "Draw took " + (d1 - d0);
//  msg += "\nExtract pixels and create textures took " + ctTime;
//  msg += "\nSet uniform locs took " + ulTime;
//  msg += "\nBind textBuffers " + stTime;
//  msg += "\nrender took " + dtTime;

//  alert(msg)
};


// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2]), gl.STATIC_DRAW);
};

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function vertexShaderSource() {
  var shaderSource = [

    'attribute vec2 a_position;',
    'attribute vec2 a_texCoord;',
    'uniform vec2 u_resolution;',
    'varying vec2 v_texCoord;',
    'void main() {',
    // convert the rectangle from pixels to 0.0 to 1.0
    'vec2 zeroToOne = a_position / u_resolution;',
    // convert from 0->1 to 0->2
    'vec2 zeroToTwo = zeroToOne * 2.0;',
    // convert from 0->2 to -1->+1 (clipspace)
    'vec2 clipSpace = zeroToTwo - 1.0;',
    'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    'v_texCoord = a_texCoord;',
    '}' ].join('\n');

  return shaderSource;
};

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function fragmentShaderSource() {
  var shaderSource = [

    'precision mediump float;',
    // our texture
//    'uniform float u_indexScalar;',
//    'uniform float u_pixelOffset;',
//    'uniform sampler2D u_textures[4];',
    'uniform sampler2D u_image0;',
    'uniform sampler2D u_image1;',
    'uniform sampler2D u_image2;',
    'uniform sampler2D u_image3;',

    'uniform sampler2D u_image4;',
    'uniform sampler2D u_image5;',
    'uniform sampler2D u_image6;',
    'uniform sampler2D u_image7;',

    'uniform sampler2D u_image8;',
    'uniform sampler2D u_image9;',
    'uniform sampler2D u_image10;',
    'uniform sampler2D u_image11;',

    'uniform sampler2D u_image12;',
    'uniform sampler2D u_image13;',
    'uniform sampler2D u_image14;',
    'uniform sampler2D u_image15;',

//    'uniform sampler2D u_image16;',
    //'uniform sampler2D u_image17;',
  //  'uniform sampler2D u_image18;',
 //   'uniform sampler2D u_image19;',

 //   'uniform sampler2D u_image20;',
 //   'uniform sampler2D u_image21;',

    // the texCoords passed in from the vertex shader.
    'varying vec2 v_texCoord;',
    'void main() {',
    'gl_FragColor = texture2D(u_image0, v_texCoord)*0.0625 +',
                    'texture2D(u_image1, v_texCoord)*0.0625 +',
                    'texture2D(u_image2, v_texCoord)*0.0625 +',
                    'texture2D(u_image3, v_texCoord)*0.0625 +',
                    'texture2D(u_image4, v_texCoord)*0.0625 +',
                    'texture2D(u_image5, v_texCoord)*0.0625 +',
                    'texture2D(u_image6, v_texCoord)*0.0625 +',
                    'texture2D(u_image7, v_texCoord)*0.0625 +',
                    'texture2D(u_image8, v_texCoord)*0.0625 +',
                    'texture2D(u_image9, v_texCoord)*0.0625 +',
                    'texture2D(u_image10, v_texCoord)*0.0625 +',
                    'texture2D(u_image11, v_texCoord)*0.0625 +',
                    'texture2D(u_image12, v_texCoord)*0.0625 +',
                    'texture2D(u_image13, v_texCoord)*0.0625 +',
                    'texture2D(u_image14, v_texCoord)*0.0625 +',
                    'texture2D(u_image15, v_texCoord)*0.0625;',
    '}' ].join('\n');

  return shaderSource;
};


// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function downloadImage(key, url, index) {
  var img = new Image();

  function onLoad() {
 //   cache[key]['image'] = img;
 //   if(cache[key].hasOwnProperty('composite')) {
    createTexture(gl, img, index);
    imagesProcessed++;
    if (imagesProcessed == 22)
    {
      draw();
    }
 //   }
  }

  function onError() {
    console.error('Error loading image ' + url + ' for key ' + key);
  }

  img.onload = onLoad;
  img.onerror = onError;
  img.src = url;
  if (img.complete) {
    onLoad();
  }
}


// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function updateFields(time, phi, theta) {
  var pathPattern = "{time}/{theta}/{phi}/{filename}";

  updateImage = false;
  if (phi != currentPhi) {
    currentPhi = phi;
    updateImage = true;
  }

  if (theta !=currentTheta ) {
    currentTheta = theta;
    updateImage = true;
  }

  if ( time != currentTime ) {
    currentTime = time;
  }

  if ( !updateImage ) {
    return true;
  }

  imagesProcessed = 0;
  console.debug("time: " + time + " phi: " + phi + " theta: " + theta);

  if (theta != 90 ) {
    theta = theta + ".0";
  }
  phi = phi + ".0";


  activeKey = pathPattern.replace('{time}', time).replace('{phi}', phi).replace('{theta}', theta);
  if(!cache.hasOwnProperty(activeKey)) {
    // Trigger download
    cache[activeKey] = {};
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb0.jpg'), 0);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb1.jpg'), 1);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb2.jpg'), 2);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb3.jpg'), 3);

    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb4.jpg'), 4);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb5.jpg'), 5);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb6.jpg'), 6);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb7.jpg'), 7);

    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb8.jpg'), 8);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb9.jpg'), 9);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb10.jpg'), 10);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb11.jpg'), 11);

    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb12.jpg'), 12);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb13.jpg'), 13);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb14.jpg'), 14);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb15.jpg'), 15);

    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb16.jpg'), 16);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb17.jpg'), 17);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb18.jpg'), 18);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb19.jpg'), 19);

    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb20.jpg'), 20);
    downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb21.jpg'), 21);

//    downloadComposite(activeKey, basepath + '/' + activeKey.replace('{filename}', 'depthMap.dat'));
    return false;
  }
  else {
    return draw();
  }
}

// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
function downloadComposite(key, url) {
  $.getJSON(url,  {
    format: "json"
  })
    .done(function(data) {
      var composite = data["pixel-order"].split(' ');
      cache[key]['composite'] = composite;
      if(cache[key].hasOwnProperty('image')) {
        draw();
      }
    });
}
