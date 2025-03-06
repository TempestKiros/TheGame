// Escena de introducción (estilo Undertale)
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('introBG', 'assets/intro.jpg');
  }

  create() {
    // Fondo
    this.add.image(400, 300, 'introBG');

    // Texto introductorio con wordWrap para que no se corte
    const introText = 
      "En un mundo steampunk donde tecnología, magia y artes se entrelazan,\n" +
      "la historia de antiguos reinos y razas olvidadas renace...\n\n" +
      "Presiona cualquier tecla para continuar.";

    this.add.text(400, 100, introText, {
      fontSize: '24px',
      fill: '#fff',
      align: 'center',
      wordWrap: { width: 600, useAdvancedWrap: true }
    }).setOrigin(0.5);

    // Al presionar cualquier tecla, pasamos a la escena de selección de nombre
    this.input.keyboard.once('keydown', () => {
      this.scene.start('NameSelectScene');
    });
  }
}

// Escena de selección de nombre al estilo Undertale (grid de letras)
class NameSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NameSelectScene' });
    this.typedName = "";
    this.cursorRow = 0;
    this.cursorCol = 0;
  }

  preload() {
    // Carga de fuentes o imágenes si las necesitas
  }

  create() {
    // Título y display del nombre
    this.add.text(400, 50, "Nombra al humano caído.", {
      fontSize: '24px',
      fill: '#fff'
    }).setOrigin(0.5);
    
    this.nameDisplay = this.add.text(400, 100, this.typedName, {
      fontSize: '28px',
      fill: '#fff'
    }).setOrigin(0.5);
    
    // Definición de la rejilla (última fila se ajusta para centrar los botones)
    this.grid = [
      ["A","B","C","D","E","F","G"],
      ["H","I","J","K","L","M","N"],
      ["O","P","Q","R","S","T","U"],
      ["V","W","X","Y","Z","-","_"],
      ["a","b","c","d","e","f","g"],
      ["h","i","j","k","l","m","n"],
      ["o","p","q","r","s","t","u"],
      ["v","w","x","y","z"," "," "],
      // Para acciones, creamos 3 celdas centradas en un ancho mayor:
      ["Salir","Retroceder","Aceptar"]
    ];
    
    this.letterObjects = [];
    // Definimos la posición base y tamaño de las celdas
    let startX = 150;
    let startY = 180;
    let cellWidth = 60;
    let cellHeight = 40;
    
    // Para filas normales, usamos cellWidth; para la fila de acciones, usamos un ancho mayor
    for (let row = 0; row < this.grid.length; row++) {
      this.letterObjects[row] = [];
      // Si es la última fila (acciones), centramos usando un ancho mayor para cada celda
      let isActions = row === this.grid.length - 1;
      let currentCellWidth = isActions ? 200 : cellWidth;
      let offsetX = isActions ? (800 - currentCellWidth * this.grid[row].length) / 2 : startX;
      
      for (let col = 0; col < this.grid[row].length; col++) {
        let letter = this.grid[row][col];
        let x = offsetX + col * currentCellWidth + currentCellWidth / 2;
        let y = startY + row * cellHeight;
        let letterText = this.add.text(x, y, letter, {
          fontSize: '20px',
          fill: '#fff'
        }).setOrigin(0.5);
        this.letterObjects[row][col] = letterText;
      }
    }
    
    // Rectángulo para resaltar la celda seleccionada
    this.cursorHighlight = this.add.rectangle(
      this.letterObjects[0][0].x,
      this.letterObjects[0][0].y,
      40,
      30
    );
    this.cursorHighlight.setStrokeStyle(2, 0xffff00);
    this.cursorHighlight.setOrigin(0.5);
    
    // Configuración de controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  
  update() {
    // Mover el cursor
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.moveCursor(0, -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.moveCursor(0, 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.moveCursor(-1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.moveCursor(1, 0);
    }
    
    // Confirmar selección
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.selectCurrentCell();
    }
  }
  
  moveCursor(rowDelta, colDelta) {
    let newRow = this.cursorRow + rowDelta;
    let newCol = this.cursorCol + colDelta;
    if (newRow < 0) newRow = 0;
    if (newRow >= this.grid.length) newRow = this.grid.length - 1;
    if (newCol < 0) newCol = 0;
    if (newCol >= this.grid[newRow].length) newCol = this.grid[newRow].length - 1;
    
    this.cursorRow = newRow;
    this.cursorCol = newCol;
    let letterText = this.letterObjects[this.cursorRow][this.cursorCol];
    this.cursorHighlight.x = letterText.x;
    this.cursorHighlight.y = letterText.y;
    
    // Agrega un pequeño "temblor" al mover el cursor usando un tween
    this.tweens.add({
      targets: this.cursorHighlight,
      scaleX: 1.1,
      scaleY: 1.1,
      yoyo: true,
      duration: 50
    });
  }
  
  selectCurrentCell() {
    let selectedLetter = this.grid[this.cursorRow][this.cursorCol];
    
    // Si estamos en la última fila (acciones)
    if (this.cursorRow === this.grid.length - 1) {
      // Pequeña animación de temblor en el botón seleccionado
      this.tweens.add({
        targets: this.letterObjects[this.cursorRow][this.cursorCol],
        angle: { from: -5, to: 5 },
        yoyo: true,
        duration: 50,
        repeat: 2
      });
      
      if (selectedLetter === "Salir") {
        this.scene.start('IntroScene');
      } else if (selectedLetter === "Retroceder") {
        this.typedName = this.typedName.slice(0, -1);
        this.nameDisplay.setText(this.typedName);
      } else if (selectedLetter === "Aceptar") {
        this.scene.start('CharacterSelectScene', { playerName: this.typedName });
      }
    } else {
      // Agregar la letra al nombre y aplicar un temblor rápido al texto
      this.typedName += selectedLetter;
      this.nameDisplay.setText(this.typedName);
      this.tweens.add({
        targets: this.nameDisplay,
        scaleX: 1.05,
        scaleY: 1.05,
        yoyo: true,
        duration: 50
      });
    }
  }
}

// Escena de selección de personaje
class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload() {
    // Cargar spritesheets para personajes
    this.load.spritesheet('human', 'assets/Human-Player/IdleHuman.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('chimera', 'assets/Quimera-Player/IdleQuimera.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mechanita', 'assets/Robot-Player/IdleRobot.png', { frameWidth: 32, frameHeight: 32 });
  }

  create(data) {
    let playerName = data.playerName || "Jugador";
    this.add.text(400, 50, `Bienvenido, ${playerName}`, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 100, 'Elige tu personaje', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    
    // Crear animaciones para cada personaje (ajusta frames según tus assets)
    this.anims.create({
      key: 'humanAnim',
      frames: this.anims.generateFrameNumbers('human', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'chimeraAnim',
      frames: this.anims.generateFrameNumbers('chimera', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'mechanitaAnim',
      frames: this.anims.generateFrameNumbers('mechanita', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Posiciones para los personajes
    let humanSprite = this.add.sprite(200, 300, 'human').setInteractive();
    humanSprite.play('humanAnim');
    humanSprite.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'human', playerName: playerName });
    });
    
    let chimeraSprite = this.add.sprite(400, 300, 'chimera').setInteractive();
    chimeraSprite.play('chimeraAnim');
    chimeraSprite.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'chimera', playerName: playerName });
    });
    
    let mechanitaSprite = this.add.sprite(600, 300, 'mechanita').setInteractive();
    mechanitaSprite.play('mechanitaAnim');
    mechanitaSprite.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'mechanita', playerName: playerName });
    });
  }
}

// Escena principal del juego
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
  }

  preload() {
    // Fondo
    this.load.image('roomBackground', 'assets/fondos/roomBackground.png');

    // Plataforma
    this.load.image('platform', 'assets/platform.png');

    // Jugador
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });

    // Moneda animada
    this.load.spritesheet('coinAnim', 'assets/monedas/coins.png', { frameWidth: 16, frameHeight: 16 });

    // Enemigo
    this.load.spritesheet('enemy', 'assets/enemigos/IdleChiken.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    // Fondo
    this.add.image(400, 300, 'roomBackground');

    // Configurar físicas del mundo
    this.physics.world.setBounds(0, 0, 800, 600);
    // Gravity
    // Si quieres salto, pon algo como:
    this.physics.world.gravity.y = 600;

    // Plataformas
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'platform').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');

    // Jugador
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    // Animación del jugador (ejemplo)
    this.anims.create({
      key: 'playerWalk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // Monedas
    this.anims.create({
      key: 'coinSpin',
      frames: this.anims.generateFrameNumbers('coinAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    // Creamos un grupo de monedas
    this.coinsGroup = this.physics.add.group();
    // Ejemplo: generar 5 monedas en distintas posiciones
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(50, 750);
      let y = Phaser.Math.Between(50, 450);
      let coin = this.coinsGroup.create(x, y, 'coinAnim');
      coin.play('coinSpin');
    }
    this.physics.add.collider(this.coinsGroup, this.platforms);
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, null, this);

    // Enemigos
    this.anims.create({
      key: 'enemyWalk',
      frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    this.enemies = this.physics.add.group();
    let enemy = this.enemies.create(300, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    // Colisionar con plataformas
    this.physics.add.collider(this.enemies, this.platforms);
    // Overlap con el jugador
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Movimiento del jugador
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('playerWalk', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('playerWalk', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
    }

    // Salto
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    // Suma a un contador de monedas
  }

  playerHit(player, enemy) {
    // Manejar colisión con el enemigo (ej: restar vida)
  }
}


// Configuración de Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: { createContainer: true }, // si usaras inputs HTML
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // El orden de escenas define el flujo
  scene: [
    IntroScene,
    NameSelectScene,
    CharacterSelectScene,
    MainGameScene
  ]
};

const game = new Phaser.Game(config);

/* Funciones para la comunicación con el servidor */
function submitScore(playerName, rooms, coins) {
  fetch('/api/submitScore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName, rooms: rooms, coins: coins })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Puntaje enviado:", data);
    getLeaderboard();
  })
  .catch(err => console.error(err));
}

function getLeaderboard() {
  fetch('/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lbDiv = document.getElementById('leaderboard');
      lbDiv.innerHTML = '<h2>Ranking</h2>';
      data.forEach((entry, index) => {
        lbDiv.innerHTML += `<p>${index + 1}. ${entry.name} - Salas: ${entry.rooms}, Monedas: ${entry.coins}</p>`;
      });
    })
    .catch(err => console.error(err));
}

window.submitScore = submitScore;
window.getLeaderboard = getLeaderboard;