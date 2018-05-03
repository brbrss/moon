"use strict";

function productionPanel(game,cityId){
    let city = game.data.cityList.find(e=>e.id==cityId);
    
    let root = document.getElementById("root");
    let template = document.getElementById("templateProductionPanel");
    let base = document.importNode(template.content, true);

    base.querySelector("div.transparent").id = "productionPanel";
    root.appendChild(base);
    let dType = document.querySelector("div.panel div.inputType");
    for(let i=0;i<4;i++){
        let ar = ["bow","spear","sword","horse"];
        let stype = ar[i];
        let _input = document.createElement("input");
        _input.className = "inputUnitType";
        _input.type = "radio";
        _input.name = "type";
        _input.id = "type_" + stype;
        _input.value = stype;
        let _label = document.createElement("label");
        _label.className = "labelUnitType";
        _label.setAttribute("for",_input.id);
        dType.appendChild(_input);
        dType.appendChild(_label);
        _input.onchange = _update;
    }
    let inputChar = document.querySelector("div.panel input.chooseChar");
    
    inputChar.onclick = () => 
    {
        let cb = (t)=>{
            setChar(game,inputChar,t)
            _update();     
        };
        cityCharTable(game, cb, cityId);
    }  

    function _isValid(){
        let c1 = document.querySelector("div.panel input.chooseChar").
                    getAttribute("data-char") != "";
        let c2 = radioValue("type") != null;
        return c1 && c2;
    }
    function _update(){
        let lCost = document.querySelector("div.panel label.cost");
        let lEffect = document.querySelector("div.panel label.effect");
        if(!_isValid()){
            lCost.textContent = 0;
            lEffect.textContent = 0;
            return;
        }
        let stype = radioValue("type") ;
        let charId = inputChar.getAttribute("data-char");
        lCost.textContent = Model.productionCost(game,cityId,charId,stype);
        lEffect.textContent = Model.productionEffect(game,cityId,charId,stype);
    }

    function callbackYes(){
        if(! _isValid()){
            return;
        }
        let charId = inputChar.getAttribute("data-char");
        let stype= radioValue("type");
        
        _removeElem("productionPanel");   
        Cmd.production(game,cityId,charId,stype);
    }
    function callbackNo(){
        _removeElem("productionPanel");        
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}
