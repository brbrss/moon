"use strict";

class Command {
    constructor(scene) {
        this.scene = scene;
        this.arr = [];
    }
    next(g) {
        if (g != null) {
            this.arr.push(g);
        }
    }
    call() {
        if (this.arr.length == 0) {
            this.scene.addCommand(null);
            return;
        }
        let ffArr = this.arr[0]();
        let newc = new Command(this.scene);
        for (let ff of ffArr) {
            newc.next(ff); // insert
        }
        for (let g of this.arr.slice(1)) {
            newc.next(g);
        }
        this.scene.addCommand(newc);
    }
}


const Cmd = {};

Cmd.null = function () {

}


Cmd.placeTroop = function (game, tileXY, troop, cityId) {
    Model.placeTroop(game, tileXY, troop, cityId);
    game.scene.addCommand(new Command(game.scene));
}

Cmd.move = function (game, troopId, dst) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    let fun = (t) => Model.canStepOn(game, troop, t);
    let seq = aStar(troop.xy, dst, fun);
    let cmd = new Command(game.scene);
    for (let i = 0; i < seq.length; i++) {
        let c = () => Subcmd.moveHelper(game, troopId, seq[i]);
        cmd.next(c);
    }
    cmd.next(() => Model.tryEnterCity(game, troop));
    let cmdEv = () => testEventByType(game, "stepOn", troop);
    cmd.next(cmdEv);
    game.scene.addCommand(cmd);

    troop.status = "moved";
}


Cmd.attack = function (game, attackerId, xy) {
    let attacker = game.data.troopList.find(e => e.id == attackerId);
    let cmd = new Command(game.scene);
    let ar = Subcmd.attack(game, attacker, xy);
    for (let t of ar) {
        cmd.next(t);
    }
    let f = () => {
        Model.troopFinish(game, attacker);
        return [];
    };
    cmd.next(f);
    game.scene.addCommand(cmd);
}

Cmd.finishTurn = function (game) {
    let ar = Subcmd.finishTurn(game);
    let cmd = new Command(game.scene);
    for (let t of ar) {
        cmd.next(t);
    }

    if (game.data.misc.playerId == game.data.misc.hasTurn) {
        game.scene.modePlayer();
        game.scene.addCommand(cmd);
    } else {
        game.scene.modeAi();
        game.scene.addCommand(cmd);
    }
}



Cmd.troopWait = function (game, troopId) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    Model.troopWait(game, troop);
    game.scene.addCommand(new Command(game.scene));
}

Cmd.addBuilding = function (game, cityId, buildingId, charId) {
    Model.addBuilding(game, cityId, buildingId, charId);

    game.scene.addCommand(new Command(game.scene));
}

Cmd.commerce = function (game, cityId, charId) {
    Model.developCommerce(game, cityId, charId);

    game.scene.addCommand(new Command(game.scene));
}

Cmd.supplies = function (game, cityId, charId) {
    Model.makeSupplies(game, cityId, charId);

    game.scene.addCommand(new Command(game.scene));
}

Cmd.production = function (game, cityId, charId, product) {
    Model.makeProduction(game, cityId, charId, product);
    game.scene.addCommand(new Command(game.scene));
}

Cmd.recruit = function (game, cityId, charId) {
    Model.recruit(game, cityId, charId);
    game.scene.addCommand(new Command(game.scene));
}

Cmd.moveChar = function (game, charId, targetCityId) {
    Model.moveChar(game, charId, targetCityId);
    game.scene.addCommand(new Command(game.scene));
}

Cmd.hire = function (game, charId1, charId2) {
    let c = () => {
        fireEventById(3)(game, charId1, charId2);
        return [];
    }
    let cmd = new Command(game.scene);
    cmd.next(c);
    game.scene.addCommand(cmd);
}
