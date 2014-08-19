

var gl = 0, time = 0, phi = 90,
theta = 0, cache = {}, orderMapping = {},
activeKey, basepath = "data", shaderProgram = null,
layerOffset = {}, numImages = 0,
currentPhi = 0, currentTheta = 0, currentTime = 0, textureList = [],
vertexUnits = 0, fragmentUnits = 0, combinedUnits = 0, imagesProcessed = 0,
uniformIndexArray = [];

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

  vertexUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  fragmentUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  combinedUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

  alert("vertexUnits: " + vertexUnits + "\nfragmentUnits: " + fragmentUnits + "\ncombinedUnits: " + combinedUnits );

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
function init(n) {
  var shaders = [];

  numImages = n;
  //Inialize GL context
  initGL();

  //Initialize the shaders
  shaders.push( initShader( vertexShaderSource(), gl.VERTEX_SHADER) );
  shaders.push( initShader( fragmentShaderSource(), gl.FRAGMENT_SHADER) );
  shaderProgram = createShaderProgram( shaders );

  for (i = 0; i < fragmentUnits; ++i)
  {
    uniformIndexArray[i] = i;
  }
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

  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);

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
  var u_image = gl.getUniformLocation(shaderProgram, "u_image[0]");

  // set which texture units to render with.
  gl.uniform1iv(u_image, uniformIndexArray );  // texture unit 0




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

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  var d1 = performance.now();
  var msg = "Draw took " + (d1 - d0);
  console.log(msg)
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
    'uniform sampler2D u_image[',fragmentUnits,
    '];',

    // the texCoords passed in from the vertex shader.
    'varying vec2 v_texCoord;',
    'void main() {',
    'vec4 color;',
    'for(int i = 0; i < ', fragmentUnits, '; ++i ) {',
    'color += texture2D(u_image[i], v_texCoord).rgba*0.0625;',
    '}',
    'gl_FragColor = color;',


    '}' ].join('\n');

  return shaderSource;
};

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
 // console.debug("time: " + time + " phi: " + phi + " theta: " + theta);

  if (theta != 90 ) {
    theta = theta + ".0";
  }
  phi = phi + ".0";


  activeKey = pathPattern.replace('{time}', time).replace('{phi}', phi).replace('{theta}', theta);
  if(!cache.hasOwnProperty(activeKey))
  {
    // Trigger download
    cache[activeKey] = {};
    for ( i = 0; i < numImages; ++i )
    {
      imageName = "rgb" + i + ".jpg";
      downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', imageName), i);
    }
    //    downloadComposite(activeKey, basepath + '/' + activeKey.replace('{filename}', 'depthMap.dat'));
    return false;
  }
  else
  {
    return draw();
  }
}


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
