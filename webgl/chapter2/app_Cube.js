var VSHADER_SOURCE=`
attribute vec4 a_point;
uniform mat4 u_ModelViewMatrix;
attribute vec4 a_Color;
varying vec4 v_Color;
void main(){
    gl_Position = u_ModelViewMatrix * a_point;
    v_Color = a_Color;
    gl_PointSize = 10.0;
}
`;
var FSHADER_SOURCE=`
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor=v_Color;
}
`;

var img_loaded = 0;
function main(){
    var canvas = document.getElementById("canvas");
    if(!canvas){
        console.log("failed to retrieve the <canvas> element");
        return false;
    }

    gl = getWebGLContext(canvas);
    if(!gl){
        console.log("failed to get the rendering context for webgl");
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("failed to initialize shaders");
        return;
    }

    var n = initVertexBuffer(gl);

    var u_ModelViewMatrix = gl.getUniformLocation(gl.program, "u_ModelViewMatrix");
    if(!u_ModelViewMatrix){
        console.log("failed to get the storage location of u_ModelViewMatrix");
        return;
    }

    gl.clearColor(0.0, 0.0,0.0, 1.0);
    var matrix = new Matrix4();

    // var u_width = gl.getUniformLocation(gl.program, "u_width");
    // gl.uniform1f(u_width, gl.drawingBufferWidth);

    // var u_height = gl.getUniformLocation(gl.program, "u_height");
    // gl.uniform1f(u_height, gl.drawingBufferHeight);

    // if(!initTextures(gl, n)){
    //     return;
    // }

    gl.enable(gl.DEPTH_TEST); 
    // gl.enable(gl.POLYGON_OFFSET_FILL);
    // gl.polygonOffset(1.0, 1.0);

    var rotate = 0;
    var tick = function(){
        // if(img_loaded >= 2){
        rotate = draw(gl, u_ModelViewMatrix, matrix, rotate, n);

        // }
        window.requestAnimationFrame(tick);
    };
    tick();

    window.onkeydown = function(ev){onKeyPressed(ev)};
    this.updateNearFar();
}

var near = 0, far = 0.5;
function onKeyPressed(ev){
    switch(ev.keyCode){
        case 37: near += 0.01; break;
        case 39: near -= 0.01; break;
        case 38: far += 0.01; break;
        case 40: far -= 0.01; break;
    }
    this.updateNearFar();
}

function updateNearFar(){
    var nf = document.getElementById("nearFar");
    nf.innerHTML = "near: " + near + ", far: " + far;
}

function draw(gl, u_matrix, matrix, rotate, n){
    rotate += 1;
    rotate %= 360;
    var rad = Math.PI * rotate / 180;
    // matrix.setIdentity();
    matrix.setPerspective(30, canvas.width/ canvas.height, 1, 100);
    matrix.lookAt(5 * Math.cos(rad), 5, 5 * Math.sin(rad), 0, 0, 0, 0, 1, 0);
    // matrix.lookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);

    gl.uniformMatrix4fv(u_matrix, false, matrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    // gl.drawElements(gl.POINTS, n, gl.UNSIGNED_BYTE, 0);
    return rotate;
}

function initVertexBuffer(gl){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create buffer object");
        return -1;
    }
    var points = new Float32Array([
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,

        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,

        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1,
        -1.0, 1.0, -1.0,

        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0
    ]);

    var colors = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
    ]);
    
    initArraryBuffer(gl, points, 3, gl.FLOAT, "a_point");
    initArraryBuffer(gl, colors, 3, gl.FLOAT, "a_Color");

    var n = 4;
    var indeices = new Uint8Array([
        0, 1, 2, 0, 2, 3, 
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indeices, gl.STATIC_DRAW);

    return indeices.length;
}

function initArraryBuffer(gl, data, size, type, name){
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var position = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(position, size, type, false, 0, 0);
    gl.enableVertexAttribArray(position);
}

function initTextures(gl, n){
    var texture = gl.createTexture();
    if(!texture){
        console.log("failed to create texture");
        return false;
    }
    var u_sampler = gl.getUniformLocation(gl.program, "u_sampler");
    if(!u_sampler){
        console.log("failed to get the storage of u_sampler");
        return false;
    }

    var u_sampler_1 = gl.getUniformLocation(gl.program, "u_sampler_1");

    var image = new Image();
    image.onload = function(){
        loadTexture(gl, n, u_sampler, texture, image);
    };
    image.src = "../resources/sky.jpg";
    var image1 = new Image();
    image1.onload = function(){
        loadTexture(gl, n, u_sampler_1, texture, image1);
    };
    image1.src = "../resources/circle.gif";

    // image.crossOrigin = "anonymous";
    // image.src = "http://rodger.global-linguist.com/webgl/resources/sky.jpg";
    return true;
}

function loadTexture(gl, n, u_sampler, texture, image){
    var textId, unit;
    unit = img_loaded;
    if(img_loaded === 0){
        textId = gl.TEXTURE0;
    } else {
        textId = gl.TEXTURE1;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(textId);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_sampler, unit);

    img_loaded ++;
}
