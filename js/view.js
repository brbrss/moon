"use strict";

function _draw2(ctx, img, src, dst) {
    ctx.drawImage(img,
        src.x, src.y, src.w, src.h,
        dst.x, dst.y, dst.w, dst.h);
}

function _draw1(ctx, img, dst) {
    ctx.drawImage(img,
        dst.x, dst.y, dst.w, dst.h);
}

function draw() {
    if (arguments.length == 4) {
        return _draw2(arguments[0], arguments[1], arguments[2], arguments[3]);
    } else if (arguments.length == 3) {
        return _draw1(arguments[0], arguments[1], arguments[2]);
    }
}

class MainScene {
    constructor(game) {
        this.game = game;
        this.view = new GameView(game);

        this.keyListener = (ev) => handleKeydown(ev, this);
        this.mousemoveListener = (ev) => handleMousemove(ev, this);
        this.mousedownListener = (ev) => handleMousedown(ev, this);
        this.minimapListener = ev => minimapClick(ev, this);
        this.control = defaultControl;

        this.requestId = null;
        this.ani = aniNull;

        this.mode = "player";

        this.eventList = [];

    }


    start() {
        this.minimap = new MiniMap(this.game);
        hud(this.game);
        this.addListener();
        this.requestId = requestAnimationFrame(() => this.render());
    }

    stop() {
        cancelAnimationFrame(this.requestId);
        this.removeListener();
        this.view.ctx.clearRect(0, 0, this.view.ctx.canvas.clientWidth, this.view.ctx.canvas.clientHeight);
        uiClearAll();
    }

    addListener() {
        let elem = this.view.ctx.canvas;
        document.addEventListener('keydown', this.keyListener);
        elem.addEventListener('mousemove', this.mousemoveListener);
        elem.addEventListener("mousedown", this.mousedownListener);

        this.minimap.canvas.addEventListener('mousedown', this.minimapListener);
    }

    removeListener() {
        let elem = this.view.ctx.canvas;
        document.removeEventListener('keydown', this.keyListener);
        elem.removeEventListener('mousemove', this.mousemoveListener);
        elem.removeEventListener("mousedown", this.mousedownListener);

        this.minimap.canvas.removeEventListener('mousedown', this.minimapListener);
    }

    render() {
        this.update();
        this.view.render(this.control, this.ani);
        this.minimap.render(this.game);
        this.requestId = requestAnimationFrame(() => this.render());
    }

    update() {
        if (this.ani.isComplete()) {
            if (this.ani !== aniNull && this.mode == "player") {
                this.control = defaultControl;
                uiActivate();
            }
            let _fun = this.ani.onComplete;
            this.ani = aniNull;
            this.ani.onComplete = null;
            if (_fun != null) {
                _fun.call();
                updateCityTable(this.game);
                displayFaction(this.game);
            }
        }
    }

    addAnimation(ani) {
        this.ani = ani;
        ani.onComplete = null;
        ani.start();
        this.control = observerControl;
        uiDeactivate();
    }

    addCommand(command) {
        let c = command;
        if (this.mode == "ai" && command == null) {
            c = () => this.generateAiCommand();
        }
        this.ani.onComplete = c;
    }

    generateAiCommand() {
        let c = ai(this.game);
        this.addCommand(c);
    }

    modeAi() {
        this.mode = "ai";
    }

    modePlayer() {
        this.mode = "player";
        this.control = defaultControl;
        uiActivate();
    }

    addGameEvent(ev) {
        this.eventList.push(ev);
    }

    pollEvent() {
        let boolPollNext = true;
        while (boolPollNext) {
            let ev = this.eventList.shift();
            if (ev != null) {
                boolPollNext = ev();
            } else {
                evtCleanup(this.game);
                return;
            }
        }
    }
};

class GameView {
    constructor(game) {
        this.game = game;

        let c = document.getElementById("mainCanvas");
        this.ctx = c.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.tileset = game.asset.getImage("tileset");
        if (this.tileset.naturalWidth == 0) {
            throw Error("Tileset not correctly loaded.");
        }

        this.camera = { x: 5, y: 5 };
        this.tileWH = { w: 64, h: 64 };
        this.origin = { x: 400, y: 300 };
        this.pointed = null;

        this.sheetWidth = this.tileset.naturalWidth;
        this.sheetHeight = this.tileset.naturalHeight;
        this.unitWidth = 32;
        this.unitHeight = 32;
    }

    dim(n) {
        let perRow = this.sheetWidth / this.unitWidth;
        let x = n % perRow;
        let y = Math.trunc(n / perRow);

        let r = {};
        r.x = this.unitWidth * x;
        r.y = this.unitHeight * y;
        r.w = this.unitWidth;
        r.h = this.unitHeight;
        return r;
    }


    renderDim(tileXY) {
        let r = {};
        r.x = (tileXY.x - this.camera.x) * this.tileWH.w + this.origin.x;
        r.y = (tileXY.y - this.camera.y) * this.tileWH.h + this.origin.y;
        r.w = this.tileWH.w;
        r.h = this.tileWH.h;
        //console.log(r);
        return r;
    }

    rangeInView() {
        let viewW = this.ctx.canvas.clientWidth;
        let viewH = this.ctx.canvas.clientHeight;
        let pxLeft = this.origin.x;
        let pxRight = viewW - this.origin.y;
        let pxUp = this.origin.y;
        let pxDown = viewH - this.origin.y;

        let result = {};
        result.left = this.camera.x - pxLeft / this.tileWH.w;
        result.right = this.camera.x + pxRight / this.tileWH.w;
        result.up = this.camera.y - pxUp / this.tileWH.h;
        result.down = this.camera.y + pxDown / this.tileWH.h;
        return result;
    }

    tilePointed(xy) {
        let pxRight = xy.x - this.origin.x;
        let tileX = this.camera.x + pxRight / this.tileWH.w;
        tileX = Math.floor(tileX);
        let pxDown = xy.y - this.origin.y;
        let tileY = this.camera.y + pxDown / this.tileWH.h;
        tileY = Math.floor(tileY);
        return { x: tileX, y: tileY };
    }

    renderTile(mapJson) {

        let nrow = mapJson.height;
        let ncol = mapJson.width;
        let box = this.rangeInView();
        for (let i = Math.floor(box.left); i < Math.ceil(box.right); i++) {
            for (let j = Math.floor(box.up); j < Math.ceil(box.down); j++) {
                let n = j * ncol + i;
                for (let k = mapJson["layers"].length - 1; k >= 0; k--) {
                    let tileId = mapJson["layers"][k].data[n] - 1; // XXX -1 ?
                    let r1 = this.dim(tileId);
                    let xy = {};
                    xy.x = n % nrow;
                    xy.y = Math.trunc(n / nrow);
                    let r2 = this.renderDim(xy);
                    draw(this.ctx, this.tileset, r1, r2);
                }
            }
        }
    }

    drawCity(city, asset) {
        let xy = city.xy;
        let img = asset.getImage("castle");
        this.drawOnTile(xy, img, 2, 2);

        let r = this.renderDim(xy);

        let faction = this.game.data.factionList[city.factionId];
        let manpower = city.manpower.toString();

        this.ctx.font = "18px SimHei";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.strokeStyle = "#000000";

        this.ctx.textBaseline = "hanging";

        this.ctx.fillText(faction.name, r.x + 10, r.y + 4);
        //this.ctx.strokeText(faction.name, r.x + 10, r.y+4);                     
        this.ctx.fillText(city.name, r.x + 10, r.y + 25);
        //this.ctx.strokeText(city.name, r.x + 10, r.y+25);
        this.ctx.fillText(manpower, r.x + 10, r.y + 46);
        //this.ctx.strokeText(manpower, r.x + 10, r.y+46);
    }

    drawUnitCard(troop, xy) {
        //let xy = troop.xy;
        let charId = troop.leaderId;
        let faction = this.game.data.factionList.find(e => e.id == troop.factionId);
        let troopChar = this.game.data.charList[charId];
        let head = this.game.asset.getImage(troopChar.img);

        // tile dim
        let rbase = this.renderDim(xy);

        // card border
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.strokeRect(rbase.x, rbase.y, rbase.w, rbase.h);

        // background
        this.ctx.fillStyle = "rgba(85,85,155,0.9)";
        this.ctx.fillRect(rbase.x, rbase.y, rbase.w, rbase.h);

        // flag color
        this.ctx.fillStyle = faction.color;
        this.ctx.fillRect(rbase.x, rbase.y, rbase.w, 14);

        // portrait
        this.ctx.drawImage(head, rbase.x, rbase.y + 14, rbase.w - 14, rbase.h - 14);

        // text
        this.ctx.font = "13px SimHei";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.textBaseline = "hanging";

        let strength = troop.strength.toString();
        this.ctx.fillText(strength, rbase.x + 2, rbase.y - 15);

        let unitType = troop.type;
        let textType = this.game.common.unitTypes.find(e => e.name == unitType).name;
        this.ctx.fillText(textType, rbase.x + 40, rbase.y);

    }
    drawOnTile(xy, img, nRight, nDown) {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        let rbase = this.renderDim(xy);
        let r = {};
        r.x = rbase.x;
        r.y = rbase.y;
        r.w = this.tileWH.w * nRight;
        r.h = this.tileWH.h * nDown;

        draw(this.ctx, img, r);
    }


    highlight(control) {
        if (control.type != "default") {
            let box = this.rangeInView();
            for (let i = Math.floor(box.left); i < Math.ceil(box.right); i++) {
                for (let j = Math.floor(box.up); j < Math.ceil(box.down); j++) {
                    let xy = { x: i, y: j };
                    control.highlight(xy, this);
                }
            }
        }

        if (this.pointed == null) {
            return;
        }
        let r = this.renderDim(this.pointed);
        this.ctx.fillStyle = "#00FFFF50";
        this.ctx.fillRect(r.x, r.y, r.w, r.h);
        this.ctx.strokeStyle = "#00FFFF";
        this.ctx.strokeRect(r.x, r.y, r.w, r.h);

    }

    _renderMap() {
        let mapData = this.game.data.map;
        this.renderTile(mapData);
    }

    _renderCity() {
        for (let city of this.game.data.cityList) {
            this.drawCity(city, this.game.asset);
        }
    }

    _renderDecor() {
        for (let t of this.game.data.decor) {
            let xy = { x: t.x, y: t.y };
            let img = this.game.asset.getImage(t.img);
            this.drawOnTile(xy,img,t.w,t.h);
        }
    }

    _renderTroop(hide) {
        for (let t of this.game.data.troopList) {
            function f(tt) {
                return tt == t.id;
            }
            if (!hide.some(f)) {
                this.drawUnitCard(t, t.xy);
            }
        }
    }

    render(control, customAnimation) {
        let game = this.game;
        this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        // draw
        this._renderMap();

        this._renderCity();

        this._renderDecor();

        this._renderTroop(customAnimation.hide);


        customAnimation.draw(game);


        this.highlight(control);

    }


};

class MiniMap {
    constructor(game) {
        this.mapH = game.data.map.height;
        this.mapW = game.data.map.width;
        this.canvas = document.createElement("canvas");
        let root = document.getElementById("root");
        root.appendChild(this.canvas);
        this.canvas.id = "minimap";
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext("2d");

    }
    render(game) {
        this.ctx.fillStyle = "#CCCCCC";
        this.ctx.fillRect(0, 0, 200, 200);
        this.ctx.strokeStyle = "black";
        for (let city of game.data.cityList) {
            let col = game.data.factionList.find(e => e.id == city.factionId).color;
            let x = city.xy.x / this.mapW * this.canvas.width;
            let y = city.xy.y / this.mapH * this.canvas.height;
            let w = 8;
            let h = 8;
            this.ctx.fillStyle = col;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeRect(x, y, w, h);
        }
        for (let troop of game.data.troopList) {
            let col = game.data.factionList.find(e => e.id == troop.factionId).color;
            let x = troop.xy.x / this.mapW * this.canvas.width;
            let y = troop.xy.y / this.mapH * this.canvas.height;
            let w = 4;
            let h = 4;
            this.ctx.fillStyle = col;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeRect(x, y, w, h);
        }
        this._renderViewRange(game);
    }

    _renderViewRange(game) {
        let r = game.scene.view.rangeInView();
        let x = this.toCanvasX(r.left);
        let y = this.toCanvasY(r.up);
        let w = this.toCanvasX(r.right - r.left);
        let h = this.toCanvasY(r.down - r.up);
        this.ctx.strokeStyle = "#000000";
        this.ctx.strokeRect(x, y, w, h);
    }

    toCanvasX(mapX) {
        return mapX / this.mapW * this.canvas.width;
    }

    toCanvasY(mapY) {
        return mapY / this.mapH * this.canvas.height;
    }

    toMapX(canvasX) {
        return Math.round(canvasX * this.mapW / this.canvas.width);
    }
    toMapY(canvasY) {
        return Math.round(canvasY * this.mapH / this.canvas.height);
    }
};
