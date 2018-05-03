"use strict";

const Subcmd = {};


Subcmd.moveHelper = function (game, troopId, dst) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    let src = troop.xy;
    Model.moveTroop(game, troopId, dst);

    let ani = new AniMove(game, troopId, src, dst);
    game.scene.addAnimation(ani);

    let ar = [];
    let bar = Model.filterBuff(troop, "afterMove");
    for (let b of bar) {
        let g = () => Buff[b.id].afterMove(game, troop, b, src);
        ar.push(g);
    }
    return ar;
}

Subcmd.checkDestroyed = function (game, troop) {
    let arr = [];
    if (troop.strength <= 0) {
        let c = () => testEventByType(game, "troopDestroyed", troop);
        Model.destroyTroop(game, troop);
        arr.push(c);
    }
    return arr;
}

Subcmd.attackTroop = function (game, attacker, defender) {
    if (attacker.strength <= 0) {
        return [];
    }
    let dmg = Model.calcTroopDamage(game, attacker, defender);

    let ani = new AniAttack(game, attacker, defender.xy, dmg);
    game.scene.addAnimation(ani);

    Model.applyTroopDamage(game, attacker, defender, dmg);

    let ar = [];
    let attAr2 = Model.filterBuff(attacker, "afterAttackTroop");
    for (let b of attAr2) {
        let far = () => Buff[b.id].afterAttackTroop(game, attacker, b, defender);
        ar = ar.concat(far);
    }
    let defAr2 = Model.filterBuff(defender, "afterAttackedByTroop");
    for (let b of defAr2) {
        let far = () => Buff[b.id].afterAttackedByTroop(game, defender, b, attacker);
        ar = ar.concat(far);
    }

    let check = () => Subcmd.checkDestroyed(game, defender);
    ar.push(check);
    return ar;
}

Subcmd.attackCity = function (game, attacker, city) {
    // calculate damage
    let dmg = Model.calcCityDamage(game, attacker, city);
    // animation
    let ani = new AniAttack(game, attacker, city.xy, dmg.manpower);
    game.scene.addAnimation(ani);
    // apply damage
    Model.applyCityDamage(game, attacker, city, dmg);
    // occupy
    let ar = [];

    return ar;
}

Subcmd.takeCity = function (game, attacker, city, xy) {
    let oldFactionId = city.factionId;
    city.factionId = attacker.factionId;
    Subcmd.moveHelper(game, attacker.id, xy);
    Model.tryEnterCity(game, attacker);
    let c = () => testEventByType(game, "cityFall", city.id, oldFactionId);
    return [c];
}

Subcmd.attack = function (game, attacker, xy) {
    let defender = game.data.troopList.find(e => equalCoord(e.xy, xy));
    if (defender != null) {
        let ar = [];
        let attAr = Model.filterBuff(attacker, "beforeAttackTroop");
        for (let b of attAr) {
            let far = () => Buff[b.id].beforeAttackTroop(game, attacker, b, defender);
            ar = ar.concat(far);
        }
        let defAr = Model.filterBuff(defender, "beforeAttackedByTroop");
        for (let b of defAr) {
            let far = () => Buff[b.id].beforeAttackedByTroop(game, defender, b, attacker);
            ar = ar.concat(far);
        }
        let mainF = () => Subcmd.attackTroop(game, attacker, defender);
        ar.push(mainF);

        return ar;
    }
    let city = game.data.cityList.find(e => cityTiles(e).some(ee => equalCoord(ee, xy)));
    if (city != null) {
        let ar = Subcmd.attackCity(game, attacker, city);
        if (distance(attacker.xy, xy) == 1 && city.manpower == 0) {
            let cc = () => Subcmd.takeCity(game, attacker, city, xy);
            ar.push(cc);
        }
        return ar;
    }
}

// Subcmd.attackTroopHelper = function (game, attacker, defender, dmg) {
//     let ani = new AniAttack(game, attacker, defender.xy, dmg);
//     game.scene.addAnimation(ani);
//     return [];
// }

// Subcmd.attackCityHelper = function (game, attacker, city, dmg) {
//     let ani = new AniAttack(game, attacker, city.xy, dmg.manpower);
//     game.scene.addAnimation(ani);
//     return [];
// }

Subcmd.startTurn = function (game) {
    let ar = Model.startTurn(game);
    let f = () => {
        testEventByType(game, "turnStart");
        return [];
    }

    return [f];
}

Subcmd.finishTurn = function (game) {
    Model.finishTurn(game);
    Model.nextFaction(game);
    let ar = Subcmd.startTurn(game);
    return ar;
}
