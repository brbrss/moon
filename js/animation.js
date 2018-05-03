
const aniNull = {};
aniNull.hide = [];
aniNull.start = () => { };
aniNull.draw = () => { };
aniNull.isComplete = () => true;
aniNull.onComplete = null;


class AniMove {
    constructor(game, troopId, src, dst) {
        this.troop = game.data.troopList.find(e => e.id == troopId);
        this._duration = 200;
        this.src = src;
        this.dst = dst;
        this.hide = [troopId];

        this.onComplete = () => { };
    }

    start() {
        this.startTime = Date.now();
    }
    draw(game) {

        let timeNow = Date.now();
        let aElapsed = (timeNow - this.startTime) / this._duration;
        let aRemaining = (this.startTime + this._duration - timeNow) / this._duration;
        let x = this.dst.x * aElapsed + this.src.x * aRemaining;
        let y = this.dst.y * aElapsed + this.src.y * aRemaining;
        let xy = { x: x, y: y };
        game.scene.view.drawUnitCard(this.troop, xy);
    }

    isComplete() {
        let timeNow = Date.now();
        let tRemaining = this.startTime + this._duration - timeNow;
        return (tRemaining <= 0);
    }

}

class AniAttack {
    constructor(game, attacker, targetXy, dmg) {
        this._duration = 600;
        this.onComplete = Cmd.null;
        this.hide = [];
        this.targetXy = targetXy;
        this.dmg = dmg;
        this.attacker = attacker;
    }
    start() {
        this.startTime = Date.now();
    }
    draw(game) {
        let num = Math.ceil(-this.dmg);
        let s = num.toString();
        let xy = this.targetXy;
        let rFrom = game.scene.view.renderDim(this.attacker.xy);
        let r = game.scene.view.renderDim(xy);
        let ctx = game.scene.view.ctx;

        let timeNow = Date.now();
        let aElapsed = (timeNow - this.startTime) / this._duration;

        ctx.fillStyle = "rgba(255,255,255," + (0.5 - 0.5 * aElapsed).toString() + ")";
        ctx.fillRect(rFrom.x, rFrom.y, rFrom.w, rFrom.h);
        ctx.fillStyle = "rgba(255,0,0," + (0.5 - 0.5 * aElapsed).toString() + ")";
        ctx.fillRect(r.x, r.y, r.w, r.h);

        ctx.font = "20px impact";
        ctx.fillStyle = "pink";
        ctx.strokeStyle = "black";
        ctx.strokeText(s, r.x, r.y - r.h / 2 * aElapsed);
        ctx.fillText(s, r.x, r.y - r.h / 2 * aElapsed);

    }
    isComplete() {
        let timeNow = Date.now();
        let tRemaining = this.startTime + this._duration - timeNow;
        return (tRemaining <= 0);
    }
};

class AniPhony {
    // phony "animation" representing hovering dom
    constructor(domId) {
        this.domId = domId;
        this.hide = [];
        this.onComplete = Cmd.null;
    }
    start() { }
    draw() { }
    isComplete() {
        let dom = document.getElementById(this.domId);
        return (dom == null);
    }
};
