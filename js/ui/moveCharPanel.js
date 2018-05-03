
class Templater {
    constructor(templateName, id) {
        this.id = id;
        this.root = document.getElementById("root");
        this.template = document.getElementById(templateName);
        this.base = document.importNode(this.template.content, true);
        this.base.querySelector("div.transparent").id = id;
    }

    chooseChar(game, domChooseChar, cityId) {
        let _cb = t => {
            setChar(game, domChooseChar, t);
            this.update();
        }
        domChooseChar.onclick =
            () => cityCharTable(game, _cb, cityId);
    }
    update() {

    }
    isValid() {
        return true;
    }
    getData() {
        return {};
    }
    takeAction() {

    }
    callbackYes() {
        if (this.isValid()) {
            this.takeAction();
            _removeElem(this.id);
        }
    }
    callbackNo() {
        _removeElem(this.id);

    }
    enableYesNo() {
        let button = this.base.querySelector("div.divYesNo button.yes");
        button.onclick = () => this.callbackYes();

        button = this.base.querySelector("div.divYesNo button.no");
        button.onclick = () => this.callbackNo();
    }
    append() {
        this.root.appendChild(this.base);
    }
}

function moveCharPanel(game, cityId) {
    let t = new Templater("templateMoveCharPanel", "moveCharPanel");
    t.getData = () => {
        let charId = document.querySelector("div input.chooseChar").getAttribute("data-char");
        let cityId = document.querySelector("div input.destination").getAttribute("data-city");
        return { charId: charId, cityId: cityId };
    }
    t.takeAction = () => {
        let a = t.getData();
        Cmd.moveChar(game, a.charId, a.cityId);
    }
    t.enableYesNo();
    let domChooseChar = t.base.querySelector("input.chooseChar");
    t.chooseChar(game, domChooseChar, cityId);
    let domChooseCity = t.base.querySelector("input.destination");
    function _cb(result) {
        if (result.length > 0) {
            domChooseCity.setAttribute("data-city", result[0]);
            domChooseCity.value = game.data.cityList.find(e=>e.id==result[0]).name;
        }
    }
    let city = game.data.cityList.find(e => e.id == cityId);
    let cityList = game.data.cityList.filter(e => ((e.id != cityId) && (e.factionId == city.factionId)));

    domChooseCity.onclick = () => {
        cityListTable(game, cityList, _cb);
    };
    t.append();
}
