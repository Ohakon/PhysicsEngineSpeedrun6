class Vec2{
  x
  y
  constructor(x,y){
    this.x=x;
    this.y=y;
  }
  static Zero() {
    return new Vec2(0, 0)
  }
  static Unit(rad) {
    return new Vec2(Math.cos(rad), Math.sin(rad))
  }
  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }
  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
  scale(v) {
    return new Vec2(this.x *v, this.y *v)
  }
  distance(){
    return Math.sqrt(this.x**2+this.y**2)
  }
  normalize(){
    let distance=this.distance()
    return distance<=0.00000001?new Vec2(0,1):this.scale(1/distance)
  }
  dot(v){
    return this.x*v.x+this.y*v.y
  }
  cross(v) {
    return this.x * v.y - this.y * v.x
  }
  crossWithZ(v) {
    return new Vec2(this.y * v, -this.x * v)
  }
  crossZWith(v) {
    return new Vec2(-this.y * v, this.x * v)
  }
  lerp(v,a){
    return this.scale(1-a).add(v.scale(a))
  }
  mulComplex(v){
    return new Vec2(this.x*v.x-this.y*v.y,this.x*v.y+this.y*v.x)
  }
}
