"use strict";
function getValChar(game){
    let v = [
        {
            desc: game.common.text["name"],
            fun: (item) => item.name
        },
        {
            desc: game.common.text["mil"],
            fun: (item) => item.mil
        },
        {
            desc: game.common.text["dip"],
            fun: (item) => item.dip
        },
        {
            desc: game.common.text["int"],
            fun: (item) => item.int
        },
        {
            desc: game.common.text["adm"],
            fun: (item) => item.adm
        }
    ];
    return v;
}

function _genRow(item, getVal) {
    let row = document.createElement("tr");
    row.className = "dataRow";
    row.setAttribute("data-itemId", item.id);
    for (let i = 0; i < getVal.length; i++) {
        let fun = getVal[i].fun;
        let s = fun(item);
        let td = document.createElement("td");
        td.className = "dataTd";
        var tNode = document.createTextNode(s);
        td.appendChild(tNode);
        row.appendChild(td);
    }
    let td = document.createElement("td");
    td.className = "padding";
    row.appendChild(td);
    return row;
}

function _checkmarkTd() {
    let _td = document.createElement("td");
    _td.className = "checkmark";
    let _span = document.createElement("span");
    _span.className = "checkmark";
    let tNode = document.createTextNode("✓"); // checkmark
    _span.appendChild(tNode);
    _td.appendChild(_span);
    return _td;
}


function _click(_tbody, _row) {
    if (_row.hasAttribute("data-selected")) {
        _row.removeAttribute("data-selected");
        return;
    }

    let n = 0;
    for (let tr of _tbody.children) {
        if (tr.hasAttribute("data-selected") && !tr.isSameNode(_row)) {
            n++;
        }
    }
    if (n > 0) {
        return;
    } else {
        _row.setAttribute("data-selected", "");
    }
}

function decorSelection(thead, tbody) {
    for (let tr of thead.children) {
        let _td = document.createElement("th");
        _td.className = "checkmark";
        tr.insertAdjacentElement("afterbegin", _td);
    }
    for (let tr of tbody.children) {
        tr.onclick = () => _click(tbody, tr);
        let td = _checkmarkTd();
        tr.insertAdjacentElement("afterbegin", td);
    }
}
function genTable(myArray, getVal, callback, id) {
    let t = new Templater("templateTable", id);
    let table = t.base.querySelector("table");
    let thead = t.base.querySelector("table thead");
    let tbody = t.base.querySelector("table tbody");
    // header
    let headerRow = t.base.querySelector("table tr.headerRow");
    for (let i = 0; i < getVal.length; i++) {
        let elemTh = document.createElement("th");
        elemTh.textContent = getVal[i].desc;
        headerRow.appendChild(elemTh);
    }
    // -- padding
    let pad = document.createElement("td");
    pad.className = "padding";
    headerRow.appendChild(pad);
    // content
    for (const item of myArray) {
        let row = _genRow(item, getVal);
        tbody.appendChild(row);
    }
    // select
    if (callback != null) {
        decorSelection(thead, tbody);
        t.getData = () => {
            let _d = {};
            _d.result = Array.from(tbody.children)
                .filter(e => e.hasAttribute("data-selected"))
                .map(t => t.getAttribute("data-itemId"));
            return _d;
        };
        t.takeAction = () => {
            callback(t.getData().result);
        }

        let templateYesNo = document.getElementById("templateYesNo");
        let baseYesNo = document.importNode(templateYesNo.content, true);
        t.base.querySelector("div.tablePanel").appendChild(baseYesNo);
        t.enableYesNo();
    }
    // append
    t.append();
}
////////////////////////////////////////////////////////////////////////////////

function cityCharTable(game, callback, cityId) {
    let arr = Model.cityCharReady(game, cityId);

    let getVal = [
        {
            desc: game.common.text["name"],
            fun: (item) => item.name
        },
        {
            desc: game.common.text["mil"],
            fun: (item) => item.mil
        },
        {
            desc: game.common.text["dip"],
            fun: (item) => item.dip
        },
        {
            desc: game.common.text["int"],
            fun: (item) => item.int
        },
        {
            desc: game.common.text["adm"],
            fun: (item) => item.adm
        }
    ];
    let table = genTable(arr, getVal, callback, "cityCharTable");
}

function cityListTable(game, cityList, callback) {
    // table
    let getVal = [
        {
            desc: game.common.text["cityName"],
            fun: (city) => city.name
        }, {
            desc: game.common.text["cityChar"],
            fun: (city) => Model.cityCharFaction(game, city.id).length
        }, {
            desc: game.common.text["cityManpower"],
            fun: (city) => city.manpower
        }, {
            desc: game.common.text["citySupplies"],
            fun: (city) => city.supplies
        }, {
            desc: game.common.text["cityCommerce"],
            fun: (city) => city.commerce
        }
    ];

    genTable(cityList, getVal, callback, "cityListTable");
}
