// ======================
// IntroScene           =
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

// =====================================
// NameSelectScene (Selector de Nombre)=
// =====================================
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

// =======================
// CharacterSelectScene  =
// =======================
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

// =========================================================================================
// MainGameScene (con animaciones, mecánica de stomp, enemigos, boss y tienda)             =
// =========================================================================================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.roomsCompleted = 0;
    this.coins = 15; // Inicializa la variable de monedas
    this.playerHealth = 5; 
    this.bossesDefeated = 0;
    this.doorCost = 5;
  }

  init(data) {
    this.playerRace = data.race || 'human';
    this.playerName = data.playerName || "Jugador";
    // Forzamos valores de prueba
    this.roomsCompleted = 0;
    this.totalCoins = 0;
    this.playerHealth = 5;
    this.bossesDefeated = 0;
    this.itemsCollected = 0; 
  }  
  
  preload() {
    // Cargar assets según la selección del jugador:
    if (this.playerRace === 'human') {
      this.load.image('roomBackground', 'assets/Human-Player/HumanBack.png');
      this.load.image('platform', 'assets/Human-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Human-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Human-Player/Chicken/IdleEnemy.png', { frameWidth: 416 / 13, frameHeight: 34 });
      this.load.image('door', 'assets/Human-Player/Door-Human.png');
      this.load.spritesheet('boss', 'assets/Human-Player/boss.png', { frameWidth: 440 / 10, frameHeight: 30 });
      this.load.image('shop', 'assets/Human-Player/shop.png');

      // Animaciones adicionales
      this.load.spritesheet('humanWalk', 'assets/Human-Player/RunHuman.png', { frameWidth: 384 / 12, frameHeight: 32 });
      this.load.spritesheet('humanDoubleJump', 'assets/Human-Player/DoubleJumpHuman.png', { frameWidth: 192 / 6, frameHeight: 32  });
      this.load.spritesheet('humanFall', 'assets/Human-Player/FallHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanJump', 'assets/Human-Player/JumpHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanWallJump', 'assets/Human-Player/WallJumpHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanHit', 'assets/Human-Player/HitHuman.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('humanJumpHit', 'assets/Human-Player/DoubleJumpHuman.png', { frameWidth: 32, frameHeight: 32 });
    } else if (this.playerRace === 'chimera') {
      this.load.image('roomBackground', 'assets/Quimera-Player/Quimerasback.png');
      this.load.image('platform', 'assets/Quimera-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Quimera-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Quimera-Player/Rino/IdleEnemy.png', { frameWidth: 572 / 11, frameHeight: 34 });
      this.load.image('door', 'assets/Quimera-Player/Door-Quimera.png');
      this.load.spritesheet('boss', 'assets/Quimera-Player/boss.png', { frameWidth: 440 / 10, frameHeight: 30 });
      this.load.image('shop', 'assets/Quimera-Player/shop.png');

      // Animaciones adicionales para Quimera
      this.load.spritesheet('chimeraWalk', 'assets/Quimera-Player/RunQuimera.png', { frameWidth: 384 / 12, frameHeight: 32 });
      this.load.spritesheet('chimeraDoubleJump', 'assets/Quimera-Player/DoubleJumpQuimera.png', { frameWidth: 192 / 6, frameHeight: 32  });
      this.load.spritesheet('chimeraFall', 'assets/Quimera-Player/FallQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraJump', 'assets/Quimera-Player/JumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraWallJump', 'assets/Quimera-Player/WallJumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraHit', 'assets/Quimera-Player/HitQuimera.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('chimeraJumpHit', 'assets/Quimera-Player/DoubleJumpQuimera.png', { frameWidth: 32, frameHeight: 32 });
    } else if (this.playerRace === 'mechanita') {
      this.load.image('roomBackground', 'assets/Robot-Player/RobotBack.png');
      this.load.image('platform', 'assets/Robot-Player/platform.png');
      this.load.spritesheet('coinAnim', 'assets/Robot-Player/coin.png', { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('enemy', 'assets/Robot-Player/Slime/IdleEnemy.png', { frameWidth: 440 / 10, frameHeight: 30 });
      this.load.image('door', 'assets/Robot-Player/Door-Robot.png');
      this.load.spritesheet('boss', 'assets/Robot-Player/boss.png', { frameWidth: 440 / 10, frameHeight: 30 });
      this.load.image('shop', 'assets/Robot-Player/shop.png');

      // Animaciones adicionales para Robot
      this.load.spritesheet('mechanitaWalk', 'assets/Robot-Player/RunRobot.png', { frameWidth: 384 / 12, frameHeight: 32 });
      this.load.spritesheet('mechanitaDoubleJump', 'assets/Robot-Player/DoubleJumpRobot.png', { frameWidth: 192 / 6, frameHeight: 32  });
      this.load.spritesheet('mechanitaFall', 'assets/Robot-Player/FallRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaJump', 'assets/Robot-Player/JumpRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaWallJump', 'assets/Robot-Player/WallJumpRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaHit', 'assets/Robot-Player/HitRobot.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('mechanitaJumpHit', 'assets/Robot-Player/DoubleJumpRobot.png', { frameWidth: 32, frameHeight: 32 });
    }
      // Cargar las imágenes
      this.load.image('fireball', 'assets/fireball.gif');
      this.load.image('item1', 'assets/huevopascua1.png');
      this.load.image('item2', 'assets/huevopascua2.png');
      this.load.image('item3', 'assets/huevopascua3.png');
      this.load.image('inventoryBg', 'assets/inventoryBackground.png');  // Fondo del inventario
  }
  // Método de inventario
  inventory() {
    if (!this.inventoryContainer) {
      this.inventoryContainer = this.add.container(400, 300); // Centro de la pantalla
      let bg = this.add.image(0, 0, 'inventoryBg').setScale(0.5);
      this.inventoryContainer.add(bg);

      this.inventoryItems = [];

      // Mostrar hasta 3 ítems en el inventario
      for (let i = 0; i < 3; i++) {
        let item = this.add.image(-50 + i * 50, 0, 'item' + (i + 1)).setVisible(false);
        this.inventoryContainer.add(item);
        this.inventoryItems.push(item);
      }

      // Ocultar por defecto
      this.inventoryContainer.setVisible(false);

      // Asignar el evento para la tecla "E"
      this.input.keyboard.on('keydown-E', () => {
        console.log("Se presionó E");  // Debug
        this.inventoryContainer.setVisible(!this.inventoryContainer.visible);
      });
    }
  }

  create() {
  // Configurar el fondo y la gravedad
  this.add.image(400, 300, 'roomBackground');
  this.physics.world.gravity.y = 600;
  this.physics.world.setBounds(0, 0, 800, 600);

  // Crear el grupo de plataformas y generarlas
  this.platforms = this.physics.add.staticGroup();
  this.spawnPlatforms();

  // Crear al jugador
  this.player = this.physics.add.sprite(100, 450, this.playerRace);
  this.player.setCollideWorldBounds(true);
  // Inicializar banderas y propiedades del jugador
  this.player.doubleJumped = false;
  this.player.tripleJumped = false;
  this.player.canTripleJump = false;
  this.player.speedUp = false;
  this.player.invulnerable = false;
  this.inventory();
  
  // Agregar el collider entre el jugador y las plataformas
  this.physics.add.collider(this.player, this.platforms);

    // Animaciones del jugador
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'Walk', { start: 0, end: 12 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists('DoubleJump')) {
      this.anims.create({
        key: 'DoubleJump',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'DoubleJump', { start: 0, end: 4 }),
        frameRate: 5,
        repeat: 0
      });
    }
    if (!this.anims.exists('fall')) {
      this.anims.create({
        key: 'fall',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'Fall', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists('jumpHit')) {
      this.anims.create({
        key: 'jumpHit',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'JumpHit', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!this.anims.exists('wallJump')) {
      this.anims.create({
        key: 'wallJump',
        frames: this.anims.generateFrameNumbers(this.playerRace + 'WallJump', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }    
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

     // Agrega un listener para la tecla "P"
     this.input.keyboard.on('keydown-P', () => {
      // Si el menú no está activo, se pausa el juego y se lanza el menú
      if (!this.scene.isActive('MenuScene')) {
        this.scene.pause();
        this.scene.launch('MenuScene');
      }
    });
    
    // Enemigos
    if (!this.anims.exists('enemyWalk')) {
      this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 14 }),
        frameRate: 10,
        repeat: -1
      });
    }
    this.enemies = this.physics.add.group();
    // Se crea un enemigo inicial (opcional)
    let enemy = this.enemies.create(500, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
    
    this.spawnDoor();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.scoreText = this.add.text(16, 16, `Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`, { fontSize: '20px', fill: '#fff' });
    this.healthText = this.add.text(16, 40, `Vida: ${this.playerHealth}`, { fontSize: '20px', fill: '#fff' });
  }

  spawnPlatforms() {

    this.platforms.clear(true, true);
    let platformPositions = [
      { x: 400, y: 580, scale: 2 },
      { x: 150, y: 450 },
      { x: 400, y: 350 },
      { x: 650, y: 250 }
    ];
    platformPositions.forEach(pos => {
      let plat = this.platforms.create(pos.x, pos.y, 'platform');
      if (pos.scale) {
        plat.setScale(pos.scale).refreshBody();
      }
    });
  }  

  spawnCoins() {
    this.coinsGroup.clear(true, true);
    let platformsArray = this.platforms.getChildren();
    for (let i = 0; i < 7; i++) {
      let platform = Phaser.Utils.Array.GetRandom(platformsArray);
      let coinX = Phaser.Math.Between(platform.x - platform.displayWidth / 2, platform.x + platform.displayWidth / 2);
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
    let doorPositions = [
      { x: 750, y: 540, side: "right" },
      { x: 50,  y: 540, side: "left" }
    ];
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
  
    // Lógica de eventos según la cantidad de salas completadas:
    if (this.roomsCompleted % 10 === 0) {
      // Cada 10 salas aparece un jefe
      this.spawnBoss();
    } else if (this.roomsCompleted % 7 === 0) {
      // Cada 7 salas aparece una tienda
      this.spawnShop();
    } else {
      // Si no se cumple lo anterior, reiniciamos la sala (monedas y puerta)
      this.resetRoom();
    }
    
    // Cada 2 salas se genera un enemigo adicional
    if (this.roomsCompleted % 2 === 0) {
      this.spawnEnemy();
    }
  }  
  
  resetRoom() {

    if (this.roomsCompleted >= 10) {
      let extra = Math.floor((this.roomsCompleted - 10) / 10) + 1;
      this.doorCost = 5 + extra * 5;
    } else {
      this.doorCost = 5;
    }
    this.spawnCoins();
    if (this.door) {
      this.door.destroy();
    }
    this.spawnDoor();
    // Vuelve a crear el collider entre el jugador y las plataformas
    this.physics.add.collider(this.player, this.platforms);
    if (this.platformCollider) {
      this.platformCollider.destroy();
    }
    this.platformCollider = this.physics.add.collider(this.player, this.platforms);
    
  }

  spawnEnemy() {
    let enemy = this.enemies.create(700, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(-50);
  }

  // Método para crear el boss y la barra de salud
  spawnBoss() {
  console.log("¡Boss ha aparecido!");
  let boss = this.physics.add.sprite(400, 300, 'boss');
  boss.setCollideWorldBounds(true);
  boss.health = 5;
  boss.maxHealth = 5;
  boss.speed = 100;
  this.boss = boss;

  // Timer para lanzar bolas de fuego cada 5 segundos
  boss.fireballTimer = this.time.addEvent({
    delay: 5000,
    callback: () => {
      this.spawnFireball(boss);
    },
    loop: true
  });

  // Crear la barra de salud del boss con un depth alto
  this.bossHealthBar = this.add.graphics();
  this.bossHealthBar.setDepth(1000);
  this.updateBossHealthBar();

  // Colisión entre el boss y el jugador
  this.physics.add.overlap(this.player, boss, (player, bossSprite) => {
    if (player.invulnerable) return;
    if (player.body.velocity.y > 0 && (player.y + player.height * 0.5) < bossSprite.y) {
      bossSprite.health--;
      player.setVelocityY(-200);
      this.updateBossHealthBar();
      if (bossSprite.health <= 0) {
        // Detener el timer de bolas de fuego
        if (bossSprite.fireballTimer) bossSprite.fireballTimer.remove(false);
        if (this.bossHealthBar) this.bossHealthBar.destroy();

        // Llama a dropItem para soltar el objeto
        this.dropItem(bossSprite.x, bossSprite.y);

        bossSprite.destroy();
        this.coins += 20;
        this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
        this.resetRoom();
      }
    } else {
      this.playerHealth = Math.max(0, this.playerHealth - 1);
      this.healthText.setText(`Vida: ${this.playerHealth}`);
      if (this.playerHealth <= 0) {
        submitScore(this.playerName, this.roomsCompleted, this.coins, this.playerHealth);
        this.scene.start('GameOverScene');
      }
      this.setPlayerInvulnerability(2000);
    }
  }, null, this);
  }

  updateBossHealthBar() {
    if (!this.boss || !this.boss.active) {
      if (this.bossHealthBar) this.bossHealthBar.clear();
      return;
    }
    this.bossHealthBar.clear();
    let x = this.boss.x - 50;
    let y = this.boss.y - this.boss.height / 2 - 20;
    let width = 100;
    let height = 10;
    // Fondo en rojo
    this.bossHealthBar.fillStyle(0xff0000, 1);
    this.bossHealthBar.fillRect(x, y, width, height);
    // Barra verde según la salud restante
    let healthPercentage = this.boss.health / this.boss.maxHealth;
    this.bossHealthBar.fillStyle(0x00ff00, 1);
    this.bossHealthBar.fillRect(x, y, width * healthPercentage, height);
  }  
  
  spawnFireball(boss) {
    // Crear la bola de fuego
    let fireball = this.physics.add.sprite(boss.x, boss.y, 'fireball');
    fireball.speed = 150;  // Velocidad de la bola de fuego
    fireball.target = this.player;  // Asignamos el objetivo

    // Ajusta la hitbox (modifica los valores según lo que necesites)
    fireball.body.setSize(28, 30); // ancho, alto deseados
    fireball.body.setOffset(20, 10); // desplazamiento en x, y si es necesario
  
    // Guardamos el fireball en un grupo
    if (!this.fireballs) {
      this.fireballs = this.physics.add.group();
    }
    this.fireballs.add(fireball);
  
    // Colisión entre fireball y jugador
    this.physics.add.overlap(this.player, fireball, (player, fb) => {
      fb.destroy();
      this.playerHealth = Math.max(0, this.playerHealth - 1);
      this.healthText.setText(`Vida: ${this.playerHealth}`);
      if (this.playerHealth <= 0) {
        submitScore(this.playerName, this.roomsCompleted, this.coins, this.playerHealth);
        this.scene.start('GameOverScene');
      }
    }, null, this);
  
    // Colisión con plataformas y enemigos
    this.physics.add.collider(fireball, this.platforms, (fb) => fb.destroy());
    this.physics.add.collider(fireball, this.enemies, (fb) => fb.destroy());
  
    // Destruir la bola de fuego después de 6 segundos
    this.time.delayedCall(6000, () => {
      if (fireball.active) {
        fireball.destroy();
      }
    });
  }
  // Drop aleatorio de objetos al derrotar al boss
  dropItem(x, y) {
    let dropChance = Math.random();
    if (dropChance <= 0.9) { // 90% de probabilidad de soltar un objeto
      let items = ['item1', 'item2', 'item3'];
      let randomItem = items[Math.floor(Math.random() * items.length)];
      let droppedItem = this.physics.add.sprite(x, y, randomItem);
      // Evitar que el objeto caiga indefinidamente
      droppedItem.body.allowGravity = false;
      // Guardar la clave del ítem para usarla al recogerlo
      droppedItem.myKey = randomItem;
      
      this.physics.add.overlap(this.player, droppedItem, (player, item) => {
        console.log("Item recogido:", item.myKey);
        this.addToInventory(item.myKey);
        item.destroy();
      });
    }
  }
  
    
  update() {
    // --- Lógica del jugador y enemigos ---
    let baseSpeed = 160;
    let speed = this.player.speedUp ? baseSpeed * 2 : baseSpeed;
  
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
    }
  
    // Lógica de salto con posibilidad de triple salto
    if (this.cursors.up.isDown && !this.jumpKeyPressed) {
      this.jumpKeyPressed = true;
      if (this.player.body.onFloor()) {
        this.player.setVelocityY(-330);
        // Reinicia las banderas de doble y triple salto
        this.player.doubleJumped = false;
        this.player.tripleJumped = false;
      } else if (this.player.body.blocked.left || this.player.body.blocked.right) {
        this.player.setVelocityY(-330);
        if (this.player.body.blocked.left) {
          this.player.setVelocityX(speed);
        } else if (this.player.body.blocked.right) {
          this.player.setVelocityX(-speed);
        }
      } else if (!this.player.doubleJumped) {
        this.player.setVelocityY(-330);
        this.player.doubleJumped = true;
        this.player.anims.play('DoubleJump', true);
      } else if (this.player.canTripleJump && !this.player.tripleJumped) {
        this.player.setVelocityY(-330);
        this.player.tripleJumped = true;
        this.player.anims.play('DoubleJump', true);
      }
    }
    if (this.cursors.up.isUp) {
      this.jumpKeyPressed = false;
    }
    if (!this.player.body.onFloor() && this.player.body.velocity.y > 0) {
      if (this.anims.exists('fall')) {
        this.player.anims.play('fall', true);
      }
    }
  
    // Actualización de enemigos para seguir al jugador
    this.enemies.getChildren().forEach(enemy => {
      let distanceX = this.player.x - enemy.x;
      if (distanceX < -10) {
        enemy.setVelocityX(-50);
        enemy.flipX = true;
      } else if (distanceX > 10) {
        enemy.setVelocityX(50);
        enemy.flipX = false;
      } else {
        enemy.setVelocityX(0);
      }
      if (this.player.y < enemy.y - 10 && (enemy.body.blocked.left || enemy.body.blocked.right)) {
        enemy.setVelocityY(-200);
      }
    });
  
    // --- Lógica del boss y proyectiles ---
    if (this.boss && this.boss.active) {
      let dx = this.player.x - this.boss.x;
      let dy = this.player.y - this.boss.y;
      let magnitude = Math.sqrt(dx * dx + dy * dy);
      if (magnitude > 0) {
        this.boss.setVelocity((dx / magnitude) * this.boss.speed, (dy / magnitude) * this.boss.speed);
      }
    }
  
    if (this.fireballs) {
      this.fireballs.children.iterate((fireball) => {
        if (fireball.active && fireball.target) {
          let dx = fireball.target.x - fireball.x;
          let dy = fireball.target.y - fireball.y;
          let magnitude = Math.sqrt(dx * dx + dy * dy);
          if (magnitude > 0) {
            fireball.setVelocity((dx / magnitude) * fireball.speed, (dy / magnitude) * fireball.speed);
          }
        }
      });
    }

     // Actualización de la barra de vida del boss (si está activo)
     if (this.boss && this.boss.active) {
      this.updateBossHealthBar();
    }
  }  
  
  // Cuando el jugador recoja un ítem:
  addToInventory(itemKey) {
    for (let i = 0; i < this.inventoryItems.length; i++) {
      if (!this.inventoryItems[i].visible) {
        this.inventoryItems[i].setTexture(itemKey).setVisible(true);
        this.itemsCollected++;
        break;
      }
    }
  }  
  
  spawnShop() {
    console.log("¡Tienda!");
    // Pausar la física y mostrar overlay
    this.physics.pause();
    let shopOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    let shopTitle = this.add.text(400, 80, 'Bienvenido a la Tienda', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    
    // Botón para +Vida (se puede comprar varias veces)
    let vidaButton = this.add.text(400, 150, 'Comprar +Vida', { fontSize: '24px', fill: '#fff', backgroundColor: '#008000', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive();
    
    // Botón para +Salto (solo una vez)
    let saltoButton = this.add.text(400, 220, 'Comprar +Salto', { fontSize: '24px', fill: '#fff', backgroundColor: '#000080', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive();
    
    // Botón para +Velocidad (solo una vez)
    let velocidadButton = this.add.text(400, 290, 'Comprar +Velocidad', { fontSize: '24px', fill: '#fff', backgroundColor: '#800000', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive();
    
    // Botón para salir de la tienda
    let exitButton = this.add.text(400, 400, 'Salir de la Tienda (S)', { fontSize: '24px', fill: '#fff', backgroundColor: '#555555', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive();
  
    // Eventos para cada opción:
    vidaButton.on('pointerdown', () => {
      let cost = 5; // CAMBIO: costo de la compra
      if (this.coins >= cost) {
        this.playerHealth++;
        this.healthText.setText(`Vida: ${this.playerHealth}`);
        this.coins -= cost;
        this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
        console.log('Comprado +Vida');
      } else {
        console.log('No tienes suficientes monedas');
      }
    });
  
    saltoButton.on('pointerdown', () => {
      let cost = 5;
      if (!this.player.canTripleJump && this.coins >= cost) {
        this.player.canTripleJump = true;
        this.coins -= cost;
        this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
        console.log('Comprado +Salto: Triple salto habilitado');
        saltoButton.setText('Triple Salto (Comprado)');
        saltoButton.disableInteractive();
      } else {
        console.log('No tienes suficientes monedas o ya lo compraste');
      }
    });
  
    velocidadButton.on('pointerdown', () => {
      let cost = 5;
      if (!this.player.speedUp && this.coins >= cost) {
        this.player.speedUp = true;
        this.coins -= cost;
        this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
        console.log('Comprado +Velocidad: Velocidad duplicada');
        velocidadButton.setText('Velocidad x2 (Comprado)');
        velocidadButton.disableInteractive();
      } else {
        console.log('No tienes suficientes monedas o ya lo compraste');
      }
    });
  
    // Salir de la tienda: se destruyen los elementos y se reanuda la física
    exitButton.on('pointerdown', () => {
      shopOverlay.destroy();
      shopTitle.destroy();
      vidaButton.destroy();
      saltoButton.destroy();
      velocidadButton.destroy();
      exitButton.destroy();
      this.physics.resume();
      this.resetRoom();
    });
  
    // También se puede salir presionando la tecla S
    this.input.keyboard.once('keydown-S', () => {
      shopOverlay.destroy();
      shopTitle.destroy();
      vidaButton.destroy();
      saltoButton.destroy();
      velocidadButton.destroy();
      exitButton.destroy();
      this.physics.resume();
      this.resetRoom();
    });
  }    
  // Cuando el jugador es impactado por un enemigo
  playerHit(player, enemy) {
    // Si el jugador ya es invulnerable, se ignora el golpe
    if (player.invulnerable) return;
    
    if (player.body.velocity.y > 0 && (player.y + player.height * 0.5) < enemy.y) {
      enemy.destroy();
      player.setVelocityY(-200);
      if (this.anims.exists('jumpHit')) {
        player.anims.play('jumpHit', true);
      }
    } else {
      console.log("¡El jugador ha sido impactado por el enemigo!");
      this.coins = Math.max(0, this.coins - 5);
      this.playerHealth = Math.max(0, this.playerHealth - 1);
      this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
      this.healthText.setText(`Vida: ${this.playerHealth}`);
      if (this.playerHealth <= 0) {
        // CAMBIO: Se añade itemsCollected al guardar los datos
        submitScore(this.playerName, this.roomsCompleted, this.coins, this.playerHealth, this.itemsCollected);
        this.scene.start('GameOverScene');
      }
      enemy.setVelocityX(enemy.flipX ? 50 : -50);
      // Activa la invulnerabilidad por 2 segundos
      this.setPlayerInvulnerability(2000);
    }
  }
  
  setPlayerInvulnerability(duration) {
    this.player.invulnerable = true;
    // Usa un tween para lograr el efecto de parpadeo
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      yoyo: true,
      repeat: duration / 200,  // Se repite hasta completar el tiempo de invulnerabilidad
      onComplete: () => {
        this.player.alpha = 1;
        this.player.invulnerable = false;
      }
    });
  }  
}

// =======================
// Menu Scene Mejorado   =
// =======================
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fondo semitransparente para el menú
    let graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Título del menú
    this.add.text(200, 50, 'Menú del Juego', { font: '48px Arial', fill: '#fff' });

    // Botón para reiniciar el nivel
    let restartButton = this.add.text(200, 150, 'Reiniciar Nivel', { font: '32px Arial', fill: '#fff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Cierra el menú y reinicia la escena del juego
        this.scene.stop();                      // Detiene el menú
        this.scene.stop('MainGameScene');       // Detiene la escena del juego
        this.scene.start('MainGameScene');      // Reinicia la escena del juego
      });

    // Botón para volver a la selección de personaje
    let selectionButton = this.add.text(200, 250, 'Selección de Personaje', { font: '32px Arial', fill: '#fff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.stop();                            // Detiene el menú
        this.scene.stop('MainGameScene');             // Detiene la escena del juego
        this.scene.start('CharacterSelectScene');     // Inicia la selección
      });
  

    // Botón para ir al Leaderboard
    let leaderboardButton = this.add.text(200, 350, 'Leaderboard', { font: '32px Arial', fill: '#fff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Cierra el menú y cambia a la escena de leaderboard
        this.scene.stop();               // Detiene el menú
        this.scene.stop('MainGameScene');      // Detiene la escena del juego
        this.scene.start('LeaderboardScene');  // Inicia la escena del leaderboard
      });
  }
}

// ==========================
// Game Over Scene Mejorado =
// ==========================
class GameOverScene extends Phaser.Scene {
  constructor() {
      super({ key: 'GameOverScene' });
  }

  create() {
      const { width, height } = this.cameras.main;
      
      // Fondo de degradado
      this.cameras.main.setBackgroundColor('#000');
      let background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
      this.add.tween({
        targets: background,
        alpha: 0.4,
        duration: 2000,
        yoyo: true,
        repeat: -1
      });

      // Título de "Game Over"
      this.add.text(width / 2, height / 4, 'GAME OVER', {
          fontSize: '48px',
          fontFamily: 'Press Start 2P',
          color: '#FF0000',
          stroke: '#FFFFFF',
          strokeThickness: 4
      }).setOrigin(0.5);

      // Botón de reinicio
      let restartButton = this.add.text(width / 2, height / 2, 'RETRY', {
          fontSize: '24px',
          fontFamily: 'Press Start 2P',
          color: '#FFFFFF',
          backgroundColor: '#FF0000',
          padding: { left: 20, right: 20, top: 10, bottom: 10 },
          borderRadius: 15
      }).setOrigin(0.5).setInteractive();

      restartButton.on('pointerdown', () => {
          this.scene.start('MainGameScene');
      });

      // Botón de leaderboard
      let leaderboardButton = this.add.text(width / 2, height / 2 + 50, 'LEADERBOARD', {
          fontSize: '24px',
          fontFamily: 'Press Start 2P',
          color: '#FFFFFF',
          backgroundColor: '#0000FF',
          padding: { left: 20, right: 20, top: 10, bottom: 10 },
          borderRadius: 15
      }).setOrigin(0.5).setInteractive();

      leaderboardButton.on('pointerdown', () => {
          this.scene.start('LeaderboardScene');
      });
  }
}

// =============================
// LeaderboardScene Corregido  =
// =============================
class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  preload() {
    this.load.image('botonAtras', 'assets/boton_atras.png');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000');
  
    // Título de la clasificación
    this.add.text(width / 2, 50, 'SCORE RANKING', {
      fontSize: '32px',
      fontFamily: 'Press Start 2P',
      color: '#FFA500'
    }).setOrigin(0.5);
  
    // Obtener datos de la clasificación
    fetch('http://localhost:3000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          this.add.text(width / 2, height / 2, 'No hay datos disponibles', {
            fontSize: '24px',
            fontFamily: 'Press Start 2P',
            color: '#FFFFFF'
          }).setOrigin(0.5);
          return;
        }
  
        // Mostrar las posiciones en la tabla
        data.forEach((entry, index) => {
          let score = (entry.coins * entry.rooms) + (entry.bosses || 0);
  
          // Posición
          this.add.text(width / 4, 100 + index * 40, `${index + 1}º`, {
            fontSize: '48px',
            color: '#FFFFFF',
            fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
  
          // Puntaje
          this.add.text(width / 2, 100 + index * 40, score, {
            fontSize: '48px',
            color: '#FFFF00',
            fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
  
          // Nombre del jugador
          this.add.text((width / 4) * 3, 100 + index * 40, entry.name, {
            fontSize: '48px',
            color: '#00FFFF',
            fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
        });
      })
      .catch(err => {
        console.error('Error al obtener datos de la clasificación:', err);
        this.add.text(width / 2, height / 2, 'Error al cargar clasificación', {
          fontSize: '24px',
          fontFamily: 'Press Start 2P',
          color: '#FF0000'
        }).setOrigin(0.5);
      });
  
    // Agregar botón de retroceso
    this.addBackButton();
  }
  
  // Método para agregar el botón de retroceso
  addBackButton() {
    const { width, height } = this.cameras.main;
  
    const backButton = this.add.image(width - 50, height - 50, 'botonAtras')
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('CharacterSelectScene'); // Cambia a la escena de selección de personaje
      });
  }    
}

// =============================
// Configuración de Phaser     =
// =============================
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
    MainGameScene,
    MenuScene,
    GameOverScene,
    LeaderboardScene
  ]
};
const game = new Phaser.Game(config);
console.log(`Monedas al final: ${this.coins}`);

// =============================
// Enviar datos al servidor    =
// =============================
function submitScore(playerName, rooms, coins, bosses) {
  console.log(`Enviando: Name=${playerName}, Rooms=${rooms}, Coins=${coins}, Bosses=${bosses}`);
  let score = (coins * rooms) + bosses;
  fetch('http://localhost:3000/api/submitScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName, rooms, coins, bosses, score })
  })
  .then(res => res.json())
  .then(data => console.log("Puntaje enviado:", data))
  .catch(err => console.error(err));
}

function getLeaderboard() {
  fetch('http://localhost:3000/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lbDiv = document.getElementById('leaderboard');
      lbDiv.innerHTML = '<h2>Ranking</h2>';
      data.forEach((entry, index) => {
        lbDiv.innerHTML += `<p>${index + 1}. ${entry.name} - Vidas: ${entry.lives}, Salas: ${entry.rooms}, Monedas: ${entry.coins}</p>`;
      });
    })
    .catch(err => console.error(err));
}

window.submitScore = submitScore;
window.getLeaderboard = getLeaderboard;