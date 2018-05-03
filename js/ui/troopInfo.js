"use strict";

function troopInfo(game, troopId) {
    let troop = game.data.troopList.find(e => e.id == troopId);
    let char = game.data.charList.find(e => e.id == troop.leaderId);
    let root = document.getElementById("root");

    let template = document.getElementById("templateTroopInfo");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "troopInfo";
    base.querySelector("div img.char").src =
        game.asset.getImage(char.img).src;
    base.querySelector("div figcaption.charName").textContent = char.name;

    base.querySelector("div input.inputUnitType").value = troop.type;

    base.querySelector("div div.strength>output").textContent = troop.strength;
    base.querySelector("div div.supplies>output").textContent = troop.supplies;

    root.appendChild(base);
    document.querySelector("button.quit").onclick = () => {
        _removeElem("troopInfo");
    }

    let tbuff = document.getElementById("templateBuff");
    let divBuffs = root.querySelector("div div.buffs");
    for(let b of troop.buffs){
        let name = Buff[b.id].name;
        let desc = Buff[b.id].desc(b);
        let subt = document.importNode(tbuff.content,true);
        let nodeName = document.createTextNode(name);
        subt.querySelector("span.buff").appendChild(nodeName);
        subt.querySelector("span.buff").setAttribute("data-type",b.type);
        
        let nodeDesc = document.createTextNode(desc);
        subt.querySelector("span.buff>label").appendChild(nodeDesc);
        divBuffs.appendChild(subt);
    }
}
