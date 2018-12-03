// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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

    pickRadius: 0
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.enabled = false
  },

  init(game) {
    this.game = game
    this.enabled = true
    this.node.opacity = 255
  },
  reuse(game) {
    this.init(game)
  },

  getPlayerDistance() {
    var playerPos = this.game.player.getCenterPos()
    var dist = this.node.position.sub(playerPos).mag()
    return dist
  },

  onPicked() {
    var pos = this.node.getPosition()
    this.game.gainScore(pos)

    this.game.despawnStar(this.node)
  },

  start() {

  },

  update(dt) {
    if (this.getPlayerDistance() < this.pickRadius) {
      this.onPicked()
      return
    }

    var opacityRatio = 1 - this.game.timer / this.game.starDuration
    var minOpacity = 50
    this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity))
  }
})
