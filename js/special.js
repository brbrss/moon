"use strict";

const Buff = {};



Buff.chargeBuff = {
    name: "冲锋效果",
    desc: b => "攻击修正" + (b.n * 0.1).toLocaleString("en", { style: "percent" }),
    create: (n) => {
        return { id: "chargeBuff", type: "buff", n: n };
    },
    damageDealt: (game, troop, b, defender) => {
        return b.n * 0.1;
    },
    afterFinish: (game, troop, b) => {
        Model.removeBuff(troop, "chargeBuff");
        return [];
    }
}

Buff.charge = {
    name: "冲锋",
    desc: b => "移动增加攻击",
    create: () => {
        return { id: "charge", type: "special" };
    },
    afterMove: (game, troop, b, origin) => {
        let old = troop.buffs.find(e => e.id == "chargeBuff");
        if (old == undefined) {
            let newbuff = Buff.chargeBuff.create(1);
            troop.buffs.push(newbuff);
        } else {
            let n = old.n;
            let i = troop.buffs.indexOf(old);
            troop.buffs.splice(i, 1); // remove old
            let newbuff = Buff.chargeBuff.create(n + 1);
            troop.buffs.push(newbuff); // add new
        }
        return [];
    }
};

Buff.forceback = {
    name: "反制", desc: b => "敌方近战攻击前反击",
    create: () => {
        return { id: "forceback", type: "special" };
    },
    beforeAttackedByTroop: (game, troop, b, attacker) => {
        if (distance(attacker.xy, troop.xy) == 1) {
            let f = () => Subcmd.attackTroop(game, troop, attacker);
            return [f];
        }
        return [];
    }
};

Buff.flanking = {
    name: "偷袭",
    desc: b => "目标周围有友军时攻击修正" + 0.5.toLocaleString("en", { style: "percent" }),
    create: () => {
        return { id: "flanking", type: "special" };
    },
    damageDealt: (game, troop, b, defender) => {
        // adjacent to defender
        let tar = game.data.troopList.filter(e => distance(e.xy, defender.xy) == 1);
        // attacker's faction
        tar = tar.filter(e => e.factionId == troop.factionId);
        if (tar.length > 1) {
            return 0.5;
        } else {
            return 0;
        }

    }
};

Buff.immobile = {
    name: "羁绊",
    desc: b => "移动力下降",
    create: () => {
        return { id: "immobile", type: "debuff" };
    },
    movement: (game, troop, b) => {
        return -99;
    },
    afterFinish: (game, troop, b) => {
        Model.removeBuff(troop, "immobile");
        return [];
    }
}

Buff.suppression = {
    name: "压制",
    desc: b => 0.25.toLocaleString("en", { style: "percent" })+"降低目标移动",
    create: () => {
        return { id: "suppression", type: "special" };
    },
    afterAttackTroop: (game, troop, b, defender) => {
        let hasOld = defender.buffs.some(e => e.id == "immobile");
        if (!hasOld && Math.random() < 0.25) {
            let newbuff = Buff.immobile.create();
            defender.buffs.push(newbuff);
        }
        return [];
    }
};
