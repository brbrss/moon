function setChar(_game,dom, result) {
    if (result.length == 0) {
        dom.setAttribute("data-char", "");
        dom.src = "";
    }
    else {
        let t = result[0];
        dom.setAttribute("data-char", t);
        let imgKey = _game.data.charList[t].img;
        let imgSrc = _game.asset.getImage(imgKey).src;
        dom.src = imgSrc;
    }
}

function radioValue(name) {
    let elemArray = document.getElementsByName(name);
    for (let t of elemArray) {
        if (t.checked) {
            return t.value;
        }
    }
    return null;
}

function inputBuilding(game, div) {
    let template = document.getElementById("templateInputBuilding");

    for (let t of game.common.buildings) {
        let snippet = document.importNode(template.content, true);
        // input radio
        let domInput =
            snippet.querySelector("input.inputBuilding");
        domInput.value = t.id;
        domInput.id = "building_" + t.id;
        // label
        let domLabel =
            snippet.querySelector("label.labelBuilding");
        domLabel.setAttribute("for", domInput.id);
        domLabel.textContent = t.name;
        // attach
        div.appendChild(snippet);
    }
    return div;
}

function constructPanel(game, cityId) {
    let city = game.data.cityList.find(e => e.id == cityId);

    let root = document.getElementById("root");
    let template = document.getElementById("templateConstructPanel");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "constructPanel";

    // show slots
    let lSlots = base.querySelector("div.buildingSlots");
    for (let bb of city.slots) {
        let li = document.createElement("li");
        li.className = "building";
        li.textContent = bb;
        lSlots.appendChild(li);
    }
    //show buildings
    let divBuildings = base.querySelector("div.buildings");
    inputBuilding(game, divBuildings)
    // attach
    root.appendChild(base);

    let bQuit = document.querySelector("div.panel>button.quit");
    bQuit.onclick = () => {
        _removeElem("constructPanel");
    };

    let inputChar = document.querySelector("div>input.chooseChar");

    inputChar.onclick = () => 
    {
        cityCharTable(game, t=>setChar(game,inputChar,t), cityId);
        _update();
    }    
    let radioList = document.querySelectorAll("div>input.inputBuilding");
    for (let radio of radioList){
        radio.onchange = _update;
    }
    function _isValid(){
        let b = radioValue("inputBuilding") ;
        let bb = game.common.buildings.find(e=>e.id==b);
        let faction = game.data.factionList.find(e=>e.id==city.factionId);
        let c1 = b != null;
        let c2 = bb.cost <= faction.money;
        let c3 = inputChar.getAttribute("data-char") != "";
        let c4 = city.slots.filter(e=>e=="").length>0;
        return c1 && c2 && c3 && c4;
    }
    function _update(){
        let b = radioValue("inputBuilding") ;
        let bb = game.common.buildings.find(e=>e.id==b);
        let lCost = document.querySelector("label.cost");
        let lDesc = document.querySelector("p.desc");
        if(b!=null){
            lCost.textContent = bb.cost;
            lDesc.textContent = bb.desc;
        }else{
            lCost.textContent = 0;
            lDesc.textContent = "";
        }
    }
    function callbackYes(){
        if(! _isValid()){
            return;
        }
        let charId = inputChar.getAttribute("data-char");
        let buildingId = radioValue("inputBuilding");
        let buildingType = game.common.buildings.find(e=>e.id==buildingId);
        _removeElem("constructPanel");   
        Cmd.addBuilding(game,cityId,buildingId,charId);
    }
    function callbackNo(){
        _removeElem("constructPanel");        
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}

function commercePanel(game,cityId){
    let city = game.data.cityList.find(e=>e.id==cityId);
    
    let root = document.getElementById("root");
    let template = document.getElementById("templateCommercePanel");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "commercePanel";
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
            lCost.textContent = Model.commerceCost(game).toString();
            lEffect.textContent = Model.commerceEffect(game,cityId,charId).toString();
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
        _removeElem("commercePanel");   
        Cmd.commerce(game,cityId,charId);
        
    }
    function callbackNo(){
        _removeElem("commercePanel");        
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}

function suppliesPanel(game,cityId){
    let city = game.data.cityList.find(e=>e.id==cityId);
    
    let root = document.getElementById("root");
    let template = document.getElementById("templateSuppliesPanel");
    let base = document.importNode(template.content, true);
    base.querySelector("div.transparent").id = "suppliesPanel";
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
            lCost.textContent = Model.suppliesCost(game).toString();
            lEffect.textContent = Model.suppliesEffect(game,cityId,charId).toString();
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
        _removeElem("suppliesPanel");   
        Cmd.supplies(game,cityId,charId);
        
    }
    function callbackNo(){
        _removeElem("suppliesPanel");        
    }
    let button = document.querySelector("div.divYesNo button.yes");
    button.onclick = callbackYes;

    button = document.querySelector("div.divYesNo button.no");
    button.onclick = callbackNo;
}
