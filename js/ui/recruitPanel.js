"use strict";


function recruitPanel(game,cityId){
    let city = game.data.cityList.find(e=>e.id==cityId);
    
    let root = document.getElementById("root");
    let template = document.getElementById("templateRecruitPanel");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "recruitPanel";
    root.appendChild(base);

    let lCost = document.querySelector("div label.cost");
    let lEffect = document.querySelector("div label.effect");
    let inputChar = document.querySelector("div input.chooseChar");
    function _isValid(){
        let c1 = inputChar.getAttribute("data-char") != "";
        return c1;
    }
    function _update(){
        let charId = inputChar.getAttribute("data-char");
        if(charId!=""){
            lCost.textContent = Model.recruitCost(game).toString();
            lEffect.textContent = Model.recruitEffect(game,cityId,charId).toString();
        }else{
            lCost.textContent = 0;            
            lEffect.textContent = 0;            
        }
    }

    inputChar.onclick = () => {
        let cb = (t)=>{
            setChar(game,inputChar,t)
            _update();     
        };
        cityCharTable(game, cb, cityId);
    };
    function callbackYes(){
        if(! _isValid()){
            return;
        }
        let charId = inputChar.getAttribute("data-char");  
        _removeElem("recruitPanel");   
        Cmd.recruit(game,cityId,charId);
        
    }
    function callbackNo(){
        _removeElem("recruitPanel");        
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}
