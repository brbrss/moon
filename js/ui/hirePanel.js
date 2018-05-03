"use strict";

function hirePanel(game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);

    let t = new Templater("templateHirePanel", "hirePanel");

    t.getData = () => {
        let charId1 = document.querySelector("div input.chooseChar[name='char1']").getAttribute("data-char");
        let charId2 = document.querySelector("div input.chooseChar[name='char2']").getAttribute("data-char");

        return { charId1: charId1, charId2: charId2 };
    };
    t.isValid = () => {
        let a = t.getData();
        return a.charId1 != "" && a.charId2 != "";
    };
    t.takeAction = () => {
        let a = t.getData();
        Cmd.hire(game, a.charId1, a.charId2);
    };
    t.enableYesNo();

    let domChooseChar1 = t.base.querySelector("input.chooseChar[name='char1']");
    t.chooseChar(game, domChooseChar1, cityId);
    let domChooseChar2 = t.base.querySelector("input.chooseChar[name='char2']");
    let _cb = e => {
        setChar(game, domChooseChar2, e);
        t.update();
    }
    let targetList = game.data.charList.filter(e => (e.location == cityId) && (e.factionId != city.factionId));
    domChooseChar2.onclick = () => genTable(targetList, getValChar(game), _cb, "charTable");

    t.append();
}