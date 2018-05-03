"use strict";

function ai(game) {
    let id = game.data.misc.hasTurn;

    let cmd;

    cmd = aiStrategic(game, id);
    if (cmd != null) {
        return cmd;
    }
    cmd = aiProcessTroopList(game, id);
    if (cmd != null) {
        return cmd;
    }
    cmd = () => Cmd.finishTurn(game);
    return cmd;
}

function aiProcessTroopList(game, factionId) {
    let cmd = null;
    for (let t of game.data.troopList) {
        if (t.factionId == factionId && t.status != "finished") {
            cmd = aiProcessTroop(game, t);
        }
    }
    return cmd;
}

function aiProcessTroop(game, troop) {
    let cmd = null;

    if (troop.target.action == "siege") {
        cmd = aiExecuteSiege(game, troop, troop.target.targetId);
        if (cmd != null) {
            return cmd;
        }
    }

    if (troop.target.action == "moveTo") {
        cmd = aiExecuteMoveToCity(game, troop, troop.target.targetId);
        if (cmd != null) {
            return cmd;
        }
    }

    if (troop.target.action == "defend") {
        cmd = aiExecuteDefend(game, troop, troop.target.targetId);
        if (cmd != null) {
            return cmd;
        }
    }

    cmd = () => Cmd.troopWait(game, troop.id);
    return cmd;
}

function aiExecuteSiege(game, troop, targetId) {
    if (troop.status == "finished") {
        return null;
    }
    let city = game.data.cityList.find(e => e.id == targetId);
    let cmd = null;

    if (city.factionId == troop.factionId) {
        troop.target = { action: "moveTo", targetId: targetId };
        return aiExecuteMoveToCity(game, troop, targetId);
    }

    cmd = aiAttack(game, troop);
    if (cmd != null) {
        return cmd;
    }
    cmd = aiAttackCity(game, troop, city);
    if (cmd != null) {
        return cmd;
    }
    if (troop.status == "ready") {
        cmd = aiGotoAttackInRange(game, troop);
        if (cmd != null) {
            return cmd;
        }
        cmd = aiGotoAttackCity(game, troop, city);
        if (cmd != null) {
            return cmd;
        }
    }
    cmd = () => Cmd.troopWait(game, troop.id);
    return cmd;
}

function aiExecuteMoveToCity(game, troop, cityId) {
    if (troop.status == "moved") {
        return () => Cmd.troopWait(game, troop.id);
    }
    let city = game.data.cityList.find(e => e.id == cityId);
    let cityArr = cityTiles(city);

    let funCondition = t => cityArr.some(e => equalCoord(e, t));

    let funHeuristics = t => distance(t, city.xy);
    let funValid = (t) => Model.canStepOn(game, troop, t);

    let seq = generalAStar(troop.xy, funCondition, funHeuristics, funValid);

    let moveRange = Model.getTroopMovement(game, troop);

    let k = Math.min(moveRange - 1, seq.length - 1);
    if (k < 0) {
        return null;
    }
    let cmd = () => Cmd.move(game, troop.id, seq[k]);
    return cmd;
}

function aiExecuteDefend(game, troop, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);
    let enemyList = game.data.troopList.filter(e => e.factionId != troop.factionId
        && distance(e.xy, city.xy) < 15);
    if (enemyList.length == 0) { // no enenmy, retreat
        troop.target = { action: "moveTo", targetId: cityId };
        return aiExecuteMoveToCity(game, troop, troop.target.targetId);
    }
    let cmd = null;

    cmd = aiAttack(game, troop); // attack target
    if (cmd != null) {
        return cmd;
    }
    if (troop.status == "moved") {
        cmd = () => Cmd.troopWait(game, troop.id);
        return cmd;
    }
    // move to target
    let targetEnemy = null;
    let dmin = 999;
    for (let enemy of enemyList) {
        let _d = distance(enemy.xy, troop.xy);
        if (_d < dmin) {
            dmin = _d;
            targetEnemy = enemy;
        }
    }
    cmd = aiGotoAttack(game, troop, targetEnemy);
    if (cmd != null) {
        return cmd;
    }
    return null;
}

function aiAttack(game, troop) {
    let arr = Model.attackRange(game, troop);
    for (let t of game.data.troopList) {
        if (Model.canAttackTroop(game, troop, t) && arr.some(e => equalCoord(e, t.xy))) {
            return () => Cmd.attack(game, troop.id, t.xy);
        }
    }
    return null;
}

function aiAttackCity(game, troop, city) {
    let a = Model.getTroopRange(game, troop);
    let cArr = cityTiles(city);
    if (city.manpower == 0) {
        // only a melee attack takes city
        a = 1;
    }
    for (let t of cArr) {
        if (distance(t, troop.xy) <= a) {
            return () => Cmd.attack(game, troop.id, t);
        }
    }
    return null;
}
function aiMove(game, troop) {
    if (troop.status == "moved") {
        return null;
    }
    let moveArr = Model.movementRange(game, troop);

    if (moveArr.length > 0) {
        let cmd = () => Cmd.move(game, troop.id, moveArr[0]);
        return cmd;
    }
    return null;
}

function aiGotoAttackCity(game, troop, city) {
    let moveRange = Model.getTroopMovement(game, troop);
    let a = Model.getTroopRange(game, troop);
    let cityArr = cityTiles(city);
    let funCondition;
    if (city.manpower < 200) {
        // city takeable, close in to melee attack.
        funCondition = t => cityArr.some(e => distance(e, t) == 1);
    } else {
        funCondition = t => cityArr.some(e => distance(e, t) <= a);
    }
    let funHeuristics = t => distance(t, city.xy);
    let funValid = (t) => Model.canStepOn(game, troop, t);
    let seq = generalAStar(troop.xy, funCondition, funHeuristics, funValid);
    let k = Math.min(moveRange - 1, seq.length - 1);
    if (k < 0) {
        return null;
    }
    let cmd = () => Cmd.move(game, troop.id, seq[k]);
    return cmd;
}

function aiGotoAttack(game, troop, enemy) {
    let moveRange = Model.getTroopMovement(game, troop);
    let a = Model.getTroopRange(game, troop);
    let funCondition = t => distance(enemy.xy, t) <= a;
    let funHeuristics = t => distance(t, enemy.xy);
    let cityTL = game.data.cityList.map(e => cityTiles(e))
    cityTL = [].concat.apply([], cityTL);
    let funValid = (t) => Model.canStepOn(game, troop, t) && !cityTL.some(tt => equalCoord(t, tt));
    let seq = generalAStar(troop.xy, funCondition, funHeuristics, funValid);
    let k = Math.min(moveRange - 1, seq.length - 1);
    if (k < 0) {
        return null;
    }
    let cmd = () => Cmd.move(game, troop.id, seq[k]);
    return cmd;
}

function aiGotoAttackInRange(game, troop) {
    // attack anything in range
    //let troop = game.data.troopList.find(e=>e.id==troopId);
    let a = game.common.unitTypes.find(e => e.id == troop.type).range;
    let moveArr = Model.movementRange(game, troop);
    let cityTL = game.data.cityList.map(e => cityTiles(e))
    cityTL = [].concat.apply([], cityTL);
    let L = [];

    for (let e of moveArr) {
        for (let t of game.data.troopList) {
            if (Model.canAttackTroop(game, troop, t)
                && distance(t.xy, e) <= a
                && !cityTL.some(tt => equalCoord(e, tt))
            ) {
                L.push({ xy: e, target: t });
            }
        }
    }
    if (L.length > 0) {
        return () => Cmd.move(game, troop.id, L[0].xy);
    } else {
        return null;
    }
}

function aiInternal(game, factionId) {
    let faction = game.data.factionList.find(e => e.id == factionId);

    if (faction.money < 700) {
        return null;
    }
    let cList = game.data.cityList.filter(e => e.factionId == factionId);
    let istart = Math.floor(Math.random() * cList.length);
    for (let i = 0; i < cList.length; i++) {
        let city = cList[(istart + i) % cList.length];
        let c = aiCityAction(game, faction, city);
        if (c != null) {
            return c;
        }
    }
    return null;
}

function aiStrategic(game, factionId) {
    let c;
    c = aiDecideDeterrence(game, factionId);
    if (c != null) {
        return c;
    }
    c = aiDecideInvasion(game, factionId);
    if (c != null) {
        return c;
    }
    c = aiInternal(game, factionId);
    if (c != null) {
        return c;
    }
    return null;
}

function aiInvasionTroop(game, factionId, city, b) {
    let troop = aiCreateTroop(game, city);
    troop.target = { action: "siege", targetId: b.id };
    return aiPlaceTroop(game, city, troop);
}

function aiDefenceTroop(game, city) {
    let troop = aiCreateTroop(game, city);
    troop.target = { action: "defend", targetId: city.id };
    return aiPlaceTroop(game, city, troop);
}

function aiPlaceTroop(game, city, troop) {
    for (let t of cityEntranceTiles(city)) {
        if (!game.data.troopList.some(e => equalCoord(e.xy, t))) {
            let f = () => Cmd.placeTroop(game, t, troop, city.id);
            return f;
        }
    }
}

function aiCreateTroop(game, city) {
    let c = game.data.charList.filter(
        e => (e.location == city.id) && (e.status == "ready") && (e.factionId == city.factionId)
    );
    if (c.length == 0) {
        return null;
    }
    let charId = c[0].id;
    let uar = ["swordman", "spearman", "archer", "horseman"];
    let war = [city.sword, city.spear, city.bow, city.horse];
    let uus = war.indexOf(Math.max(...war));
    let unitType = uar[uus];

    let size = Math.min(city.manpower - 500, war[uus], 1000);
    let sup = Math.min(city.supplies, size * 2);
    let troop = Model.createTroop(city.factionId, charId, size, size * 2, unitType);
    return troop;
}

function aiDecideInvasion(game, factionId) {
    let cList = game.data.cityList.filter(e => e.factionId == factionId);
    let tcList = game.data.cityList.filter(e => e.factionId != factionId);
    for (let a of cList) {
        let cTiles = cityEntranceTiles(a);
        // some tile is not occupied
        let hasSpace = cTiles.some(t => !game.data.troopList.some(e => equalCoord(e.xy, t)));
        let numChar = Model.cityCharReady(game, a.id).length;
        let b1000 = a.manpower > 1000;
        let bs = a.supplies / a.manpower;
        if (numChar == 0 || !hasSpace || !b1000 || bs < 0.5) {
            continue;
        }
        let numWeapon = a.bow + a.spear + a.sword + a.horse;
        let suppliable = a.supplies / 2 - 500;
        let availableStrength = Math.min(a.manpower - 500, numWeapon, suppliable);

        if(availableStrength<1000){
            continue;
        }
        for (let b of tcList) {
            let weakness = aiCityWeakness(game, a, b, availableStrength);
            let enough = aiOffenseEnough(game, factionId, b);
            if (fuzzyAnd(weakness + fuzzySomewhat(enough), 1 - enough) > 0.5) {
                return aiInvasionTroop(game, factionId, a, b);
            }

        }
    }
    return null;
}

function aiDecideDeterrence(game, factionId) {
    let cList = game.data.cityList.filter(e => e.factionId == factionId);
    for (let city of cList) {
        let c = aiLocalDeter(game, city);
        if (c != null) {
            return c;
        }
    }
    return null;
}

function aiLocalDeter(game, city) {
    let numChar = Model.cityCharReady(game, city.id).length;
    if (numChar == 0) {
        return;
    }
    let localList = game.data.troopList.filter(e => e.factionId == city.factionId && distance(e.xy, city.xy) < 10);
    let enemyList = game.data.troopList.filter(e => e.factionId != city.factionId && distance(e.xy, city.xy) < 12);

    let localStrength = localList.reduce((s, t) => s += t.strength, 0);
    let enemyStrength = enemyList.reduce((s, t) => s += t.strength, 0);

    let staticOutput = 0; // damage from siege
    for (let t of enemyList) {
        staticOutput += 0.08 * t.supplies / game.common.defines.suppliesConsumption;
    }

    let garrison = enemyStrength * 0.1 + 50 * enemyList.length;
    let numWeapon = city.bow + city.spear + city.sword + city.horse;
    let suppliable = (city.supplies - 500) * 1;
    let availableStrength = localStrength +
        Math.min(city.manpower - garrison, numWeapon, suppliable);
    let c = availableStrength * availableStrength - enemyStrength * enemyStrength;
    // damage from combat
    let dynamicOutput = availableStrength - Math.sqrt(Math.max(0, c));
    if (c < 0) {
        dynamicOutput = 1 + staticOutput;
    }
    // minimize damage taken
    let needReinforcement = (localStrength > 0) && (dynamicOutput < staticOutput) && (localStrength / enemyStrength < 1.5);
    if (needReinforcement) {
        return aiDefenceTroop(game, city);
    }

}

function aiCityCommerceNeed(game, city) {
    let myCityList = game.data.cityList.filter(e => e.factionId == city.factionId);
    let myCharList = game.data.charList.filter(e => e.factionId == city.factionId);
    let csum = 0;
    for (let c of myCityList) {
        csum += c.commerce;
    }

    let m = csum / myCharList.length;
    let incomeLow = fuzzySmall(m, 50, 200);
    let incomeHigh = fuzzyLarge(m, 400, 2000);
    let totalLow = fuzzySmall(csum, 500, 1000);
    let urgentNeed = fuzzyOr(totalLow, incomeLow);
    let goodToHave = 1 - incomeHigh;
    let weight = fuzzyOr(urgentNeed, 0.4 * goodToHave);
    return weight;
}

function aiCitySuppliesNeed(game, city) {
    let stock = city.supplies / (1 + city.manpower);
    let stockHigh = fuzzyLarge(stock, 1, 3);
    let stockLow = fuzzySmall(stock, 0.1, 1.0);
    //let stockNormal = 1 - fuzzyOr(stockHigh, stockLow);
    let manpowerLow = fuzzySmall(city.manpower, 100, 500);
    let goodToHave = fuzzyAnd(1 - stockHigh, 1 - manpowerLow);
    let weight = fuzzyOr(stockLow, 0.85 * goodToHave);
    return weight;
}

function aiCityManpowerNeed(game, city) {
    let suppliesStock = city.supplies / (city.manpower + 1);
    let weaponTotal = (city.sword + city.spear + city.bow + city.horse);
    let weaponStock = weaponTotal / (city.manpower + 1);

    let suppliesEnough = fuzzyLarge(suppliesStock, 0.3, 1);
    let suppliesHigh = fuzzyLarge(suppliesStock, 2.0, 3);
    let weaponEnough = fuzzyLarge(weaponStock, 0.5, 0.95);

    let threat = aiTotalThreat(game, city);
    let veryLittleThreat = fuzzyVery(fuzzySmall(threat, 0.05, 0.3));
    let manpowerLow = fuzzySmall(city.manpower, 300, 1500);

    let defenceNeed = fuzzyOr(manpowerLow, fuzzyAnd(threat, suppliesEnough));
    let aggressionNeed = fuzzyAnd(veryLittleThreat, suppliesHigh, weaponEnough);

    let weight = fuzzyOr(defenceNeed, aggressionNeed);
    return weight;
}
function aiCityProductionNeed(game, city, weapon) {
    let weaponTotal = city.bow + city.spear + city.sword + city.horse;
    let stock = weaponTotal / (1 + city.manpower);
    let share = city[weapon] / weaponTotal;

    let stockHigh = fuzzyLarge(stock, 0.3, 1.0);
    let manpowerLow = fuzzySmall(city.manpower, 300, 500);
    let shareLow = fuzzySomewhat(fuzzySmall(share, 0.10, 0.25));
    let near1k = fuzzyLarge(city[weapon], 200, 1000) * (city[weapon] < 1000);

    let needWeapon = fuzzyAnd(1 - fuzzyVery(stockHigh), 1 - manpowerLow);
    let needThis = fuzzySomewhat(fuzzyOr(shareLow, near1k));
    let weight = fuzzyAnd(needWeapon, needThis);
    return weight;
}

function aiCityAction(game, faction, city) {
    function comp(a, b) {
        return b.w - a.w;
    }
    let arr = []
    {
        let action = {};
        action.c = (charId) => Cmd.commerce(game, city.id, charId);
        action.w = aiCityCommerceNeed(game, city);
        arr.push(action);
    }
    {
        let action = {};
        action.c = (charId) => Cmd.supplies(game, city.id, charId);
        action.w = aiCitySuppliesNeed(game, city);
        arr.push(action);
    }
    {
        let action = {};
        action.c = (charId) => Cmd.recruit(game, city.id, charId);
        action.w = aiCityManpowerNeed(game, city);
        arr.push(action);
    }
    for (let product of ["bow", "sword", "spear", "horse"]) {
        let action = {};
        action.c = (charId) => Cmd.production(game, city.id, charId, product);
        action.w = aiCityProductionNeed(game, city, product);
        arr.push(action);
    }
    arr.sort(comp);
    let ready = Model.cityCharReady(game, city.id);
    if (ready.length == 0) {
        return null;
    }
    let charId = ready[0].id;
    let cmd = () => arr[0].c(charId);
    return cmd;
}

function aiTotalThreat(game, myCity) {
    let enemyCityList = game.data.cityList.filter(e => e.factionId != myCity.factionId);
    let threatList = [];
    for (let city of enemyCityList) {
        let threat = aiCityThreat(game, myCity, city);
        threatList.push(threat);
    }
    let weight = fuzzyOr(...threatList);
    return weight;
}

function aiCityThreat(game, myCity, enemyCity) {
    let dist = distance(myCity.xy, enemyCity.xy);
    let powerRatio = enemyCity.manpower / (myCity.manpower + 1);
    let suppliesRatio = enemyCity.supplies / (myCity.manpower + 1);

    let distNear = fuzzySmall(dist, 20, 30);
    let powerHigh = fuzzyLarge(powerRatio, 0.7, 2);
    let suppliesHigh = fuzzySomewhat(fuzzyLarge(suppliesRatio, 0.5, 1.2));
    let usableArmyHigh = fuzzyAnd(powerHigh, suppliesHigh);

    let threat = fuzzyProduct(usableArmyHigh, distNear);
    return threat;
}

function aiCityWeakness(game, myCity, enemyCity, attackStrength) {
    let dist = distance(myCity.xy, enemyCity.xy);
    let strengthRatio = attackStrength / (enemyCity.manpower + 1);

    let distNear = fuzzySmall(dist, 15, 40);
    let strengthMid = fuzzyLarge(strengthRatio, 0.0, 1);
    let strengthHigh = fuzzyVery(fuzzyLarge(strengthRatio, 0.0, 2));
    let enough = fuzzyAnd(0.3 * strengthMid, strengthHigh);
    let weight = fuzzyProduct(distNear, strengthHigh);
    return weight;
}

function aiOffenseEnough(game, factionId, enemyCity) {
    let forceList = game.data.troopList.filter(e => e.factionId == factionId
        && e.target.action == "siege"
        && e.target.targetId == enemyCity.id);
    let strengthTotal = forceList.reduce((x, b) => x + b.strength, 0);
    let r = strengthTotal / (enemyCity.manpower + 1);
    let relativeEnough = fuzzyLarge(r, 0.5, 3);
    let absoluteEnough = fuzzyLarge(strengthTotal, 700, 1500);
    let weight = fuzzyAnd(relativeEnough, absoluteEnough);
    return weight;
}

function fuzzyLarge(x, lower, upper) {
    let y = (x - lower) / (upper - lower);
    let a = Math.max(y, 0);
    let b = Math.min(a, 1);
    return b;
}

function fuzzySmall(x, lower, upper) {
    return fuzzyLarge(-x, -upper, -lower);
}

function fuzzyOr(...args) {
    return Math.max(...args);
}

function fuzzyAnd(...args) {
    return Math.min(...args);
}

function fuzzyMany(...args) {
    let s = 0;
    for (let x of args) {
        s += x;
    }
    return s / args.length;
}

function fuzzyVery(x) {
    return x * x;
}

function fuzzySomewhat(x) {
    return Math.sqrt(x);
}

function fuzzyProduct(...args) {
    let p = 1;
    for (let x of args) {
        p *= x;
    }
    return Math.pow(p, 1 / args.length);
}
