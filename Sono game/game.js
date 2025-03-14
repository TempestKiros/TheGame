// ======================
// IntroScene
// ======================
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }
  preload() {
    this.load.image('Fondo', 'assets/Fondo/fondo.jpg');
  }
  create() {
    this.physics.world.createDebugGraphic();
    this.add.image(400, 300, 'Fondo');
    this.input.keyboard.once('keydown', () => {
      this.scene.start('MainGameScene');
    });
  }
}

// =========================================================================================
// MainGameScene
// Se generan 2 grupos de cartas: 5 para la banca (arriba, inicialmente con dorso) y 5 para el jugador (abajo).
// Al pulsar la carta seleccionada se mueve al centro, se le da la vuelta y, al terminar, ambas se descartan hacia la derecha.
// Se obtiene un punto si la carta del jugador es mayor que la de la banca, con la única excepción: el Joker (que gana a todo, excepto al AS (cartaAS))
// El juego finaliza cuando se han jugado todas las cartas)
// =========================================================================================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.scoreJugador = 0;
    this.scoreBanca = 0;
  }

  init(data) {
    this.scoreJugador = 0;
    this.scoreBanca = 0;
  }  
  
  preload() {
    this.load.image('cartaAS', 'assets/Cartas/1.png');
    this.load.image('carta2', 'assets/Cartas/2.png');
    this.load.image('carta3', 'assets/Cartas/3.png');
    this.load.image('carta4', 'assets/Cartas/4.png');
    this.load.image('dorso', 'assets/Cartas/dorso.png');
    this.load.image('Joker', 'assets/Cartas/joker.png');
    this.load.image('FondoTablero', 'assets/Fondo/fondoTablero.jpg');
  }
  
  create() {
    this.add.image(400, 300, 'FondoTablero');
    // Crear las cartas del jugador (abajo)
    const cartasJugador = ['cartaAS', 'carta2', 'carta3', 'carta4', 'Joker'];
    this.cartasAbajo = this.add.group();
    cartasJugador.forEach((carta, index) => {
      let sprite = this.add.sprite(150 + index * 100, 500, carta).setInteractive();
      sprite.setScale(0.5);
      sprite.cardIndex = index; // Almacenar el índice para correlacionar con la carta de la banca
      sprite.on('pointerdown', () => this.seleccionarCarta(sprite));
      this.cartasAbajo.add(sprite);
    });
  
    // Crear las cartas del oponente (la banca, arriba) con el dorso visible
    this.cartasArriba = this.add.group();
    for (let i = 0; i < 5; i++) {
      let sprite = this.add.sprite(150 + i * 100, 100, 'dorso').setScale(0.5);
      sprite.cardIndex = i;
      this.cartasArriba.add(sprite);
    }
  
    // Mostrar la puntuación de la banca en la parte superior, dentro de una imagen de dorso
    this.add.image(700, 100, 'dorso').setScale(0.5);
    this.puntosBancaText = this.add.text(700, 100, '0', { fontSize: '32px', fill: 'purple' });
    this.puntosBancaText.setOrigin(0.5);
  
    // Mostrar la puntuación del jugador en la parte inferior, dentro de una imagen de dorso
    this.add.image(700, 500, 'dorso').setScale(0.5);
    this.puntosJugadorText = this.add.text(700, 500, '0', { fontSize: '32px', fill: 'purple' });
    this.puntosJugadorText.setOrigin(0.5);
  
    // Barajar y asignar cartas a la banca (se utiliza una copia del array de cartas del jugador)
    this.cartasBanca = Phaser.Utils.Array.Shuffle(cartasJugador.slice());
  
    // Asignar eventos de teclado para seleccionar cartas (se agregan listeners adicionales para mayor compatibilidad)
    this.input.keyboard.on('keydown-ONE', () => { this.seleccionarCartaByIndex(0); });
    this.input.keyboard.on('keydown-1', () => { this.seleccionarCartaByIndex(0); });
    
    this.input.keyboard.on('keydown-TWO', () => { this.seleccionarCartaByIndex(1); });
    this.input.keyboard.on('keydown-2', () => { this.seleccionarCartaByIndex(1); });
    
    this.input.keyboard.on('keydown-THREE', () => { this.seleccionarCartaByIndex(2); });
    this.input.keyboard.on('keydown-3', () => { this.seleccionarCartaByIndex(2); });
    
    this.input.keyboard.on('keydown-FOUR', () => { this.seleccionarCartaByIndex(3); });
    this.input.keyboard.on('keydown-4', () => { this.seleccionarCartaByIndex(3); });
    
    this.input.keyboard.on('keydown-FIVE', () => { this.seleccionarCartaByIndex(4); });
    this.input.keyboard.on('keydown-5', () => { this.seleccionarCartaByIndex(4); });
  }
  
  seleccionarCartaByIndex(index) {
    let sprite = this.cartasAbajo.getChildren()[index];
    if (sprite && sprite.input && sprite.input.enabled) {
      this.seleccionarCarta(sprite);
    }
  }
  
  seleccionarCarta(cartaJugador) {
    // Deshabilitar la interacción de la carta seleccionada
    cartaJugador.disableInteractive();
  
    // Obtener el índice para correlacionar con la carta de la banca
    let index = cartaJugador.cardIndex;
  
    // Seleccionar la carta de la banca correspondiente (aleatorizando el orden)
    let cartaBancaKey = this.cartasBanca.pop();
    let spriteBanca = this.cartasArriba.getChildren().find(child => child.cardIndex === index);
    if (!spriteBanca) {
      console.error("No se encontró la carta de la banca para el índice:", index);
      return;
    }
  
    // Definir el centro de la pantalla y un offset para separar las cartas (mínimo 5px)
    const centerX = 400;
    const centerY = 300;
    const offset = 50;

    // Animar el movimiento de las cartas hacia el centro, separadas
    // Se usan dos tweens que se ejecutan en paralelo
    this.tweens.add({
      targets: cartaJugador,
      x: centerX - offset,
      y: centerY,
      duration: 1200,
      ease: 'Power2'
    });
    this.tweens.add({
      targets: spriteBanca,
      x: centerX + offset,
      y: centerY,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        // Una vez posicionadas, se muestra la carta de la banca cambiando su textura
        spriteBanca.setTexture(cartaBancaKey);
  
        // Comparar las cartas y actualizar la puntuación
        let valorJugador = this.obtenerValorCarta(cartaJugador.texture.key);
        let valorBanca = this.obtenerValorCarta(cartaBancaKey);
  
        // Lógica: el Joker (valor 5) gana a todo, excepto al AS (valor 1)
        if ((valorJugador === 5 && valorBanca === 1) || (valorJugador > valorBanca && !(valorJugador === 1 && valorBanca === 5))) {
          this.scoreJugador++;
        } else if (valorJugador !== valorBanca) {
          this.scoreBanca++;
        }
  
        // Actualizar los textos de puntuación
        this.puntosJugadorText.setText(this.scoreJugador);
        this.puntosBancaText.setText(this.scoreBanca);
  
        // Animar el descarte de ambas cartas hacia la derecha
        this.tweens.add({
          targets: [cartaJugador, spriteBanca],
          x: '+=200',
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            // Destruir los sprites descartados
            cartaJugador.destroy();
            spriteBanca.destroy();
  
            // Si se han jugado todas las cartas, finalizar el juego
            if (this.cartasBanca.length === 0) {
              this.finDelJuego();
            }
          }
        });
      }
    });
  }
  
  obtenerValorCarta(nombreCarta) {
    switch (nombreCarta) {
      case 'cartaAS': return 1;
      case 'carta2': return 2;
      case 'carta3': return 3;
      case 'carta4': return 4;
      case 'Joker': return 5;
      default: return 0;
    }
  }
  
  finDelJuego() {
    let mensaje = 'Empate';
    if (this.scoreJugador > this.scoreBanca) {
      mensaje = '¡Ganaste!';
    } else if (this.scoreJugador < this.scoreBanca) {
      mensaje = 'Perdiste';
    }
  
    this.add.text(400, 300, mensaje, { fontSize: '48px', fill: '#FFFFFF' }).setOrigin(0.5);
  
    // Botón para reiniciar el juego
    this.input.keyboard.once('keydown-SPACE', () => {this.scene.restart();});
    let botonReiniciar = this.add.text(400, 400, 'Reiniciar', { fontSize: '32px', fill: '#0f0' })
      .setOrigin(0.5)
      .setInteractive();
    botonReiniciar.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}

// ==========================
// Game Over Scene Mejorado
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

    // Título "GAME OVER"
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
  }
}

// =============================
// Configuración de Phaser
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
    MainGameScene,
    GameOverScene,
  ]
};

const game = new Phaser.Game(config);
console.log("Juego iniciado");
