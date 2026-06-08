class World{
  bodies=[]
  id=0
  config=new PhysicsConfig()
  colliMap=new Map()
  collisions
  step(){
    for(let body of this.bodies){
      body.shape.refreshPos(body.pos,body.rot)
    }
    let collisions=[]
    for(let i=0;i<this.bodies.length-1;i++){
      for(let j=i+1;j<this.bodies.length;j++){
        let a = this.bodies[i]
        let b = this.bodies[j]
        if(a.invMass==0&&b.invMass==0){
          continue
        }
        let collision=a.shape.collideWith(b.shape,a,b)
        if(collision!=null){
          collisions.push(collision)
        }
      }
    }
    for(let body of this.bodies){
      if(body.invMass!=0){
        body.vel=body.vel.add(this.config.gravity.scale(this.config.dt))
      }
    }
    for (let collision of collisions) {
      collision.init(this.config)
    }
    for(let collision of collisions){
      let key1 = collision.a.id + "," + collision.b.id;
      let key2 = collision.b.id + "," + collision.a.id;
      let old=this.colliMap.get(key1)
      if(old==undefined){
        old=this.colliMap.get(key2)
      }
      if(old!=undefined){
        collision.warmStart(this.config,old)
      }
    }
    this.colliMap.clear()
    for(let collision of collisions){
      let key1 = collision.a.id + "," + collision.b.id;
      this.colliMap.set(key1,collision)
    }
    for(let i=0;i<this.config.iter;i++){
      for (let collision of collisions) {
        collision.solve(this.config)
      }
    }
    for (let body of this.bodies) {
      body.pos = body.pos.add(body.vel.scale(this.config.dt))
      body.dir+=body.angleVel*this.config.dt;
      body.dir %=Math.PI*2
      body.rot = Vec2.Unit(body.dir)
    }
    this.collisions=collisions
  }
  addBody(b){
    this.bodies.push(b)
    b.id=this.id++
    return b
  }
}
class PhysicsConfig{
  dt=1/60
  gravity=new Vec2(0,-500)
  iter=4
  minElastic=10
  slop=2
  baumgarte=0.2
}
