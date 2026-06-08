function renderWorld(world,camera,ctx){
  camera.corner=new Vec2(ctx.canvas.width,ctx.canvas.height)
  ctx.clearRect(0,0,camera.corner.x,camera.corner.y)
  for(let body of world.bodies){
    let shape=body.shape
    if(shape instanceof Circle){
      let pos = camera.convertPos(body.pos)
      let pos2 = camera.convertPos(body.pos.add(body.rot.scale(shape.radius)))
      ctx.beginPath()
      ctx.arc(pos.x,pos.y,camera.convertLength(shape.radius),0,Math.PI*2)
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos2.x, pos2.y)
      ctx.stroke()
    }else if(shape instanceof Polygon){
      let pos = camera.convertPos(shape.vertices[0])
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      for(let i=0;i<shape.vertices.length;i++){
        let pos2 = camera.convertPos(shape.vertices[(i+1)%shape.vertices.length])
        ctx.lineTo(pos2.x, pos2.y)
      }
      ctx.stroke()
    }
  }
  for(let coll of world.collisions){
    for(let contact of coll.contacts){
      let pos = camera.convertPos(contact.pos)
      let pos2 = camera.convertPos(contact.pos.add(coll.normal.scale(10)))
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos2.x, pos2.y)
      ctx.stroke()
    }
  }
}
class Camera{
  pos=Vec2.Zero()
  scale=1
  corner
  convertPos(pos){
    let v=pos.sub(this.pos).scale(this.scale)
    return new Vec2(this.corner.x * 0.5 + v.x, this.corner.y * 0.5 - v.y)
  }
  convertLength(len){
    return len*this.scale
  }
}
