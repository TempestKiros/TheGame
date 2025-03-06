// Escena de introducción (estilo Undertale)
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('introBG', 'assets/intro.png');
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

// ======================
// MainGameScene
// ======================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.roomsCompleted = 0;
    this.coins = 0;
  }

  init(data) {
    // 'data' debe contener la selección: "human", "chimera" o "mechanita"
    this.playerRace = data.race || 'human';
    this.playerName = data.playerName || "Jugador";
    this.roomsCompleted = data.roomsCompleted || 0;
    this.coins = data.coins || 0;
  }

  preload() {
    // Cargar assets según la selección del jugador:
    if (this.playerRace === 'human') {
      this.load.image('roomBackground', 'assets/Human-Player/HumanBack.png');
      this.load.image('platform', 'assets/Human-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Human-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Human-Player/IdleEnemy.png', { frameWidth: 448 / 15, frameHeight: 34 });
      this.load.image('door', 'assets/Human-Player/Door-Human.png');
      this.load.image('boss', 'assets/Human-Player/boss.png');
      this.load.image('shop', 'assets/Human-Player/shop.png');
    } else if (this.playerRace === 'chimera') {
      this.load.image('roomBackground', 'assets/Quimera-Player/Quimerasback.png');
      this.load.image('platform', 'assets/Quimera-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Quimera-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Quimera-Player/IdleEnemy.png', { frameWidth: 448 / 15, frameHeight: 34 });
      this.load.image('door', 'assets/Quimera-Player/Door-Quimera.png');
      this.load.image('boss', 'assets/Quimera-Player/boss.png');
      this.load.image('shop', 'assets/Quimera-Player/shop.png');
    } else if (this.playerRace === 'mechanita') {
      this.load.image('roomBackground', 'assets/Robot-Player/RobotBack.png');
      this.load.image('platform', 'assets/Robot-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Robot-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Robot-Player/IdleEnemy.png', { frameWidth: 448 / 15, frameHeight: 34 });
      this.load.image('door', 'assets/Robot-Player/Door-Robot.png');
      this.load.image('boss', 'assets/Robot-Player/boss.png');
      this.load.image('shop', 'assets/Robot-Player/shop.png');
    }
    // Nota: Los sprites de los personajes se cargaron en CharacterSelectScene.
  }

  create() {
    // Agregar el fondo
    this.add.image(400, 300, 'roomBackground');

    // Configurar la gravedad para el jugador (mientras que las monedas la desactivamos)
    this.physics.world.gravity.y = 600;
    this.physics.world.setBounds(0, 0, 800, 600);

    // Crear plataformas estáticas
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'platform').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');

    // Crear al jugador usando la clave seleccionada (las claves usadas en CharacterSelectScene son: "human", "chimera", "mechanita")
    this.player = this.physics.add.sprite(100, 450, this.playerRace);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    // Crear animación de caminata para el jugador, si no existe.
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers(this.playerRace, { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Crear la animación de la moneda
    if (!this.anims.exists('coinSpin')) {
      let coinFrames = this.anims.generateFrameNumbers('coinAnim', { start: 0, end: 5 });
      this.anims.create({
        key: 'coinSpin',
        frames: coinFrames,
        frameRate: 10,
        repeat: -1
      });
    }

    // Grupo de monedas: Se crean sin gravedad para que queden suspendidas
    this.coinsGroup = this.physics.add.group();
    this.spawnCoins();
    this.physics.add.collider(this.coinsGroup, this.platforms);
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, null, this);

    // Crear animación para el enemigo (15 frames)
    if (!this.anims.exists('enemyWalk')) {
      this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 14 }),
        frameRate: 10,
        repeat: -1
      });
    }
    // Grupo de enemigos
    this.enemies = this.physics.add.group();
    let enemy = this.enemies.create(500, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // Crear la puerta en una pared aleatoria
    this.spawnDoor();

    // Configurar controles (teclas de cursor)
    this.cursors = this.input.keyboard.createCursorKeys();

    // Mostrar el progreso
    this.scoreText = this.add.text(16, 16, `Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`, {
      fontSize: '20px',
      fill: '#fff'
    });
  }

  update() {
    // Movimiento horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('walk', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('walk', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
    }
    
    // Salto: solo si el jugador está tocando el suelo
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
    
    // Wall jump (opcional, si se detecta contacto lateral)
    if (this.cursors.up.isDown && (this.player.body.blocked.left || this.player.body.blocked.right)) {
      this.player.setVelocityY(-330);
      if (this.player.body.blocked.left) {
        this.player.setVelocityX(160);
      } else if (this.player.body.blocked.right) {
        this.player.setVelocityX(-160);
      }
    }
  }

  spawnCoins() {
    this.coinsGroup.clear(true, true);
    for (let i = 0; i < 7; i++) {
      let x = Phaser.Math.Between(100, 700);
      let y = Phaser.Math.Between(100, 500);
      let coin = this.coinsGroup.create(x, y, 'coinAnim');
      coin.body.allowGravity = false;
      coin.play('coinSpin');
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coins++;
    this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
    if (this.coins >= 7 && this.door.locked) {
      this.door.locked = false;
      this.door.clearTint();
      console.log("¡Puerta desbloqueada!");
    }
  }

  spawnDoor() {
    let side = Phaser.Math.RND.pick(["left", "right", "top", "bottom"]);
    let doorX, doorY;
    if (side === "left") {
      doorX = 50;
      doorY = Phaser.Math.Between(100, 500);
    } else if (side === "right") {
      doorX = 750;
      doorY = Phaser.Math.Between(100, 500);
    } else if (side === "top") {
      doorX = Phaser.Math.Between(100, 700);
      doorY = 50;
    } else if (side === "bottom") {
      doorX = Phaser.Math.Between(100, 700);
      doorY = 550;
    }
    this.door = this.physics.add.sprite(doorX, doorY, 'door');
    this.door.locked = true;
    this.door.setTint(0xff0000);
    this.door.side = side;
    this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);
  }

  enterDoor(player, door) {
    if (!door.locked) {
      let offset = 40;
      if (door.side === "left") {
        player.x = door.x + offset;
      } else if (door.side === "right") {
        player.x = door.x - offset;
      } else if (door.side === "top") {
        player.y = door.y + offset;
      } else if (door.side === "bottom") {
        player.y = door.y - offset;
      }
      this.completeRoom();
    }
  }

  completeRoom() {
    this.roomsCompleted++;
    this.coins = 0;
    this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
    if (this.roomsCompleted % 10 === 0) {
      this.spawnBoss();
    } else if (this.roomsCompleted % 7 === 0) {
      this.spawnShop();
    } else {
      this.resetRoom();
    }
  }

  resetRoom() {
    this.spawnCoins();
    if (this.door) {
      this.door.destroy();
    }
    this.spawnDoor();
  }

  spawnBoss() {
    console.log("¡Boss!");
    let bossSprite = this.add.image(400, 300, 'boss');
    this.physics.add.existing(bossSprite);
    this.time.delayedCall(5000, () => {
      bossSprite.destroy();
      this.resetRoom();
    }, null, this);
  }

  spawnShop() {
    console.log("¡Tienda!");
    let shopSprite = this.add.image(400, 300, 'shop');
    this.physics.pause();
    this.time.delayedCall(5000, () => {
      shopSprite.destroy();
      this.physics.resume();
      this.resetRoom();
    }, null, this);
  }

  playerHit(player, enemy) {
    console.log("¡Enemigo impactado!");
  }
}

// ======================
// Configuración de Phaser
// ======================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: { createContainer: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
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
