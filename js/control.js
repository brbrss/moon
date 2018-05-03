"use strict";

function _clickXY(evt, canvas) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / canvas.clientWidth * canvas.width,
        y: evt.clientY - rect.top / canvas.clientHeight * canvas.height
    };
}

function minimapClick(ev, scene) {
    let pxXY = _clickXY(ev, scene.minimap.canvas);
    let x = scene.minimap.toMapX(pxXY.x);
    let y = scene.minimap.toMapY(pxXY.y);
    scene.view.camera = { x: x, y: y };
}

function handleKeydown(ev, scene) {
    const keyName = ev.key;
    const step = 0.25;
    if (keyName == "ArrowUp") {
        scene.view.camera.y -= step;
    } else if (keyName == "ArrowDown") {
        scene.view.camera.y += step;
    } else if (keyName == "ArrowLeft") {
        scene.view.camera.x -= step;
    } else if (keyName == "ArrowRight") {
        scene.view.camera.x += step;
    }
}

function handleMousemove(ev, scene) {
    let pxXY = _clickXY(ev, scene.view.ctx.canvas);
    const step = 0.25;
    let rX = pxXY.x / scene.view.ctx.canvas.width;
    let rY = pxXY.y / scene.view.ctx.canvas.height;
    //console.log("mouse",rX,rY);

    if (rX > 1) {
        scene.view.pointed = null;
        return;
    }
    if (rY > 1) {
        scene.view.pointed = null;
        return;
    }
    if (rY < 0.05) {
        scene.view.camera.y -= step;
    } else if (rY > 0.95) {
        scene.view.camera.y += step;
    } else if (rX < 0.05) {
        scene.view.camera.x -= step;
    } else if (rX > 0.95) {
        scene.view.camera.x += step;
    }
    scene.view.pointed = scene.view.tilePointed(pxXY);
}

function handleMousedown(ev, scene) {
    let pxXY = _clickXY(ev, scene.view.ctx.canvas);
    let xy = scene.view.tilePointed(pxXY);
    if (scene.control.type == "default") {
        defaultClick(xy, scene.game, pxXY, ev.button);
    } else if (scene.control.type == "custom") {
        customClick(xy,
            scene.game,
            pxXY,
            ev.button,
            scene.control.leftFun,
            scene.control.rightFun);
    }
}

function defaultClick(tileXY, game, pxXY, button) {
    clearMenu();
    clearCityTable();
    if (button != 0) {
        return;
    }
    for (let city of game.data.cityList) {
        let arr = cityTiles(city);
        if (arr.some(t => (equalCoord(t, tileXY)))) {
            cityTable(game, city.id);
            cityMenu(pxXY, game, city.id);
        }
    }
    for (let troop of game.data.troopList) {
        if (equalCoord(troop.xy, tileXY)) {
            troopMenu(pxXY, game, troop.id);
        }
    }
}

function customClick(tileXY, game, pxXY, button, leftFun, rightFun) {
    game.scene.control = defaultControl;
    if (button == 0) {
        leftFun(tileXY, game, pxXY);
    } else if (button == 3) {
        rightFun(tileXY, game, pxXY);
    }
}

const defaultControl = { type: "default" };


const observerControl =
    {
        type: "custom",
        leftFun: () => { },
        rightFun: () => { },
        highlight: () => { }
    };

function placeTroopControl(game, troop, cityId) {
    function leftFun(tile, _game, px) {
        return Cmd.placeTroop(_game, tile, troop, cityId);
    }
    let arr = Model.validPlaceTroop(game.data, troop, cityId);
    function highlight(xy, view) {
        if (arr.some(param => equalCoord(param, xy))) {
            markMove(xy, view);
        }
    }
    let control = {
        type: "custom",
        leftFun: leftFun,
        rightFun: () => { },
        highlight: highlight
    };
    return control;
}

function troopMoveControl(game, troopId) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    let arr = Model.movementRange(game, troop);

    function leftFun(xy, _game, px) {
        if (arr.some(param => equalCoord(param, xy))) {
            Cmd.move(_game, troopId, xy);
        }
    }

    function highlight(xy, view) {
        if (arr.some(param => equalCoord(param, xy))) {
            markMove(xy, view);
        }
    }
    let control = {
        type: "custom",
        leftFun: leftFun,
        rightFun: () => { },
        highlight: highlight
    };
    return control;
}

function troopAttackControl(game, troopId) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    let rangeArr = Model.attackRange(game, troop);

    function leftFun(xy, _game, px) {
        if (!rangeArr.some(e => equalCoord(e, xy))) {
            return;
        }
        //let target = game.data.troopList.find(e=>equalCoord(e.xy,xy));
        if (Model.validAttackTile(game, troop, xy)) {
            Cmd.attack(_game, troopId, xy);
        }

    }
    function highlight(xy, view) {
        if (!rangeArr.some(param => equalCoord(param, xy))) {
            return;
        }
        //let target = game.data.troopList.find(e=>equalCoord(e.xy,xy));

        if (Model.validAttackTile(game, troop, xy)) {
            markAttackTarget(xy, view);
            return;
        }
        markAttackRange(xy, view);
    }
    let control = {
        type: "custom",
        leftFun: leftFun,
        rightFun: () => { },
        highlight: highlight
    };
    return control;
}
