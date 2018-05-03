"use strict";

let gameEvent = [];

function fireEventById(id) {
    let ev = gameEvent.find(e => e.id == id);
    let f = (game, ...args) => {
        ev.effect(game, ...args);
        let dom = getTransparent();
        let ani = new AniPhony(dom.id);
        game.scene.addAnimation(ani);
        game.scene.pollEvent();
    };
    return f;
}
function testEventByType(game, typename, ...args) {
    let found = false;
    for (let ev of gameEvent) {
        if (ev.type == typename) {
            if (ev.condition(game, ...args)) {
                ev.effect(game, ...args);
                found = true;
            }
        }
    }
    let dom = getTransparent();
    let ani = new AniPhony(dom.id);
    game.scene.addAnimation(ani);
    game.scene.pollEvent();
    return [];
}

function escCharName(x) {
    return "char(" + x + ")";
}
function escCityName(x) {
    return "city(" + x + ")";
}

function escFactionName(x) {
    return "faction(" + x + ")";
}

function regChar(game, text) {
    let p = /char\((.*)\)/;
    function fun(match, p1, offset, string) {
        let i = parseInt(p1, 10);
        let char = game.data.charList.find(e => e.id == i);
        return char.name;
    }
    return text.replace(p, fun);
}

function regCity(game, text) {
    let p = /city\((.*)\)/;
    function fun(match, p1, offset, string) {
        let i = parseInt(p1, 10);
        let city = getCity(game, i);
        return city.name;
    }
    return text.replace(p, fun);
}

function regFaction(game, text) {
    let p = /faction\((.*)\)/;
    function fun(match, p1, offset, string) {
        let i = parseInt(p1, 10);
        let faction = game.data.factionList.find(e => e.id == i);
        return faction.name;
    }
    return text.replace(p, fun);
}


let gameParse = function (game, text) {
    let s = text;
    s = regChar(game, s);
    s = regCity(game, s);
    s = regFaction(game, s);
    return s;
}

let evtSpeak = (game, charId, text) => {
    let fun = () => dialog(game, charId, gameParse(game, text));
    game.scene.addGameEvent(fun);
}

function evtCaption(game, text) {
    let fun = () => caption(game, gameParse(game, text));
    game.scene.addGameEvent(fun);
}

function evtShowCg(game, imgKey) {
    let fun = () => cgFrame(game, imgKey);
    game.scene.addGameEvent(fun);
}

function evtHideCg(game) {
    let f = () => clearCgFrame(game);
    game.scene.addGameEvent(f);
}

function evtSound(game, key) {
    let f = () => {
        game.asset.playEffect(key);
        return true;
    }
    game.scene.addGameEvent(f);
}

function evtBgm(game, key) {
    let f = () => {
        game.asset.playBgm(key);
        return true;
    }
    game.scene.addGameEvent(f);
}

function evtCleanup(game) {
    uiClearEvent();
    game.asset.stopBgm();
}

function evtHasFlag(game, flag) {
    let i = game.data.eventFlagList.indexOf(flag);
    return (i != -1);
}

function evtAddFlag(game, flag) {
    game.data.eventFlagList.push(flag);
}

function evtRemoveFlag(game, flag) {
    let i = game.data.eventFlagList.indexOf(flag);
    if (i != -1) {
        game.data.eventFlagList.splice(i, 1);
    }
}

function evtAddPoint(game, charId, attrName, val) {
    let atText;
    if (attrName == "mil") {
        atText = "武力";
    } else if (attrName == "int") {
        atText = "智力";
    } else if (attrName == "dip") {
        atText = "交涉";
    } else if (attrName == "adm") {
        atText = "内政";
    }
    let char = game.data.charList.find(e => e.id == charId);
    let oldVal = char[attrName];
    let newVal = char[attrName] += val;
    let str = oldVal.toString() + "→" + newVal.toString();
    evtCaption(game, escCharName(charId) + "的能力变化了：" + atText + str);
}

function evtQuit(game) {
    let c = () => changeScene(game, "mainMenu");
    game.scene.addGameEvent(c);
}