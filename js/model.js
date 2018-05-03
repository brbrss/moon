let Model = {};

function getChar(game, id) {
    return game.data.charList.find(e => e.id == id);
}

function getCity(game, id) {
    return game.data.cityList.find(e => e.id == id);
}

function getFaction(game, id) {
    return game.data.factionList.find(e => e.id == id);
}

function getTroop(game, id) {
    return game.data.troopList.find(e => e.id == id);
}

function equalCoord(a, b) {
    return (a.x == b.x) && (a.y == b.y);
}

function distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function cityTiles(city) {
    let a0 = city.xy;
    let a1 = {
        x: a0.x + 1,
        y: a0.y
    };
    let a2 = {
        x: a0.x,
        y: a0.y + 1
    };
    let a3 = {
        x: a0.x + 1,
        y: a0.y + 1
    }
    return [a0, a1, a2, a3];
}

function cityEntranceTiles(city) {
    let a0 = city.xy;
    let c1 = {
        x: a0.x,
        y: a0.y - 1
    };
    let c2 = {
        x: a0.x + 1,
        y: a0.y - 1
    };
    let c3 = {
        x: a0.x + 2,
        y: a0.y
    }
    let c4 = {
        x: a0.x + 2,
        y: a0.y + 1
    }
    let c5 = {
        x: a0.x + 1,
        y: a0.y + 2
    }
    let c6 = {
        x: a0.x,
        y: a0.y + 2
    }
    let c7 = {
        x: a0.x - 1,
        y: a0.y + 1
    }
    let c8 = {
        x: a0.x - 1,
        y: a0.y
    }
    return [c1, c2, c3, c4, c5, c6, c7, c8];
}

Model.validPlaceTroop = function (data, troop, cityId) {
    let city = data.cityList[cityId];
    let arr = cityEntranceTiles(city);
    let occupied = [];
    for (t of data.troopList) {
        occupied.push(t.xy);
    }
    function isInOccupied(t) {
        return occupied.some(x => equalCoord(x, t));
    }
    arr = arr.filter(t => !isInOccupied(t));
    return arr;
}

Model.placeTroop = function (game, tileXY, troop, cityId) {
    let arr = Model.validPlaceTroop(game.data, troop, cityId);
    let city = game.data.cityList.find(e => e.id == cityId);
    if (arr.some(param => equalCoord(param, tileXY))) {
        // success
        if (game.data.troopList.length == 0) {
            troop.id = 0;
        } else {
            let last = game.data.troopList[game.data.troopList.length - 1];
            troop.id = last.id + 1;
        }
        let weapon = typeTroop(game, troop).weapon;
        city[weapon] -= troop.strength;
        city.manpower -= troop.strength;
        city.supplies -= troop.supplies;
        troop.xy = tileXY;
        troop.status = "finished";
        troop.buffs = [];
        game.data.troopList.push(troop);
        let leader = game.data.charList.find(e => e.id == troop.leaderId);
        leader.status = "commanding";
        let sp = Buff[typeTroop(game, troop).special].create();
        troop.buffs.push(sp);
    }
    return [];
}

Model.createTroop = function (factionId, leaderId, strength, supplies, type) {
    let c1 = (strength >= 1) && (supplies >= 1);
    let c2 = (leaderId != null);
    let c3 = (type != null);
    let c = c1 && c2 && c3;
    if (!c) {
        return null;
    }
    let t = {
        factionId: factionId,
        leaderId: leaderId,
        strength: strength,
        supplies: supplies,
        type: type,
        xy: null,
        buffs: [],
        target: { "action": "none" }
    };
    return t;
}
////////////////////////////////////////////////////////////////////////////////
function typeTroop(game, troop) {
    let unitType = troop.type;
    let arr = game.common.unitTypes;
    return arr.find(e => e.id == unitType);
}

Model.getTroopMovement = function (game, troop) {
    let ar = Model.filterBuff(troop, "movement");
    let s = 0;
    for (let b of ar) {
        s += Buff[b.id].movement();
    }
    let basem = typeTroop(game, troop).movement;
    let result = Math.max(basem + s, 1);
    return result;
}

Model.getTroopRange = function (game, troop) {
    return typeTroop(game, troop).range;
}
////////////////////////////////////////////////////////////////////////////////

Model.canStepOn = function (game, troop, xy) {
    let c1 = (xy.x >= 0) && (xy.x < game.data.map.width);
    let c2 = (xy.y >= 0) && (xy.y < game.data.map.height);
    let c3 = !game.data.troopList.some(t => (equalCoord(t.xy, xy) && t.id != troop.id));
    let city = game.data.cityList.find(e => cityTiles(e).some(t => equalCoord(t, xy)));
    let c4 = (city == undefined) || (city.factionId == troop.factionId);
    return c1 && c2 && c3 && c4;
}

Model.movementRange = function (game, troop) {
    let n = Model.getTroopMovement(game, troop);
    let xy = troop.xy;
    let fun = t => Model.canStepOn(game, troop, t);

    let arr = flood(xy, n, fun);
    arr = arr.filter(e => !equalCoord(e, xy));
    return arr;
}

Model.enterCity = function (game, city, troop) {
    let char = game.data.charList.find(e => e.id == troop.leaderId);
    char.location = city.id;
    char.status = "finished";
    city.manpower += troop.strength;
    city.supplies += troop.supplies;
    let weapon = typeTroop(game, troop).weapon;
    city[weapon] += troop.strength;
    for (let i = 0; i < game.data.troopList.length; i++) {
        if (game.data.troopList[i].id == troop.id) {
            game.data.troopList.splice(i, 1);
            break;
        }
    }
}

Model.tryEnterCity = function (game, troop) {
    for (let city of game.data.cityList) {
        let arr = cityTiles(city);
        if (arr.some(e => equalCoord(e, troop.xy))) {
            Model.enterCity(game, city, troop);
            return [];
        }
    }
    return [];
}

Model.moveTroop = function (game, troopId, dst) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    troop.xy = dst;
    return [];
}

function withinMap(game, xy) {
    let c1 = (xy.x >= 0) && (xy.x < game.data.map.width);
    let c2 = (xy.y >= 0) && (xy.y < game.data.map.height);
    return c1 && c2;
}

Model.canAttackTroop = function (game, attacker, defender) {
    let c1 = attacker.factionId != defender.factionId;
    return c1;
}

Model.canAttackCity = function (game, attacker, city) {
    let c1 = attacker.factionId != city.factionId;
    return c1;
}
Model.validAttackTile = function (game, attacker, xy) {
    let t = game.data.troopList.find(e => equalCoord(e.xy, xy));
    if (t != null) {
        return Model.canAttackTroop(game, attacker, t);
    }
    let c = game.data.cityList.find(e => cityTiles(e).some(ee => equalCoord(ee, xy)));
    if (c != null) {
        return Model.canAttackCity(game, attacker, c);
    }
    return false;
}

Model.attackRange = function (game, troop) {
    let n = Model.getTroopRange(game, troop);
    let xy = troop.xy;
    let fun = t => withinMap(game, t);

    let arr = flood(xy, n, fun);
    arr = arr.filter(e => !equalCoord(e, xy));
    return arr;
}

Model.getTroopAttack = function (game, troop) {
    let char = game.data.charList.find(e => e.id == troop.leaderId);
    let baseAttack = typeTroop(game, troop).baseAttack;
    let x = (20 + char.mil) * baseAttack / 100;
    return x;
}

Model.getTroopDefence = function (game, troop) {
    let char = game.data.charList.find(e => e.id == troop.leaderId);
    let baseDefence = typeTroop(game, troop).baseDefence;
    let x = (20 + char.mil) * baseDefence / 100;
    return x;
}

Model.getDamageDealt = function (game, attacker, defender) {
    let ar = Model.filterBuff(attacker, "damageDealt");
    let s = 1;
    for (let b of ar) {
        s += Buff[b.id].damageDealt(game, attacker, b, defender);
    }
    return s;
}

Model.getDamageReceived = function (game, attacker, defender) {
    let ar = Model.filterBuff(defender, "damageReceived");
    let s = 1;
    for (let b of ar) {
        s += Buff[b.id].damageDealt(game, attacker, b, defender);
    }
    s = Math.max(s, 0.1);
    return s;
}

Model.calcTroopDamage = function (game, attacker, defender) {
    let atk = Model.getTroopAttack(game, attacker);
    let s1 = attacker.strength;
    let def = Model.getTroopDefence(game, defender);
    let s2 = defender.strength;

    let d1 = Model.getDamageDealt(game, attacker, defender);
    let d2 = Model.getDamageReceived(game, attacker, defender);
    let rawD = 1.2 * (atk) / (atk + def) * (Math.sqrt(s1) * 10 + 50);
    let damage = rawD * d1 * d2 + 10;
    return Math.ceil(damage);
}

Model.applyTroopDamage = function (game, attacker, defender, dmg) {
    defender.strength -= Math.floor(dmg);
    defender.strength = Math.max(defender.strength, 0);
}

Model.calcCityDamage = function (game, attacker, city) {
    let a = Model.getTroopAttack(game, attacker);
    let s1 = attacker.strength;

    let s2 = city.manpower;

    let result = {};
    let rawMD = 0.5 * a / 100 * (Math.sqrt(s1) * 10 + 10);
    let rawDD = a / 50 * Math.sqrt(s1);
    result.manpower = Math.ceil(rawMD + 10);
    result.defence = Math.ceil(rawDD + 10);
    return result;
}

Model.applyCityDamage = function (game, attacker, city, dmg) {
    city.manpower = Math.max(0, city.manpower - dmg.manpower);
}

Model.destroyTroop = function (game, troop) {
    for (let i = 0; i < game.data.troopList.length; i++) {
        if (game.data.troopList[i].id == troop.id) {
            game.data.troopList.splice(i, 1);
            break;
        }
    }
    let leader = game.data.charList.find(e => e.id == troop.leaderId);
    leader.status = "finished";
}

Model.troopWait = function (game, troop) {
    Model.troopFinish(game, troop);
}

Model.troopFinish = function (game, troop) {
    troop.status = "finished";
    let ar = Model.filterBuff(troop, "afterFinish");
    ar.map(b => Buff[b.id].afterFinish(game, troop, b));
}

Model.troopStart = function (game, troop) {
    troop.status = "ready";
}

Model.consumeSupplies = function (game, troop) {
    let x = troop.strength * game.common.defines.suppliesConsumption;
    troop.supplies -= Math.min(troop.supplies, Math.ceil(x));
}

Model.suppliesPenalty = function (game, troop) {
    if (troop.supplies <= 0) {
        let x = troop.strength * 0.2 + 50;
        troop.strength -= Math.min(troop.strength, Math.ceil(x));
    }
}


Model.nextFaction = function (game) {
    let cur = game.data.misc.hasTurn;
    let ls = game.data.factionList;
    let found = false;
    for (let i = 0; i < ls.length; i++) {
        if (found && ls[i].exists) {
            game.data.misc.hasTurn = ls[i].id;
            return;
        }
        if (ls[i].id == cur) {
            found = true;
        }
    }
    // all acted
    game.data.misc.turn++;
    for (let i = 0; i < ls.length; i++) {
        if (ls[i].exists) {
            game.data.misc.hasTurn = ls[i].id;
            return;
        }
    }
    throw new Error("Should not reach this.");
}

Model.moneyIncome = function (game, factionId) {
    let myCities = game.data.cityList.filter(e => e.factionId == factionId);
    let s = 0;
    for (let c of myCities) {
        let cIncome = Math.floor(c.commerce / 10);
        s += cIncome;
    }
    let faction = game.data.factionList.find(e => e.id == factionId);
    faction.money += s;
}

Model.startTroops = function (game, factionId) {
    for (let t of game.data.troopList) {
        if (t.factionId == factionId) {
            Model.consumeSupplies(game, t);
            Model.suppliesPenalty(game, t);
        }
    }
    let altar = game.data.troopList.slice();
    altar.map(e => {
        if (e.factionId == factionId) {
            if (e.strength <= 0) {
                Model.destroyTroop(game, e);
            }
        }
    }
    );

    let troopArr = game.data.troopList.filter(e => e.factionId == factionId);
    for (let t of troopArr) {
        t.status = "ready";
    }
}

Model.startTurn = function (game) {
    let factionId = game.data.misc.hasTurn;
    Model.moneyIncome(game, factionId);
    Model.startTroops(game, factionId);

    let charArr = game.data.charList.filter(e => e.factionId == factionId);
    for (let t of charArr) {
        if (t.status != "commanding") {
            t.status = "ready";
        }
    }
}

Model.finishTurn = function (game) {
    let factionId = game.data.misc.hasTurn;

    game.data.troopList
        .filter(e => e.factionId == factionId)
        .map(e => Model.troopFinish(game, e));
}

Model.addBuilding = function (game, cityId, buildingId, charId) {
    let building = game.common.buildings.find(e => e.id == buildingId);
    let city = game.data.cityList.find(e => e.id == cityId);
    let char = game.data.charList.find(e => e.id == charId);
    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);
    for (let i = 0; i < city.slots.length; i++) {
        if (city.slots[i] == "") {
            city.slots[i] = buildingId;
            faction.money -= building.cost;
            char.status = "finished";
            return () => { };
        }
    }
    return () => { };
}

Model.commerceEffect = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    let x = 70 + char.adm * 2.5;
    return x;
}

Model.commerceCost = function (game) {
    return 500;
}

Model.developCommerce = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    let cost = Model.commerceCost(game);
    let effect = Model.commerceEffect(game, cityId, charId);
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);
    if (cost > faction.money) {
        return;
    }
    city.commerce += effect;
    faction.money -= cost;
    char.status = "finished";
}

Model.suppliesEffect = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    let x = 10 + char.adm * 4;
    return x;
}

Model.suppliesCost = function (game) {
    return 350;
}

Model.makeSupplies = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    let cost = Model.suppliesCost(game);
    let effect = Model.suppliesEffect(game, cityId, charId);
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);

    if (cost > faction.money) {
        return;
    }
    city.supplies += effect;
    faction.money -= cost;
    char.status = "finished";
}

Model.productionCost = function (game, cityId, charId, product) {
    return 400;
}

Model.productionEffect = function (game, cityId, charId, product) {
    let char = game.data.charList.find(e => e.id == charId);
    let x = 40 + char.adm * 2.5;
    if (product == "horse") {
        x *= 0.35;
    }
    return Math.ceil(x);
}

Model.makeProduction = function (game, cityId, charId, product) {
    let char = game.data.charList.find(e => e.id == charId);
    let cost = Model.productionCost(game, cityId, charId, product);
    let effect = Model.productionEffect(game, cityId, charId, product);
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);

    if (cost > faction.money) {
        return;
    }
    city[product] += effect;
    faction.money -= cost;
    char.status = "finished";
}

Model.recruitCost = function (game, cityId) {
    return 400;
}

Model.recruitEffect = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    return 300 + char.dip * 3;
}

Model.recruit = function (game, cityId, charId) {
    let char = game.data.charList.find(e => e.id == charId);
    let cost = Model.recruitCost(game, cityId, charId);
    let effect = Model.recruitEffect(game, cityId, charId);
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);

    if (cost > faction.money) {
        return;
    }
    faction.money -= cost;
    city.manpower += effect;
    char.status = "finished";
}

Model.moveChar = function (game, charId, targetCityId) {
    let char = game.data.charList.find(e => e.id == charId);
    char.location = targetCityId;
    char.status = "finished";
}

Model.cityCharReady = function (game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = city.factionId;
    return game.data.charList.filter(
        e => (e.factionId == factionId) && (e.location == cityId) && e.status == "ready");
}

Model.cityCharFaction = function (game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);
    let factionId = city.factionId;
    return game.data.charList.filter(
        e => (e.factionId == factionId) && (e.location == cityId));
}

Model.removeBuff = function (troop, id) {
    let b = troop.buffs.find(e => e.id == id);
    if (b != null) {
        let i = troop.buffs.indexOf(b);
        troop.buffs.splice(i, 1);
    }
}

Model.filterBuff = function (troop, triggerType) {
    let ar = [];
    for (let b of troop.buffs) {
        let buffProto = Buff[b.id];
        if (typeof buffProto[triggerType] != "undefined") {
            ar.push(b);
        }
    }
    return ar;
}
