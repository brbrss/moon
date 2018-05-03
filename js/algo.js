"use strict";

class Heap {
    _parent(i) {
        return Math.floor((i - 1) / 2);
    }
    _childLeft(i) {
        return 2 * i + 1;
    }
    _childRight(i) {
        return 2 * i + 2;
    }
    constructor(comp) {
        this.arr = [];
        this.comp = comp;
    }
    isEmpty() {
        return (this.arr.length == 0);
    }
    push(t) {
        this.arr.push(t);
        let i = this.arr.length - 1;
        if (i == 0) {
            return;
        }
        while (!this.comp(this.arr[this._parent(i)], this.arr[i])) {
            let c = this.arr[i];
            this.arr[i] = this.arr[this._parent(i)];
            this.arr[this._parent(i)] = c;
            i = this._parent(i);
            if (i == 0) {
                break;
            }
            //console.log(this.arr);
        }
    }
    pop() {
        if(this.arr.length==0){
            return;
        }
        let a = this.arr[0];
        if(this.arr.length==1){
            this.arr.pop();
            return a;
        }
        this.arr[0] = this.arr.pop();
        let i = 0;
        let j = this._childLeft(i);
        let k = this._childRight(i);

        let m = i;
        if(j<this.arr.length && this.comp(this.arr[j],this.arr[m])){
            m = j;
        }
        if(k<this.arr.length && this.comp(this.arr[k],this.arr[m])){
            m = k;
        }
        while (!this.comp(this.arr[i], this.arr[m])) {
            let c = this.arr[i];
            this.arr[i] = this.arr[m];
            this.arr[m] = c;
            i = m;
            j = this._childLeft(i);
            k = this._childRight(i);
            m = i;
            if(j<this.arr.length && this.comp(this.arr[j],this.arr[m])){
                m = j;
            }
            if(k<this.arr.length && this.comp(this.arr[k],this.arr[m])){
                m = k;
            }
        }
        return a;
    }
};

function flood(start, n, funValid) {
    let origin = [{ x: start.x, y: start.y, n: n }];
    let result = [{ x: start.x, y: start.y, n: n }];

    function _fill(t) {
        let dst = { x: t.x, y: t.y };
        if (!funValid(dst)) {
            return;
        }
        if (!result.some(e => equalCoord(e, dst))) {
            origin.push(t);
            result.push(t);
        }
    }
    while (origin.length != 0) {
        let from = origin.shift();
        if (from.n == 0) {
            continue;
        }

        let ee = { x: from.x + 1, y: from.y, n: from.n - 1 };
        let nn = { x: from.x, y: from.y - 1, n: from.n - 1 };
        let ww = { x: from.x - 1, y: from.y, n: from.n - 1 };
        let ss = { x: from.x, y: from.y + 1, n: from.n - 1 };

        _fill(ee);
        _fill(nn);
        _fill(ww);
        _fill(ss);
    }
    return result;
}



function aStar(start,end,funValid){
    function h(a) {
        return distance(a, end) ;
    }
    function isEnd(a){
        return equalCoord(a,end);
    }
    return generalAStar(start,isEnd,h,funValid);
}

function generalAStar(start, funIsTarget,funHeuristic, funValid) {
    
    function comp(a, b) {
        return (funHeuristic(a) + a.cost) <= (funHeuristic(b) + b.cost);
    }
    let q = new Heap(comp);

    start.prev = null;
    start.cost = 0;
    let interior = [start];
    let cur = start;
    function _add(t) {
        if (!funValid(t)) {
            return;
        }
        if (interior.some(e => equalCoord(t, e))) {
            return;
        }
        interior.push(t);
        if (!q.arr.some(e => equalCoord(t, e))) {
            q.push(t);
        }
    }

    while (!funIsTarget(cur)) {
        let ee = { x: cur.x + 1, y: cur.y, prev: cur ,cost:cur.cost+1};
        let nn = { x: cur.x, y: cur.y - 1, prev: cur ,cost:cur.cost+1};
        let ww = { x: cur.x - 1, y: cur.y, prev: cur ,cost:cur.cost+1};
        let ss = { x: cur.x, y: cur.y + 1, prev: cur ,cost:cur.cost+1};
        _add(ee);
        _add(nn);
        _add(ww);
        _add(ss);
        cur = q.pop();
    }

    let result = [];
    while (cur.prev != null) {
        result.push(cur);
        cur = cur.prev;
    }
    result.reverse();
    return result;
}
