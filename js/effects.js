function markMove(xy,view){
    let r = view.renderDim(xy);
    view.ctx.fillStyle = "#0000FF88";
    view.ctx.fillRect(r.x,r.y,r.w,r.h);
    view.ctx.strokeStyle = "#0000FF";
    view.ctx.strokeRect(r.x,r.y,r.w,r.h);
}

function markAttackRange(xy,view){
    let r = view.renderDim(xy);
    view.ctx.fillStyle = "#ff7f5088";
    view.ctx.fillRect(r.x,r.y,r.w,r.h);
    view.ctx.strokeStyle = "#ff7f50";
    view.ctx.strokeRect(r.x,r.y,r.w,r.h);
}

function markAttackTarget(xy,view){
    let r = view.renderDim(xy);
    view.ctx.fillStyle = "#dc143c88";
    view.ctx.fillRect(r.x,r.y,r.w,r.h);
    view.ctx.strokeStyle = "#dc143c";
    view.ctx.strokeRect(r.x,r.y,r.w,r.h);
}
