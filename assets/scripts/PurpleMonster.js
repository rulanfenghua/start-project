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

    // 主角跳跃高度
    jumpHeight: 0,
    // 主角跳跃持续时间
    jumpDuration: 0,
    // 辅助形变动作时间
    squashDuration: 0,
    // 最大移动速度
    maxMoveSpeed: 0,
    // 加速度
    accel: 0,
    
    jumpAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.enabled = false

    // 加速度方向开关
    this.accLeft = false
    this.accRight = false
    // 主角当前水平方向速度
    this.xSpeed = 0

    this.minPosX = -this.node.parent.width / 2
    this.maxPosX = this.node.parent.width / 2

    // 初始化跳跃动作
    this.jumpAction = this.setJumpAction()

    // 初始化键盘输入监听
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)

    var touchReceiver = cc.Canvas.instance.node
    touchReceiver.on('touchstart', this.onTouchStart, this)
    touchReceiver.on('touchend', this.onTouchEnd, this)
  },
  onDestroy() {
    // 取消键盘输入监听
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)

    var touchReceiver = cc.Canvas.instance.node
    touchReceiver.off('touchstart', this.onTouchStart, this)
    touchReceiver.off('touchend', this.onTouchEnd, this)
  },

  onKeyDown(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = true
        this.accRight = false
        break
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = true
        this.accLeft = false
        break
    }
  },
  onKeyUp(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = false
        break
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = false
        break
    }
  },
  onTouchStart(event) {
    var touchLoc = event.getLocation()
    var vec2 = this.node.convertToWorldSpaceAR(this.node.position)
    if (touchLoc.x >= vec2.x) {
      this.accRight = true
      this.accLeft = false
    } else {
      this.accLeft = true
      this.accRight = false
    }
  },
  onTouchEnd(event) {
    this.accLeft = false
    this.accRight = false
  },

  setJumpAction() {
    // 跳跃上升
    var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut())
    // 下落
    var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn())
    // 形变
    var squash = cc.scaleTo(this.squashDuration, 1, 0.6)
    var stretch = cc.scaleTo(this.squashDuration, 1, 1.2)
    var scaleBack = cc.scaleTo(this.squashDuration, 1, 1)

    var callback = cc.callFunc(this.playJumpSound, this)
    // 不断重复
    return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, jumpDown, scaleBack, callback))
  },
  playJumpSound() {
    cc.audioEngine.playEffect(this.jumpAudio, false)
  },

  getCenterPos() {
    var centerPos = cc.v2(this.node.x, this.node.y + this.node.height / 2)
    return centerPos
  },
  startMoveAt(pos) {
    this.enabled = true
    this.xSpeed = 0
    this.node.setPosition(pos)
    this.node.runAction(this.setJumpAction())
  },
  stopMove() {
    this.node.stopAllActions()
  },

  start() {

  },

  update(dt) {
    if (this.accLeft) {
      this.xSpeed -= this.accel * dt
    } else if (this.accRight) {
      this.xSpeed += this.accel * dt
    }

    if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
      // if speed reach limit, use max speed with current direction 给予一个正确方向
      this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed)
    }

    this.node.x += this.xSpeed * dt

    if (this.node.x > this.node.parent.width / 2) {
      this.node.x = this.node.parent.width / 2
      this.xSpeed = 0
    } else if (this.node.x < -this.node.parent.width / 2) {
      this.node.x = -this.node.parent.width / 2
      this.xSpeed = 0
    }
  }
})
