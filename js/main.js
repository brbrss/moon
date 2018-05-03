"use strict";


function _logErr(e) {
    if (e instanceof Error) {
        throw e;
    } else {
        console.log("Failed: ", e)
    }
}

function loadAsset(game) {
    let arr = [];
    for (let t of Assets.imgPaths) {
        let p = game.asset.loadImage(t.key, t.path);
        arr.push(p)
    }
    for (let t of Assets.sndPaths) {
        let p = game.asset.loadAudio(t.key, t.path);
        arr.push(p)
    }
    let assetPromise = arr;
    return Promise.all(assetPromise).then(() => game);
}

function loadCommon(game) {
    let arr = [];
    function _load(s, path) {
        function _add(t) {
            game.common[s] = t;
        }
        let p = promiseJson(path).then(_add);
        arr.push(p);
    }

    {
        _load("unitTypes", "common/unitTypes.json");
        _load("buildings", "common/buildings.json");
        _load("defines", "common/defines.json");
        _load("text", "common/text.json");
    }
    return Promise.all(arr).then(() => game);
}

function loadData(game) {

    function addTroops(t) {
        game.data.troopList = t;
    }
    let p0 = promiseJson("data/troops.json").then(addTroops);

    function addMap(t) {
        game.data.map = t;
        console.log("Map loaded.")
    }
    let p1 = promiseJson("data/map50.json").then(addMap);

    function addCities(t) {
        game.data.cityList = t;
        console.log("Cities loaded.");
    }
    let p2 = promiseJson("data/cities.json").then(addCities);

    function addChars(t) {
        game.data.charList = t;
        console.log("Char list loaded.")
    }
    let p3 = promiseJson("data/chars.json").then(addChars);

    function addFactions(t) {
        game.data.factionList = t;
    }
    let p4 = promiseJson("data/factions.json").then(addFactions);

    function addMisc(t) {
        game.data.misc = t;
    }
    let p5 = promiseJson("data/misc.json").then(addMisc);

    function addDecor(t) {
        game.data.decor = t;
    }
    let p6 = promiseJson("data/decor.json").then(addDecor);


    let dataPromise = [p0, p1, p2, p3, p4, p5,p6];
    return Promise.all(dataPromise).then(() => game);
}

function loadSceneList() {
    let m = {};
    m["mapView"] = MainScene;
    m["mainMenu"] = EntryScene;
    return m;
}

function changeScene(game, sceneName) {
    if (game.scene != null) {
        game.scene.stop();
    }
    let sceneClass = game.sceneList[sceneName];
    game.scene = new sceneClass(game);

    game.scene.start();
}

function preload() {
    console.log("Initializing game");
    let game = {};
    game.common = {};
    game.data = {};
    game.sceneList = loadSceneList();
    game.scene = null;
    game.asset = new AssetManager();

    let assetReady = loadAsset(game);
    let commonReady = loadCommon(game);

    let arr = [assetReady, commonReady];
    let readyPromise = Promise.all(arr);

    return readyPromise
        .then(() => game);
}

function initNewGame(game) {
    game.data = {};
    game.data.charList = {};
    game.data.cityList = {};
    game.data.troopList = {};
    game.data.misc = {};
    game.data.eventFlagList = [];
    return loadData(game);
}

function newGame(game) {
    function a() {
        changeScene(game, "mapView");
        return game;
    }
    return initNewGame(game).then(a);
}

function saveGame(game) {
    let str = JSON.stringify(game.data);
    let b = new Blob([str], { type: "application/json" });
    let objUrl = window.URL.createObjectURL(b);

    let dom = document.createElement("a");
    dom.href = objUrl;
    dom.setAttribute("download", "save.json");

    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    dom.dispatchEvent(event);

    window.URL.revokeObjectURL(objUrl);
}

function loadGame(game,f){
    var reader = new FileReader();
 
    reader.onload = (event)=>{
        let s = event.target.result;
        game.data = JSON.parse(s);
        changeScene(game, "mapView");
    }
    reader.readAsText(f);
}
