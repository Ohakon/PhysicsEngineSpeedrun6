let world=new World()
let wallSize=10000
world.addBody(new Body(Polygon.Rect(10000, 100), 0)).pos = new Vec2(0, -250)
let size=20
let tall=10
world.addBody(new Body(new Circle(100), 1)).pos = new Vec2(50, 100)
for (let y = 0; y < tall;y++){
  for(let x=0;x<tall-y;x++){
    world.addBody(new Body(Polygon.Rect(size, size), 1)).pos=new Vec2(size*(x+y/2),size*y-200+size/2)
  }
}
let camera=new Camera()

let ctx=document.getElementById("mainCanvas").getContext("2d")
function loop(){
  world.step()
  renderWorld(world,camera,ctx)

  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
