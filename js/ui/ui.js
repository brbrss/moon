
////////////////////////////////////////////////////////////////////////////////
//// helper

function _innerText(elem, s) {
    var textNode = document.createTextNode(s);
    elem.appendChild(textNode);
}

function _removeElem(id) {
    let root = document.getElementById("root");
    let d = document.getElementById(id);
    if (d != null) {
        root.removeChild(d);
    }
}

function clearCityTable() {
    let root = document.getElementById("root");
    let old = document.getElementById("cityTable");
    if (old != null) {
        root.removeChild(old);
    }
}

function updateCityTable(game) {
    let root = document.getElementById("root");
    let old = document.getElementById("cityTable");
    if (old != null) {
        let cityId = Number(old.getAttribute("data-cityId"));
        root.removeChild(old);
        cityTable(game, cityId);
    }
}

function clearMenu() {
    let root = document.getElementById("root");
    let old = document.getElementById("mouseMenu");
    if (old != null) {
        root.removeChild(old);
    }
}
////////////////////////////////////////////////////////////////////////////////
//// main menu

function _startNew() {
    _removeElem("mainMenu");
    newGame(globalGame).catch(_logErr);
}

function mainMenu() {
    let root = document.getElementById("root");
    let d = document.createElement("div");
    d.className = "mainMenu";
    d.id = "mainMenu";
    let bStart = document.createElement("button");
    var tStart = document.createTextNode("Start");
    bStart.className = "mainMenu";
    bStart.appendChild(tStart);
    bStart.onclick = _startNew;
    d.appendChild(bStart);
    let bLoad = document.createElement("button");
    bLoad.textContent = "Load";
    bLoad.className = "mainMenu";
    bLoad.onclick = () => loadPanel(globalGame);
    d.appendChild(bLoad);
    root.appendChild(d);
}

function loadPanel(game) {
    let t = new Templater("templateLoad", "loadPanel");

    t.isValid = () => {
        let fin = document.querySelector("div#loadPanel input[name='fname']");
        return fin.value != "";
    }
    t.takeAction = () => {
        let fin = document.querySelector("div#loadPanel input[name='fname']");
        loadGame(game, fin.files[0]);
    }
    t.enableYesNo();
    t.append();
}

class EntryScene {
    start() {
        mainMenu();
    }
    stop() {
        _removeElem("mainMenu");
    }
};

////////////////////////////////////////////////////////////////////////////////
//// hud
function hud(game) {
    let template = document.getElementById("templateHud");
    let base = document.importNode(template.content, true);
    let root = document.getElementById("root");
    root.appendChild(base);

    // next turn
    let bNext = document.querySelector("button.nextTurn");
    bNext.onclick = () => {
        clearMenu();
        clearCityTable();
        game.scene.control = defaultControl;
        let c = () => Cmd.finishTurn(game);
        game.scene.addCommand(c);
    };
    let bSystem = document.querySelector("button.system");
    bSystem.onclick = () => {
        systemMenu(game);
    };
    // head bar
    displayFaction(game);

}

function displayFaction(game) {
    let root = document.getElementById("root");

    let factionId = game.data.misc.hasTurn;
    let faction = game.data.factionList.find(e => e.id == factionId);
    let spanName = document.querySelector("div.top>span.factionName");
    spanName.textContent = faction.name;
    let spanMoney = document.querySelector("div.top>span.money");
    spanMoney.textContent = faction.money;
    let domTurn = document.querySelector("div.top>output.turn");
    domTurn.textContent = game.data.misc.turn;
}

function systemMenu(game) {
    let t = new Templater("templateSystem", "systemMenu");
    t.base.querySelector("button[name='resume']").onclick = () => {
        _removeElem("systemMenu");
    };
    t.base.querySelector("button[name='save']").onclick = () => {
        _removeElem("systemMenu");
        saveGame(game);
    };
    t.base.querySelector("button[name='exit']").onclick = () => {
        _removeElem("systemMenu");
        changeScene(game, "mainMenu");
    };
    t.append();
}

////////////////////////////////////////////////////////////////////////////////
//// city menu
function subMenu(name) {
    let nodeList = document.querySelectorAll("div.mouseMenu2");
    for (let d of nodeList) {
        if (d.getAttribute("data-name") == name) {
            d.setAttribute("data-selected", "true");
        } else {
            d.setAttribute("data-selected", "false");
        }
    }
}

function cityMenu(xy, game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);
    // template
    let root = document.getElementById("root");
    let template = document.getElementById("templateCityMenu");
    let base = document.importNode(template.content, true);
    // append
    let old = document.getElementById("mouseMenu");
    if (old != null) {
        root.removeChild(old);
    }
    root.appendChild(base);
    // locate
    let d = document.querySelector("div.mouseMenu");
    d.id = "mouseMenu";
    d.style.left = xy.x.toString() + "px";
    d.style.top = xy.y.toString() + "px";
    // buttons
    let bInternal = document.querySelector("div.mouseMenu>button[name='internal']");
    let bHr = document.querySelector("div.mouseMenu>button[name='hr']");
    let bCampaign = document.querySelector("div.mouseMenu>button[name='campaign']");
    let bInfo = document.querySelector("div.mouseMenu>button[name='info']");

    if (city.factionId != game.data.misc.playerId) {
        bInternal.style = "display:none";
        bHr.style = "display:none";
        bCampaign.style = "display:none";
    }

    bInternal.onclick = () => {
        //_removeElem("mouseMenu");
        subMenu("internal");
        //internalPanel(game,cityId);        
    };
    bHr.onclick = () => {
        subMenu("hr");
    }
    bCampaign.onclick = () => {
        _removeElem("mouseMenu");
        clearCityTable();
        troopPanel(game, cityId);
    };

    bInfo.onclick = () => {
        subMenu("info");
    };

    // internal submenu
    let bConstruct = document.querySelector("div.mouseMenu2>button[name='construct']");
    let bCommerce = document.querySelector("div.mouseMenu2>button[name='commerce']");
    let bSupplies = document.querySelector("div.mouseMenu2>button[name='supplies']");
    let bProduction = document.querySelector("div.mouseMenu2>button[name='production']");
    let bRecruit = document.querySelector("div.mouseMenu2>button[name='recruit']");

    // disable
    //bCommerce.disabled = !city.slots.some(e => e == "market");
    //bSupplies.disabled = !city.slots.some(e => e == "kitchen");

    bConstruct.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        constructPanel(game, cityId);
    };
    bCommerce.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        commercePanel(game, cityId);
    }
    bSupplies.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        suppliesPanel(game, cityId);
    }
    bProduction.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        productionPanel(game, cityId);
    }
    bRecruit.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        recruitPanel(game, cityId);
    }

    // hr submenu
    let bHire = document.querySelector("div.mouseMenu2>button[name='hire']");
    let bMoveChar = document.querySelector("div.mouseMenu2>button[name='moveChar']");
    bHire.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        hirePanel(game, cityId);
    }
    bMoveChar.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        moveCharPanel(game, cityId);
    }

    // info submenu
    let bCharInfo = document.querySelector("div.mouseMenu2>button[name='charInfo']");
    bCharInfo.onclick = () => {
        clearCityTable();
        _removeElem("mouseMenu");
        charInfo(game, cityId);
    }
}


////////////////////////////////////////////////////////////////////////////////
//// troop menu

function troopMenu(xy, game, troopId) {
    let troop = game.data.troopList.find(e => e.id == troopId);

    let root = document.getElementById("root");
    let template = document.getElementById("templateTroopMenu");
    let base = document.importNode(template.content, true);

    let old = document.getElementById("mouseMenu");
    if (old != null) {
        root.removeChild(old);
    }
    root.appendChild(base);

    let d = document.querySelector("div.mouseMenu");
    d.id = "mouseMenu";
    d.style.left = xy.x.toString() + "px";
    d.style.top = xy.y.toString() + "px";

    let bMove = document.querySelector("div.mouseMenu>button[name='move']");
    let bAttack = document.querySelector("div.mouseMenu>button[name='attack']");
    let bWait = document.querySelector("div.mouseMenu>button[name='wait']");
    let bInfo = document.querySelector("div.mouseMenu>button[name='info']");

    if (troop.factionId != game.data.misc.playerId) {
        bMove.style = "display:none";
        bAttack.style = "display:none";
        bWait.style = "display:none";
    }
    bMove.onclick = () => {
        _removeElem("mouseMenu");
        game.scene.control = troopMoveControl(game, troopId);
    };
    bAttack.onclick = () => {
        _removeElem("mouseMenu");
        game.scene.control = troopAttackControl(game, troopId);
    };
    bWait.onclick = () => {
        _removeElem("mouseMenu");
        Cmd.troopWait(game, troopId);
    };
    bInfo.onclick = () => {
        _removeElem("mouseMenu");
        troopInfo(game, troopId);
    };
    if (troop.status == "finished") {
        bMove.disabled = true;
        bAttack.disabled = true;
        bWait.disabled = true;
    } else if (troop.status == "moved") {
        bMove.disabled = true;
    }
}

////////////////////////////////////////////////////////////////////////////////

function cityTable(game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);
    let faction = game.data.factionList.find(e => e.id == city.factionId);
    let root = document.getElementById("root");
    let template = document.getElementById("templateCityTable");
    let base = document.importNode(template.content, true);


    let d = base.querySelector("div.cityTable");
    d.id = "cityTable";
    d.setAttribute("data-cityId", cityId);
    base.querySelector("tr.factionName>td").textContent = faction.name;
    base.querySelector("tr.cityName>td").textContent = city.name;
    base.querySelector("tr.commerce>td.content").textContent = city.commerce;
    base.querySelector("tr.supplies>td.content").textContent = city.supplies;
    base.querySelector("tr.manpower>td.content").textContent = city.manpower;
    base.querySelector("tr.bow>td.content").textContent = city.bow;
    base.querySelector("tr.spear>td.content").textContent = city.spear;
    base.querySelector("tr.sword>td.content").textContent = city.sword;
    base.querySelector("tr.horse>td.content").textContent = city.horse;

    let tdSlots = base.querySelector("tr.slots>td.content");
    tdSlots.textContent =
        city.slots.filter(e => e != "").length.toString() + "/"
        + city.slots.length.toString();

    let tdChars = base.querySelector("tr.chars>td.content");
    let arChar = game.data.charList.filter(
        e => (e.location == cityId) && (e.factionId == city.factionId)
    );
    tdChars.textContent =
        arChar.filter(e => e.status == "ready").length.toString() + "/"
        + arChar.length.toString();

    let old = document.getElementById("divCityTable");
    if (old != null) {
        root.removeChild(old);
    }
    root.appendChild(base);
}

function caption(game, text) {
    // dom
    let root = document.getElementById("root");
    let template = document.getElementById("templateCaption");
    let base = document.importNode(template.content, true);
    // dialog div
    let div = base.querySelector("div.caption");
    div.id = "caption";

    let p = base.querySelector("div.caption div.text");
    p.textContent = text;

    clearDialog(game);
    // append
    let frame = getTransparent();
    frame.appendChild(base);
    frame.onclick = () => game.scene.pollEvent();
    return false;
}

function dialog(game, charId, text) {
    // data
    let char = game.data.charList.find(e => e.id == charId);
    // dom
    let root = document.getElementById("root");
    let template = document.getElementById("templateDialog");
    let base = document.importNode(template.content, true);
    // dialog div
    let div = base.querySelector("div.dialog");
    div.id = "dialog";
    let img = base.querySelector("div.dialog img");
    img.src = game.asset.getImage(char.img).src;
    let caption = base.querySelector("div.dialog div.nameText");
    caption.textContent = char.name;
    let p = base.querySelector("div.dialog div.text");
    p.textContent = text;
    // remove old
    let frame = getTransparent();
    clearDialog(game);

    // append
    frame.appendChild(base);
    frame.onclick = () => game.scene.pollEvent();
    return false;
}

function cgFrame(game, imgKey) {
    let img = game.asset.getImage(imgKey);

    let root = document.getElementById("root");
    let template = document.getElementById("templateCgFrame");
    let base = document.importNode(template.content, true);
    //
    let domImg = base.querySelector("div.cg img");
    domImg.src = img.src;
    //
    let frame = getTransparent();
    let old = document.querySelector("div.cg");
    if (old != null) {
        frame.removeChild(old);
    }
    frame.appendChild(base);
    return true;
}

function clearCgFrame(game) {
    let frame = getTransparent();
    let old = document.querySelector("div.cg");
    if (old != null) {
        frame.removeChild(old);
    }
    return true;
}

function clearDialog(game) {
    let frame = getTransparent();
    let old;
    old = document.querySelector("div.dialog");
    if (old != null) {
        frame.removeChild(old);
    }
    old = document.querySelector("div.caption");
    if (old != null) {
        frame.removeChild(old);
    }
    return true;
}

function getTransparent() {
    let frame = document.getElementById("transparent");
    if (frame == null) {
        let templateTransparent = document.getElementById("templateTransparent");
        let tbase = document.importNode(templateTransparent.content, true);
        root.appendChild(tbase);
        frame = document.querySelector("div.transparent");
        frame.id = "transparent";
    }
    return frame;
}

function removeTransparent() {
    let root = document.getElementById("root");
    let frame = document.querySelector("div.transparent");
    if (frame != null) {
        root.removeChild(frame);
    }
}

function uiClearEvent() {
    removeTransparent();
}

function uiDeactivate() {
    let bNext = document.querySelector("button.nextTurn");
    bNext.disabled = true;
}

function uiActivate() {
    let bNext = document.querySelector("button.nextTurn");
    bNext.disabled = false;
}

function uiClearAll() {
    let root = document.getElementById("root");
    let darr = Array.from(root.children);
    for (let i = 0; i < darr.length; i++) {
        let dom = darr[i];
        if (dom.id != "mainCanvas") {
            root.removeChild(dom);
        }
    }
}