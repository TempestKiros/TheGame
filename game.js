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
// MainGameScene (con animaciones adicionales, mecánica de stomp, enemigos, boss y tienda)
// ======================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.roomsCompleted = 0;
    this.coins = 0; // Inicializa la variable de monedas
    this.playerHealth = 5; 
    this.bossesDefeated = 0;
  }

  init(data) {
    this.playerRace = data.race || 'human';
    this.playerName = data.playerName || "Jugador";
    this.roomsCompleted = data.roomsCompleted || 0;
    this.totalCoins = data.totalCoins || 0;
    this.playerHealth = 5;
    this.bossesDefeated = data.bossesDefeated || 0;
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
      this.load.spritesheet('enemy', 'assets/Quimera-Player/IdleEnemy.png', { frameWidth: 572 / 11, frameHeight: 34 });
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
      this.load.spritesheet('enemy', 'assets/Robot-Player/IdleEnemy.png', { frameWidth: 440 / 10, frameHeight: 30 });
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
    // Inicializa banderas para el doble y triple salto
    this.player.doubleJumped = false;
    this.player.tripleJumped = false;
    this.player.canTripleJump = false; // Se activará al comprar la mejora de +Salto
    // Inicializa la bandera de velocidad
    this.player.speedUp = false; // Se activará al comprar la mejora de +Velocidad
    // Inicializa invulnerabilidad si es necesario
    this.player.invulnerable = false;

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

  update() {
    // Velocidad base y comprobación de mejora de velocidad
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
        // Opcionalmente, ajusta la dirección si salta desde una pared
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
        // Si se ha comprado el triple salto y aún no se usó, se permite
        this.player.setVelocityY(-330);
        this.player.tripleJumped = true;
        this.player.anims.play('DoubleJump', true); // O bien, usar una animación específica para triple salto
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
    
    // Lógica de enemigos para seguir al jugador
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
  }  

  spawnPlatforms() {
    let platformPositions = [
      { x: 400, y: 580, scale: 2 },
      { x: 150, y: 450 },
      { x: 400, y: 350 },
      { x: 650, y: 250 }
    ];
    this.platforms.clear(true, true);
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
    this.spawnCoins();
    if (this.door) {
      this.door.destroy();
    }
    this.spawnDoor();
  }

  spawnEnemy() {
    let enemy = this.enemies.create(700, 450, 'enemy');
    enemy.play('enemyWalk');
    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(-50);
  }

  spawnBoss() {
    console.log("¡Boss!");
    // Crear un boss interactivo
    let boss = this.physics.add.sprite(400, 300, 'boss');
    boss.setCollideWorldBounds(true);
    boss.health = 3; // Ejemplo: 3 golpes para derrotarlo
    // Overlap entre jugador y boss
    this.physics.add.overlap(this.player, boss, (player, bossSprite) => {
      if (player.body.velocity.y > 0 && (player.y + player.height * 0.5) < bossSprite.y) {
        bossSprite.health--;
        player.setVelocityY(-200);
        if (bossSprite.health <= 0) {
          bossSprite.destroy();
          this.resetRoom();
        }
      } else {
        this.playerHealth = Math.max(0, this.playerHealth - 1);
        this.healthText.setText(`Vida: ${this.playerHealth}`);
        if (this.playerHealth <= 0) {
          submitScore(this.playerName, this.roomsCompleted, this.coins, this.playerHealth);
          this.scene.start('GameOverScene');
        }
      }
    }, null, this);
    // Si el boss no es derrotado en 10 segundos, se elimina y se reinicia la sala
    this.time.delayedCall(10000, () => {
      if (boss.active) {
        boss.destroy();
        this.resetRoom();
      }
    }, null, this);
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
      // Agrega o cura 1 vida
      this.playerHealth++;
      this.healthText.setText(`Vida: ${this.playerHealth}`);
      console.log('Comprado +Vida');
    });
  
    saltoButton.on('pointerdown', () => {
      // Solo permite comprar una vez
      if (!this.player.canTripleJump) {
        this.player.canTripleJump = true;
        console.log('Comprado +Salto: Triple salto habilitado');
        saltoButton.setText('Triple Salto (Comprado)');
        saltoButton.disableInteractive();
      } else {
        console.log('Triple salto ya comprado');
      }
    });
  
    velocidadButton.on('pointerdown', () => {
      if (!this.player.speedUp) {
        this.player.speedUp = true;
        console.log('Comprado +Velocidad: Velocidad duplicada');
        velocidadButton.setText('Velocidad x2 (Comprado)');
        velocidadButton.disableInteractive();
      } else {
        console.log('Velocidad ya comprada');
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
        submitScore(this.playerName, this.roomsCompleted, this.coins, this.playerHealth);
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

// ======================
// Game Over Scene Mejorado
// ======================
class GameOverScene extends Phaser.Scene {
  constructor() {
      super({ key: 'GameOverScene' });
  }

  create() {
      const { width, height } = this.cameras.main;
      
      this.cameras.main.setBackgroundColor('#000');
      
      this.add.text(width / 2, height / 4, 'GAME OVER', {
          fontSize: '32px',
          fontFamily: 'Press Start 2P',
          color: '#FF0000'
      }).setOrigin(0.5);

      let restartButton = this.add.text(width / 2, height / 2, 'RETRY', {
          fontSize: '20px',
          fontFamily: 'Press Start 2P',
          color: '#FFFFFF',
          backgroundColor: '#FF0000',
          padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5).setInteractive();

      restartButton.on('pointerdown', () => {
          this.scene.start('MainGameScene');
      });

      let leaderboardButton = this.add.text(width / 2, height / 2 + 50, 'LEADERBOARD', {
          fontSize: '20px',
          fontFamily: 'Press Start 2P',
          color: '#FFFFFF',
          backgroundColor: '#0000FF',
          padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5).setInteractive();

      leaderboardButton.on('pointerdown', () => {
          this.scene.start('LeaderboardScene');
      });
  }
}

// ======================
// LeaderboardScene Corregido
// ======================
class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000');

    this.add.text(width / 2, 50, 'SCORE RANKING', {
      fontSize: '24px',
      fontFamily: 'Press Start 2P',
      color: '#FFA500'
    }).setOrigin(0.5);

    fetch('http://localhost:3000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        data.forEach((entry, index) => {
          let score = (entry.coins * entry.rooms) + (entry.bosses || 0);
          this.add.text(width / 4, 100 + index * 30, `${index + 1}º`, {
            fontSize: '20px', color: '#FFFFFF', fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
          this.add.text(width / 2, 100 + index * 30, score, {
            fontSize: '20px', color: '#FFFF00', fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
          this.add.text((width / 4) * 3, 100 + index * 30, entry.name, {
            fontSize: '20px', color: '#00FFFF', fontFamily: 'Press Start 2P'
          }).setOrigin(0.5);
        });
      });
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
    MainGameScene,
    GameOverScene
  ]
};

const game = new Phaser.Game(config);
console.log(`Monedas al final: ${this.coins}`);

// ======================
// Enviar datos al servidor
// ======================
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