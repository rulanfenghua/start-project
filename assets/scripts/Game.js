// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const Player = require('PurpleMonster')
const ScoreFX = require('ScoreFX')
const Star = require('Star')

cc.Class({
  extends: cc.Component,

  properties: {
    // foo: {
    //     // ATTRIBUTES:
    //     default: null,        // The default value will be used only when the component attaching
    //                           // to a node for the first time
    //     type: cc.SpriteFrame, // optional, default is typeof default
    //     serializable: true,   // optional, default is true
    // },
    // bar: {
    //     get () {
    //         return this._bar;
    //     },
    //     set (value) {
    //         this._bar = value;
    //     }
    // },

    starPrefab: {
      default: null,
      type: cc.Prefab
    },
    scoreFXPrefab: {
      default: null,
      type: cc.Prefab
    },

    maxStarDuration: 0,
    minStarDuration: 0,
    ground: {
      default: null,
      type: cc.Node
    },

    player: {
      default: null,
      type: Player
    },

    scoreDisplay: {
      default: null,
      type: cc.Label
    },
    scoreAudio: {
      default: null,
      type: cc.AudioClip
    },

    btnNode: {
      default: null,
      type: cc.Node
    },
    gameOverNode: {
      default: null,
      type: cc.Node
    },
    controlHintLabel: {
      default: null,
      type: cc.Label
    },
    keyboardHint: {
      default: '',
      multiline: true
    },
    touchHint: {
      default: '',
      multiline: true
    }
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.timer = 0
    this.starDuration = 0

    this.groundY = this.ground.y + this.ground.height / 2

    this.currentStar = null
    this.currentStarX = 0

    this.enabled = false

    var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint
    this.controlHintLabel.string = hintText

    this.starPool = new cc.NodePool('Star')
    this.scorePool = new cc.NodePool('ScoreFX')
  },

  onStartGame() {
    this.resetScore()
    this.enabled = true
    this.btnNode.x = 3000
    this.gameOverNode.active = false
    this.player.startMoveAt(cc.v2(0, this.groundY))
    this.spawnNewStar()
  },

  // 生成星星
  spawnNewStar() {
    var newStar = null

    if (this.starPool.size() > 0) {
      newStar = this.starPool.get(this)
    } else {
      newStar = cc.instantiate(this.starPrefab)
    }

    this.node.addChild(newStar)
    newStar.setPosition(this.getNewStarPosition())

    newStar.getComponent('Star').init(this)

    this.startTimer()
    this.currentStar = newStar

    // this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration)
    // this.timer = 0

    // newStar.getComponent('Star').game = this
  },
  despawnStar(star) {
    this.starPool.put(star)
    this.spawnNewStar()
  },
  startTimer() {
    this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration)
    this.timer = 0
  },

  getNewStarPosition() {
    if (!this.currentStar) {
      this.currentStarX = (Math.random() - 0.5) * 2 * this.node.width / 2
    }

    var randX = 0
    var randY = this.groundY + Math.random() * this.player.jumpHeight + 50
    var maxX = this.node.width / 2
    if (this.currentStarX >= 0) {
      randX = -Math.random() * maxX
    } else {
      randX = Math.random() * maxX
    }
    this.currentStarX = randX
    return cc.v2(randX, randY)
  },

  gainScore(pos) {
    this.score += 1
    this.scoreDisplay.string = 'Score: ' + this.score

    var fx = this.spawnScoreFX()
    this.node.addChild(fx.node)
    fx.node.setPosition(pos)
    fx.play()

    cc.audioEngine.playEffect(this.scoreAudio, false)
  },
  resetScore() {
    this.score = 0
    this.scoreDisplay.string = 'Score: ' + this.score.toString()
  },
  spawnScoreFX() {
    var fx
    if (this.scorePool.size() > 0) {
      fx = this.scorePool.get()
      return fx.getComponent('ScoreFX')
    } else {
      fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX')
      fx.init(this)
      return fx
    }
  },
  despawnScoreFX(scoreFX) {
    this.scorePool.put(scoreFX)
  },

  start() {

  },

  update(dt) {
    if (this.timer > this.starDuration) {
      this.gameOver()
      this.enabled = false
      return
    }

    this.timer += dt
  },

  gameOver() {
    this.gameOverNode.active = true
    this.player.enabled = false
    this.player.stopMove()
    this.currentStar.destroy()
    this.btnNode.x = 0
  }
})
