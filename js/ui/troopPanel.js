
function inputUnitType(game, div) {
    let template = document.getElementById("templateInputUnitType");

    for (let t of game.common.unitTypes) {
        let snippet = document.importNode(template.content, true);
        // input radio
        let domInput =
            snippet.querySelector("input.inputUnitType");
        domInput.value = t.id;
        domInput.id = "type_" + t.id;
        // label
        let domLabel =
            snippet.querySelector("label.labelUnitType");
        domLabel.setAttribute("for", domInput.id);
        // attach
        div.appendChild(snippet);
    }
    return div;
}

function troopPanel(game, cityId) {
    let root = document.getElementById("root");

    let template = document.getElementById("templateTroopPanel");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "troopPanel";
    // unit type 
    let divInputUnitType = base.querySelector("div.inputUnitType");
    divInputUnitType = inputUnitType(game, divInputUnitType);

    // attach
    root.appendChild(base);

    let city = game.data.cityList.find(e => e.id == cityId);
    let cityManpower = city.manpower;
    //// callbacks
    // input char
    let domChooseChar = document.querySelector("input.chooseChar");

    {
        let _cb = t => {
            setChar(game, domChooseChar, t);
            _update();
        }
        domChooseChar.onclick =
            () => cityCharTable(game, _cb, cityId);
    }

    // input type
    for (let t of document.querySelectorAll("input.inputUnitType")) {
        t.onchange = _update;
    }

    // input manpower
    let manRange = document.querySelector("input.manpower[type='range']");
    let manNumber = document.querySelector("input.manpower[type='number']");


    manRange.setAttribute("max", 0);
    manNumber.setAttribute("max", 0);

    manRange.oninput = () => {
        manNumber.value = manRange.value;
        _update();
    };
    manNumber.oninput = () => {
        manRange.value = manNumber.value;
        _update();
    };
    //input supplies
    let suppliesRange = document.querySelector("input.supplies[type='range']");
    let suppliesNumber = document.querySelector("input.supplies[type='number']");

    let citySupplies = game.data.cityList[cityId].supplies;
    let maxSupplies = citySupplies;
    suppliesRange.setAttribute("max", maxSupplies);
    suppliesNumber.setAttribute("max", maxSupplies);

    suppliesRange.oninput = () => {
        suppliesNumber.value = suppliesRange.value;
        _update();
    };
    suppliesNumber.oninput = () => {
        suppliesRange.value = suppliesNumber.value;
        _update();
    };
    // display


    let bowBefore = document.querySelector(".stockpileBow>span.before");
    let bowAfter = document.querySelector(".stockpileBow>span.after");
    let spearBefore = document.querySelector(".stockpileSpear>span.before");
    let spearAfter = document.querySelector(".stockpileSpear>span.after");
    let swordBefore = document.querySelector(".stockpileSword>span.before");
    let swordAfter = document.querySelector(".stockpileSword>span.after");
    let horseBefore = document.querySelector(".stockpileHorse>span.before");
    let horseAfter = document.querySelector(".stockpileHorse>span.after");
    bowBefore.textContent = city.bow;
    bowAfter.textContent = city.bow;
    spearBefore.textContent = city.spear;
    spearAfter.textContent = city.spear;
    swordBefore.textContent = city.sword;
    swordAfter.textContent = city.sword;
    horseBefore.textContent = city.horse;
    horseAfter.textContent = city.horse;

    let tdManpowerBefore =
        document.querySelector("table.stockpile tr.manpower>td.before");
    tdManpowerBefore.textContent = cityManpower;
    let tdManpowerAfter =
        document.querySelector("table.stockpile tr.manpower>td.after");
    tdManpowerAfter.textContent = cityManpower - 1;

    let tdSuppliesBefore =
        document.querySelector("table.stockpile tr.supplies>td.before");
    let tdSuppliesAfter =
        document.querySelector("table.stockpile tr.supplies>td.after");
    tdSuppliesBefore.textContent = citySupplies;
    tdSuppliesAfter.textContent = citySupplies - 1;

    function _update() {
        bowAfter.textContent = city.bow;
        spearAfter.textContent = city.spear;
        swordAfter.textContent = city.sword;
        horseAfter.textContent = city.horse;
        let _unitType = radioValue("inputUnitType");
        if (_unitType == null) {
            let _max = 0;
            manRange.setAttribute("max", _max);
            manNumber.setAttribute("max", _max);
        } else if (_unitType == "archer") {
            let _max = Math.min(cityManpower, city.bow);
            manRange.setAttribute("max", _max);
            manNumber.setAttribute("max", _max);
            bowAfter.textContent = city.bow - manNumber.value;

        } else if (_unitType == "spearman") {
            let _max = Math.min(cityManpower, city.spear);
            manRange.setAttribute("max", _max);
            manNumber.setAttribute("max", _max);
            spearAfter.textContent = city.spear - manNumber.value;

        } else if (_unitType == "swordman") {
            let _max = Math.min(cityManpower, city.sword);
            manRange.setAttribute("max", _max);
            manNumber.setAttribute("max", _max);
            swordAfter.textContent = city.sword - manNumber.value;

        } else if (_unitType == "horseman") {
            let _max = Math.min(cityManpower, city.horse);
            manRange.setAttribute("max", _max);
            manNumber.setAttribute("max", _max);
            horseAfter.textContent = city.horse - manNumber.value;
        }

        tdManpowerAfter.textContent = cityManpower - manNumber.value;
        tdSuppliesAfter.textContent = citySupplies - suppliesNumber.value;
        document.querySelector("div.divYesNo button.yes").disabled = !_isValid();
    }

    function _isValid() {
        let c0 = domChooseChar.getAttribute("data-char") != "";
        let c1 = radioValue("inputUnitType") != null;
        let c2 = manNumber.checkValidity();
        let c3 = suppliesNumber.checkValidity();
        return c0 && c1 && c2 && c3;
    }

    // bottom button
    function callbackYes() {
        if (!_isValid()) {
            return;
        }
        let _faction = 0;
        let _charId = Number(domChooseChar.getAttribute("data-char"));
        let _strength = Number(manNumber.value);
        let _unitType = radioValue("inputUnitType");
        let _supplies = Number(suppliesNumber.value);
        let _troop = Model.createTroop(_faction, _charId, _strength, _supplies, _unitType);
        _removeElem("troopPanel");
        if (_troop == "") {
            return;
        }
        game.scene.control = placeTroopControl(game, _troop, cityId);
    }
    function callbackNo() {
        _removeElem("troopPanel");
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;
    button.disabled = true;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}
