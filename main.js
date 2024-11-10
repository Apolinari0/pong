let scorePlayer1 = 0;
let scorePlayer2 = 0;
let player1Name = '';
let player2Name = '';
let winMessage = '';
let start;

function updateName() {
    document.getElementById("player1").innerText = player1Name + " - " + String(scorePlayer1);
    document.getElementById("player2").innerText = player2Name + " - " + String(scorePlayer2);
}


function startGame() {

    if (start) //tava dando bug aqui tbm, entao essa start é para cancelar o request anterior... pois tava gerando instancia em cima de instancia e a pontuação tava buganod
        cancelAnimationFrame(start);

    tx = 0;
    ty = 0;
    tx_step = 0.01;
    ty_step = 0.02;

    // Reinicia ponto pq ta dando bug
    scorePlayer1 = 0;
    scorePlayer2 = 0;


    winMessage = '';
    document.getElementById("win").innerText = winMessage;

    player1Name = document.getElementById('player1-name').value || 'Player 1';
    player2Name = document.getElementById('player2-name').value || 'Player 2';

    updateName();

    main();
}


function LoseWin() {
    if (scorePlayer1 === 10) {
        winMessage = ''
        winMessage = player1Name + " VENCEU !!"
        document.getElementById("win").innerText = winMessage;
        console.log(document.getElementById("win").value)
    }
    else if (scorePlayer2 === 10) {
        winMessage = ''
        winMessage = player2Name + " VENCEU !!"
        document.getElementById("win").innerText = winMessage;
        console.log(document.getElementById("win").value)
    }
}


function main() {


    scorePlayer1 = 0;
    scorePlayer2 = 0;
    updateName();

    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    const vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    const fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, `position`);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);
    const colorUniformLocation = gl.getUniformLocation(program, `color`);

    const matrixB = mat4.create();
    mat4.scale(matrixB, matrixB, [0.25, 0.25, 1.0]);

    let positionVectorL = [
        -0.9, -0.35,  // inferior esquerdo
        -0.9, 0.35,  // superior esquerdo
        -0.87, -0.35, // inferior direito
        -0.9, 0.35,  // superior esquerdo
        -0.87, -0.35, // inferior direito
        -0.87, 0.35   // superior direito
    ];

    let positionVectorR = [
        0.9, -0.35,  // inferior esquerdo
        0.9, 0.35,  // superior esquerdo
        0.87, -0.35, // inferior direito
        0.9, 0.35,  // superior esquerdo
        0.87, -0.35, // inferior direito
        0.87, 0.35   // superior direito
    ];



    let positionVectorB = setCircleVertices(30, 0.02, 0, 0)

    let beta = 0.0; // posição inicial da barra esquerda
    let theta = 0.0; // posição inicial da barra direita

    // Função para desenhar uma barra
    function drawBar(positionVector, translation) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
        gl.uniformMatrix4fv(matrixUniformLocation, false, translation);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    let gama = 0.0;
    let tx = 0.0;
    let ty = 0.0;
    let tx_step = 0.01;
    let ty_step = 0.02;

    function drawSquare(positionVector, matrix) {

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 3 * 30);

    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Matriz de transformação da barra esquerda
        const matrixL = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, beta, 0, 1
        ];

        // Matriz de transformação da barra direita
        const matrixR = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, theta, 0, 1
        ];

        gama += 20.0;
        tx += tx_step;
        ty += ty_step;

        if (ty > 1.0 || ty < -1.0) {
            ty_step = -ty_step;
        }

        // Verificar colisão com a barra esquerda
        if (tx <= -0.87 && tx >= -0.9 && ty > beta - 0.35 && ty < beta + 0.35) {
            tx_step = -tx_step;
            ty_step += (ty - beta) * 0.05;
        }

        //mesma coisa mas na direita
        if (tx >= 0.87 && tx <= 0.9 && ty > theta - 0.35 && ty < theta + 0.35) {
            tx_step = -tx_step;
            ty_step += (ty - theta) * 0.05;
        }

        if (tx > 1.0) {
            scorePlayer1++;
            updateName();
            LoseWin();
            resetBall(1);
        }
        if (tx < -1.0) {
            scorePlayer2++;
            updateName();
            LoseWin();
            resetBall(2);
        }

        // Configura a transformação da bola
        mat4.identity(matrixB);
        mat4.translate(matrixB, matrixB, [tx, ty, 0.0]);

        // Desenha a bola
        gl.uniform3fv(colorUniformLocation, [0.0, 0.0, 0.0]);
        drawSquare(positionVectorB, matrixB);

        // Desenhar a barra esquerda
        drawBar(positionVectorL, matrixL);

        // Desenhar a barra direita
        drawBar(positionVectorR, matrixR);

        if (scorePlayer1 < 10 && scorePlayer2 < 10)
            start = requestAnimationFrame(render); // Atualiza a cada frame
    }


    function resetBall(x) {
        tx = 0;  
        ty = 0;  
    
        // Se o Player 1 fez o gol , a bola vai para o Player 2
        if (x === 1) { 
            tx_step = 0.01; 
            ty_step = Math.random() * 0.04 - 0.02; 
        } 
        else {  
            tx_step = -0.01; 
            ty_step = Math.random() * 0.04 - 0.02; 
        }
    }

    // Configurações de evento para mover as barras
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowUp":
                //theta += 0.1;
                if (theta < 0.65) {
                    theta += 0.1;
                }
                break;
            case "ArrowDown":
                //theta -= 0.1;
                if (theta > -0.65) {
                    theta -= 0.1;
                }
                break;
            case "w":
            case "W":
                if (beta < 0.65) {
                    beta += 0.1;
                }
                break;
            case "s":
            case "S":
                if (beta > -0.65) {
                    beta -= 0.1;
                }
                break;
        }
    });

    render();
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function setCircleVertices(n, radius, centerX, centerY) {
    const vertexData = [];
    for (let i = 0; i < n; i++) {
        vertexData.push(centerX, centerY);
        vertexData.push(
            centerX + radius * Math.cos(i * (2 * Math.PI) / n),
            centerY + radius * Math.sin(i * (2 * Math.PI) / n)
        );
        vertexData.push(
            centerX + radius * Math.cos((i + 1) * (2 * Math.PI) / n),
            centerY + radius * Math.sin((i + 1) * (2 * Math.PI) / n)
        );
    }

    return vertexData
}

document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.getElementById("gameDialog");
    dialog.showModal();
});


function openDialog() {
    const dialog = document.getElementById("gameDialog");
    dialog.showModal();
}


function closeDialog() {
    const dialog = document.getElementById("gameDialog");
    dialog.close();
}


