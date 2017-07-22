var getTime = function() {
    return ( new Date().getTime() ) / 1000.0;
}

onload = function()
{
    const canvas = document.getElementById("canvas");
    canvas.width = 810;
    canvas.height = 540;
    var gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2");

    var aLoc = [];
    var aBlockIndex = [];
    var aUBO = [];

    var mat = new matIV();
    var wMatrix;
    var vpMatrix;

    var vs = gl.createShader(gl.VERTEX_SHADER);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    var v = document.getElementById("vs").textContent;
    var f = document.getElementById("fs").textContent;
    gl.shaderSource(vs, v);
    gl.shaderSource(fs, f);
    gl.compileShader(vs);
    gl.compileShader(fs);
    console.log(gl.getShaderInfoLog(vs));
    console.log(gl.getShaderInfoLog(fs));

    var prg = gl.createProgram();
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    gl.useProgram(prg);

    aLoc[0] = gl.getAttribLocation(prg, "position");
    aLoc[1] = gl.getAttribLocation(prg, "color");
    gl.enableVertexAttribArray(aLoc[0]);
    gl.enableVertexAttribArray(aLoc[1]);
    
    aBlockIndex[0] = gl.getUniformBlockIndex(prg, 'scene');
    aBlockIndex[1] = gl.getUniformBlockIndex(prg, 'object');
    gl.uniformBlockBinding(prg, aBlockIndex[0], 0);
    gl.uniformBlockBinding(prg, aBlockIndex[1], 1);
    aUBO[0] = gl.createBuffer();
    aUBO[1] = gl.createBuffer();
    
    var vMatrix = mat.create();
    var pMatrix = mat.create();
    var vpMatrix = mat.create();
    var from = [0.0, 0.0, 1.0];
    var lookat = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    mat.lookAt(from, lookat, up, vMatrix);
    mat.perspective(60, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
    mat.multiply(pMatrix, vMatrix, vpMatrix);

    gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[0]);
    gl.bufferData(gl.UNIFORM_BUFFER, vpMatrix, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[1]);
    wMatrix  = mat.identity(mat.create());
    gl.bufferData(gl.UNIFORM_BUFFER, wMatrix, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, aUBO[0]);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, aUBO[1]);

    gl.enable(gl.DEPTH_TEST);
    
    var frames = 0;
    
    var angle = 0.0;
    
    var lastTime = getTime();
    
    (function update(){
      requestAnimationFrame(update);
      
      var currentTime = getTime();
      var elapsedTime = currentTime - lastTime;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      angle += 0.1 * elapsedTime * Math.PI / 180;
      if(2.0 * Math.PI < angle) angle -= 2.0 * Math.PI;
      var axis = [0.0, 1.0, 0.0];
      mat.rotate(wMatrix, angle, axis, wMatrix);

      gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[1]);
      gl.bufferData(gl.UNIFORM_BUFFER, wMatrix, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);

      var vertex = new Float32Array([
          0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 1.0,
         -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 1.0,
          0.5, -0.5, 0.0,  0.0, 0.0, 1.0, 1.0,
      ]);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
      var byteStride = 4*(3+4);
      gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, byteStride, 0);
      gl.vertexAttribPointer(aLoc[1], 4, gl.FLOAT, false, byteStride, 4*3);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.flush();

      lastTime = currentTime;
      frames++;
    })();
}
