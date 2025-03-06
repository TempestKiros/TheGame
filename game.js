// ======================
// IntroScene
// ======================
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }
  preload() {
    this.load.image('introBG', 'assets/intro.png');
  }
  create() {
    this.physics.world.createDebugGraphic();
    this.add.image(400, 300, 'introBG');
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
    this.input.keyboard.once('keydown', () => {
      this.scene.start('NameSelectScene');
    });
  }
}

// ======================
// NameSelectScene (Selector de Nombre estilo Undertale)
// ======================
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
    this.add.text(400, 50, "Selecciona al Nuevo Emperador.", { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    this.nameDisplay = this.add.text(400, 100, this.typedName, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
    this.grid = [
      ["A","B","C","D","E","F","G"],
      ["H","I","J","K","L","M","N"],
      ["O","P","Q","R","S","T","U"],
      ["V","W","X","Y","Z","-","_"],
      ["a","b","c","d","e","f","g"],
      ["h","i","j","k","l","m","n"],
      ["o","p","q","r","s","t","u"],
      ["v","w","x","y","z"," "," "],
      ["Salir","Retroceder","Aceptar"]
    ];
    this.letterObjects = [];
    let startX = 150, startY = 180, cellWidth = 60, cellHeight = 40;
    for (let row = 0; row < this.grid.length; row++) {
      this.letterObjects[row] = [];
      let isActions = row === this.grid.length - 1;
      let currentCellWidth = isActions ? 200 : cellWidth;
      let offsetX = isActions ? (800 - currentCellWidth * this.grid[row].length) / 2 : startX;
      for (let col = 0; col < this.grid[row].length; col++) {
        let letter = this.grid[row][col];
        let x = offsetX + col * currentCellWidth + currentCellWidth / 2;
        let y = startY + row * cellHeight;
        let letterText = this.add.text(x, y, letter, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.letterObjects[row][col] = letterText;
      }
    }
    this.cursorHighlight = this.add.rectangle(
      this.letterObjects[0][0].x, this.letterObjects[0][0].y, 40, 30
    );
    this.cursorHighlight.setStrokeStyle(2, 0xffff00).setOrigin(0.5);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  update() {
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
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.selectCurrentCell();
    }
  }
  moveCursor(rowDelta, colDelta) {
    let newRow = Phaser.Math.Clamp(this.cursorRow + rowDelta, 0, this.grid.length - 1);
    let newCol = Phaser.Math.Clamp(this.cursorCol + colDelta, 0, this.grid[newRow].length - 1);
    this.cursorRow = newRow; this.cursorCol = newCol;
    let letterText = this.letterObjects[newRow][newCol];
    this.cursorHighlight.x = letterText.x; this.cursorHighlight.y = letterText.y;
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
    if (this.cursorRow === this.grid.length - 1) {
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

// ======================
// CharacterSelectScene
// ======================
class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }
  preload() {
        // Cargar spritesheets para personajes (asegúrate de que las rutas sean correctas)
    this.load.spritesheet('human', 'assets/Human-Player/IdleHuman.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('chimera', 'assets/Quimera-Player/IdleQuimera.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mechanita', 'assets/Robot-Player/IdleRobot.png', { frameWidth: 32, frameHeight: 32 });
  }
  create(data) {
    let playerName = data.playerName || "Jugador";
    this.add.text(400, 50, `Bienvenido, ${playerName}`, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 100, 'Elige tu personaje', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    
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
// MainGameScene (con animaciones adicionales y mecánica de stomp)
// ======================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.roomsCompleted = 0;
    this.coins = 0;
  }
  init(data) {
    this.playerRace = data.race || 'human';
    this.playerName = data.playerName || "Jugador";
    this.roomsCompleted = data.roomsCompleted || 0;
    this.coins = data.coins || 0;
  }
  preload() {
    this.physics.world.createDebugGraphic();
    // Cargar assets según la selección del jugador:
    if (this.playerRace === 'human') {
      this.load.image('roomBackground', 'assets/Human-Player/HumanBack.png');
      this.load.image('platform', 'assets/Human-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Human-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Human-Player/IdleEnemy.png', { frameWidth: 416 / 13, frameHeight: 34 });
      this.load.image('door', 'assets/Human-Player/Door-Human.png');
      this.load.image('boss', 'assets/Human-Player/boss.png');
      this.load.image('shop', 'assets/Human-Player/shop.png');

      // Animaciones adicionales
      this.load.spritesheet('humanWalk', 'assets/Human-Player/RunHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanDoubleJump', 'assets/Human-Player/DoubleJumpHuman.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('humanFall', 'assets/Human-Player/FallHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanJump', 'assets/Human-Player/JumpHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanWallJump', 'assets/Human-Player/WallJumpHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanHit', 'assets/Human-Player/HitHuman.png', { frameWidth: 32, frameHeight: 32 });

      this.load.spritesheet('humanJumpHit', 'assets/Human-Player/DoubleJumpHuman.png', { frameWidth: 32, frameHeight: 32 });


    } else if (this.playerRace === 'chimera') {
      this.load.image('roomBackground', 'assets/Quimera-Player/Quimerasback.png');
      this.load.image('platform', 'assets/Quimera-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Quimera-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Quimera-Player/IdleEnemy.png', { frameWidth: 448 / 15, frameHeight: 34 });
      this.load.image('door', 'assets/Quimera-Player/Door-Quimera.png');
      this.load.image('boss', 'assets/Quimera-Player/boss.png');
      this.load.image('shop', 'assets/Quimera-Player/shop.png');

      // Animaciones adicionales para Quimera
      this.load.spritesheet('chimeraDoubleJump', 'assets/Quimera-Player/DoubleJumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraFall', 'assets/Quimera-Player/FallQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraJump', 'assets/Quimera-Player/JumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraWallJump', 'assets/Quimera-Player/WallJumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraHit', 'assets/Quimera-Player/HitQuimera.png', { frameWidth: 32, frameHeight: 32 });

      this.load.spritesheet('chimeraJumpHit', 'assets/Quimera-Player/DoubleJumpQuimera.png', { frameWidth: 32, frameHeight: 32 });


    } else if (this.playerRace === 'mechanita') {
      this.load.image('roomBackground', 'assets/Robot-Player/RobotBack.png');
      this.load.image('platform', 'assets/Robot-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Robot-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Robot-Player/IdleEnemy.png', { frameWidth: 38 / 10, frameHeight: 34 });
      this.load.image('door', 'assets/Robot-Player/Door-Robot.png');
      this.load.image('boss', 'assets/Robot-Player/boss.png');
      this.load.image('shop', 'assets/Robot-Player/shop.png');

      // Animaciones adicionales para Robot
      this.load.spritesheet('mechanitaDoubleJump', 'assets/Robot-Player/DoubleJumpRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaFall', 'assets/Robot-Player/FallRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaJump', 'assets/Robot-Player/JumpRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaWallJump', 'assets/Robot-Player/WallJumpRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaHit', 'assets/Robot-Player/HitRobot.png', { frameWidth: 32, frameHeight: 32 });

      this.load.spritesheet('mechanitaJumpHit', 'assets/Robot-Player/DoubleJumpRobot.png', { frameWidth: 32, frameHeight: 32 });

    }
    // Nota: Los sprites de los personajes se cargaron en CharacterSelectScene.
  }
  create() {
    this.add.image(400, 300, 'roomBackground');
    this.physics.world.gravity.y = 600;
    this.physics.world.setBounds(0, 0, 800, 600);
    this.platforms = this.physics.add.staticGroup();
    this.spawnPlatforms();

    
    // Crear al jugador
    this.player = this.physics.add.sprite(100, 450, this.playerRace);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);


    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers(this.playerRace, { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Animaciones adicionales para acciones del jugador
    // Doble salto
    if (!this.anims.exists('doubleJump')) {
      this.anims.create({
        key: 'doubleJump',
        frames: this.anims.generateFrameNumbers('DoubleJump' + this.playerRace, { start: 0, end: 6 }),
        frameRate: 6,
        repeat: 0
      });
    }
    // Caída
    if (!this.anims.exists('fall')) {
      this.anims.create({
        key: 'fall',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'Fall', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    // Salto hit (stomp)
    if (!this.anims.exists('jumpHit')) {
      this.anims.create({
        key: 'jumpHit',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'JumpHit', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    // Wall jump
    if (!this.anims.exists('wallJump')) {
      this.anims.create({
        key: 'wallJump',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'WallJump', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // Grupo de monedas animadas (sin gravedad)
    if (!this.anims.exists('coinSpin')) {
      let coinFrames = this.anims.generateFrameNumbers('coinAnim', { start: 0, end: 5 });
      this.anims.create({
        key: 'coinSpin',
        frames: coinFrames,
        frameRate: 10,
        repeat: -1
      });
    }
    this.coinsGroup = this.physics.add.group();
    this.spawnCoins();
    this.physics.add.collider(this.coinsGroup, this.platforms);
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, null, this);
    
    // Animación y grupo de enemigos
    if (!this.anims.exists('enemyWalk')) {
      this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 14 }),
        frameRate: 10,
        repeat: -1
      });
    }
    this.enemies = this.physics.add.group();
    let enemy = this.enemies.create(500, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
    
    this.spawnDoor();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.scoreText = this.add.text(16, 16, `Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`, { fontSize: '20px', fill: '#fff' });
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
  
    // Lógica de salto (usando un flag para evitar disparos repetidos)
    if (this.cursors.up.isDown && !this.jumpKeyPressed) {
      this.jumpKeyPressed = true;
      if (this.player.body.onFloor()) {
        // Salto normal
        this.player.setVelocityY(-330);
        this.player.doubleJumped = false; // Reinicia el doble salto al saltar desde el suelo
      } else if (this.player.body.blocked.left || this.player.body.blocked.right) {
        // Wall jump
        this.player.setVelocityY(-330);
        if (this.player.body.blocked.left) {
          this.player.setVelocityX(160);
        } else if (this.player.body.blocked.right) {
          this.player.setVelocityX(-160);
        }
      } else if (!this.player.doubleJumped) {
        // Doble salto
        this.player.setVelocityY(-330);
        this.player.doubleJumped = true;
      }
    }
    
    // Cuando se suelte la tecla, se reinicia el flag para permitir otro salto
    if (this.cursors.up.isUp) {
      this.jumpKeyPressed = false;
    }
  
    // Si el jugador está en el aire y cayendo, reproducir animación de caída
    if (!this.player.body.onFloor() && this.player.body.velocity.y > 0) {
      if (this.anims.exists('fall')) {
        this.player.anims.play('fall', true);
      }
    }
  }  

  spawnPlatforms() {
    // Definimos posiciones conocidas para las plataformas
    let platformPositions = [
      { x: 400, y: 580, scale: 2 },  // Suelo principal
      { x: 150, y: 450 },
      { x: 400, y: 350 },
      { x: 650, y: 250 }
    ];
    // Limpiar plataformas previas (si es necesario)
    this.platforms.clear(true, true);
    // Crear plataformas en posiciones definidas
    platformPositions.forEach(pos => {
      let plat = this.platforms.create(pos.x, pos.y, 'platform');
      if (pos.scale) {
        plat.setScale(pos.scale).refreshBody();
      }
    });
  }  

  spawnCoins() {
    this.coinsGroup.clear(true, true);
    // Obtén todas las plataformas
    let platformsArray = this.platforms.getChildren();
    for (let i = 0; i < 7; i++) {
      // Escoge una plataforma aleatoria
      let platform = Phaser.Utils.Array.GetRandom(platformsArray);
      // Calcula la posición X aleatoria dentro del ancho de la plataforma
      let coinX = Phaser.Math.Between(platform.x - platform.displayWidth / 2, platform.x + platform.displayWidth / 2);
      // Coloca la moneda justo encima de la plataforma:
      // Se resta la mitad de la altura de la plataforma y se añade un margen (por ejemplo, 10px)
      // Además, restamos la mitad de la altura de la moneda (asumamos 16/2 = 8)
      let coinY = platform.y - (platform.displayHeight / 2) - 10 - 8;
      let coin = this.coinsGroup.create(coinX, coinY, 'coinAnim');
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
    // Definimos un array de posiciones de puerta accesibles, por ejemplo:
    let doorPositions = [
      { x: 750, y: 540, side: "right" },  // Borde derecho del suelo principal
      { x: 50,  y: 540, side: "left" }     // Borde izquierdo del suelo principal
      // Puedes agregar más posiciones si lo deseas
    ];
    // Escoge una posición aleatoria de la lista
    let pos = Phaser.Utils.Array.GetRandom(doorPositions);
    this.door = this.physics.add.sprite(pos.x, pos.y, 'door');
    this.door.body.allowGravity = false;
    this.door.setImmovable(true);
    this.door.locked = true;
    this.door.setTint(0xff0000);
    this.door.side = pos.side;
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
  // Mecánica de stomp: El jugador debe caer sobre el enemigo para eliminarlo.
  playerHit(player, enemy) {
    // Si el jugador está cayendo (velocidadY positiva) y su parte inferior está por encima del enemigo,
    // lo consideramos stomp.
    if (player.body.velocity.y > 0 && (player.y + player.height * 0.5) < enemy.y) {
      enemy.destroy();
      // Rebota el jugador
      player.setVelocityY(-200);
      if (this.anims.exists('jumpHit')) {
        player.anims.play('jumpHit', true);
      }
    } else {
      console.log("¡El jugador ha sido impactado por el enemigo!");
      // Aquí podrías implementar daño o reiniciar la sala.
    }
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
    //IntroScene,
    //NameSelectScene,
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
