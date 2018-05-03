"use strict";

function charInfo(game, cityId) {
    let charList = game.data.charList.filter(e => e.location == cityId);
    let t = new Templater("templateCharInfo", "charInfo");
    function update(game, charId) {
        let char = game.data.charList.find(e => e.id == charId);
        document.querySelector("div#charInfo img.charImg").src = game.asset.getImage(char.img).src;
        document.querySelector("div#charInfo figcaption.charName").textContent = char.name;
        document.querySelector("div#charInfo output.gender").textContent = game.common.text[char.gender];
        let faction = getFaction(game, char.factionId);
        if (faction != null) {
            document.querySelector("div#charInfo output.faction").textContent = faction.name;
        } else {
            document.querySelector("div#charInfo output.faction").textContent = "";
        }
        document.querySelector("div#charInfo output.location").textContent = getCity(game, char.location).name;
        document.querySelector("div#charInfo output.status").textContent = game.common.text[char.status];
        document.querySelector("div#charInfo output.mil").textContent = char.mil;
        document.querySelector("div#charInfo output.dip").textContent = char.dip;
        document.querySelector("div#charInfo output.adm").textContent = char.adm;
        document.querySelector("div#charInfo output.int").textContent = char.int;
    }

    let ul = t.base.querySelector("ul");
    for (let char of charList) {
        let li = document.createElement("li");
        li.setAttribute("data-id", char.id);
        li.textContent = char.name;
        li.onclick = () => update(game, char.id);
        ul.appendChild(li);
    }
    let bQuit = t.base.querySelector("div.panel>button.quit");
    bQuit.onclick = () => {
        _removeElem("charInfo");
    };
    t.append();
}
