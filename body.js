class Body{
  pos = Vec2.Zero()
  vel = Vec2.Zero()
  rot = Vec2.Unit(0)
  dir = 0
  angleVel=0
  shape
  invMass
  invInertia
  restitution=0.2
  friction=0.8
  constructor(shape,density){
    this.shape=shape;
    let mass = shape.getArea() * density;
    this.invMass = mass == 0 ? 0 : 1 / mass
    let inertia = shape.getInertia() * density;
    this.invInertia = inertia == 0 ? 0 : 1 / inertia
  }
  applyImpulse(impulse,rp){
    this.vel=this.vel.add(impulse.scale(this.invMass))
    this.angleVel+=rp.cross(impulse)*this.invInertia
  }
}
