class Circle{
  radius
  pos
  constructor(radius){
    this.radius=radius
  }
  refreshPos(pos,rot){
    this.pos=pos
  }
  getArea() {
    return this.radius ** 2 * Math.PI
  }
  getInertia() {
    return this.radius ** 4 * Math.PI/2
  }
  collideWith(b,ab,bb){
    if(b instanceof Circle){
      return this.collideWithCircle(b,ab,bb)
    }
    return b.collideWith(this,bb,ab)
  }
  collideWithCircle(b,ab,bb){
    let rp=b.pos.sub(this.pos)
    let distance=rp.distance();
    let radiusSum=this.radius+b.radius
    if(radiusSum>=distance){
      let normal=rp.normalize()
      return new Collision([new Contact(this.pos.add(normal.scale(this.radius)),radiusSum-distance)],normal,ab,bb)
    }
    return null
  }
}
class Polygon {
  vertices
  normals
  fixedVertices
  fixedNormals
  constructor(fixedVertices) {
    this.fixedVertices=fixedVertices
    this.fixedNormals=[]
    for(let i=0;i<fixedVertices.length;i++){
      let v1 = fixedVertices[i]
      let v2 = fixedVertices[(i+1)%fixedVertices.length]
      this.fixedNormals.push(v2.sub(v1).crossZWith(-1).normalize())
    }
  }
  static Rect(w,h){
    return new Polygon([new Vec2(w/2,h/2),new Vec2(-w/2,h/2),new Vec2(-w/2,-h/2),new Vec2(w/2,-h/2)])
  }
  refreshPos(pos, rot) {
    this.vertices = []
    this.normals = []
    for(let i=0;i<this.fixedVertices.length;i++){
      this.vertices.push(this.fixedVertices[i].mulComplex(rot).add(pos))
      this.normals.push(this.fixedNormals[i].mulComplex(rot))
    }
  }
  getArea() {
    let area=0
    for (let i = 0; i < this.fixedVertices.length; i++) {
      let v1 = this.fixedVertices[i]
      let v2 = this.fixedVertices[(i + 1) % this.fixedVertices.length]
      area+=v1.cross(v2)/2
    }
    return area
  }
  getInertia() {
    let inertia = 0
    for (let i = 0; i < this.fixedVertices.length; i++) {
      let v1 = this.fixedVertices[i]
      let v2 = this.fixedVertices[(i + 1) % this.fixedVertices.length]
      inertia += (v1.dot(v1) + v1.dot(v2) + v2.dot(v2)) * v1.cross(v2) / 12
    }
    return inertia
  }
  collideWith(b, ab, bb) {
    if (b instanceof Circle) {
      return this.collideWithCircle(b, ab, bb)
    } else if (b instanceof Polygon) {
      return this.collideWithPolygon(b, ab, bb)
    }
    return b.collideWith(this, bb, ab)
  }
  findMaxSeparation(b){
    let maxSeparation=-Infinity
    let maxIndex=0
    for(let i=0;i<this.vertices.length;i++){
      let v = this.vertices[i]
      let n = this.normals[i]
      let minSeparation=Infinity
      for(let j=0;j<b.vertices.length;j++){
        let separation = b.vertices[j].sub(v).dot(n)
        minSeparation = Math.min(minSeparation,separation)
      }
      if(minSeparation>maxSeparation){
        maxSeparation=minSeparation
        maxIndex=i
      }
    }
    return [maxSeparation,maxIndex]
  }
  static clipSegmentByEdge(v1,v2,normal,edge1,edge2){
    let cross1 = normal.cross(v1)
    let cross2 = normal.cross(v2)
    let len=cross2-cross1
    if(cross1>edge1){
      if(edge2>cross2){
        return [v1, v2]
      }else{
        return [v1, v1.lerp(v2, (edge2 - cross1) / len)]
      }
    }else{
      if (edge2 > cross2) {
        return [v1.lerp(v2, (edge1 - cross1) / len), v2]
      } else {
        return [v1.lerp(v2, (edge1 - cross1) / len), v1.lerp(v2, (edge2 - cross1) / len)]
      }
    }
  }
  collideWithPolygon(b,ab,bb){
    let [aSeparation, aNormalIndex] = this.findMaxSeparation(b)
    if(aSeparation>0){
      return null
    }
    let [bSeparation, bNormalIndex] = b.findMaxSeparation(this)
    if (bSeparation > 0) {
      return null
    }
    let separation,normalIndex,normalPoly,vertexPoly,normalBody,vertexBody
    if(aSeparation>bSeparation){
      [separation, normalIndex, normalPoly, vertexPoly, normalBody, vertexBody] = [aSeparation, aNormalIndex,this,b,ab,bb]
    }else{
      [separation, normalIndex, normalPoly, vertexPoly, normalBody, vertexBody] = [bSeparation, bNormalIndex,b,this,bb,ab]
    }
    let normal=normalPoly.normals[normalIndex]
    let vertexFace
    let vertexScore=Infinity
    for(let i=0;i<vertexPoly.vertices.length;i++){
      let dot=vertexPoly.normals[i].dot(normal)
      if(dot<vertexScore){
        vertexScore=dot
        vertexFace=i
      }
    }
    let points=[
      vertexPoly.vertices[vertexFace],
      vertexPoly.vertices[(vertexFace+1)%vertexPoly.vertices.length],
    ]
    let normalVertex = normalPoly.vertices[normalIndex];
    points=Polygon.clipSegmentByEdge(
      points[1],
      points[0],
      normal,
      normal.cross(normalVertex),
      normal.cross(normalPoly.vertices[(normalIndex+1)%normalPoly.vertices.length]),
    )
    points = points.filter(p => p.sub(normalVertex).dot(normal) <= 0)
    return new Collision(points.map(p=>new Contact(p,-separation)),normal,normalBody,vertexBody)
  }
  collideWithCircle(b, ab, bb) {
    let maxSeparation=-Infinity
    let maxIndex=0;
    for(let i=0;i<this.vertices.length;i++){
      let v = this.vertices[i]
      let n = this.normals[i]
      let dot=b.pos.sub(v).dot(n)
      if(dot>maxSeparation){
        maxSeparation=dot
        maxIndex=i
      }
    }
    if(maxSeparation>b.radius){
      return null
    }
    let normal=this.normals[maxIndex]
    let crossV1 = normal.cross(this.vertices[maxIndex])
    let cross = normal.cross(b.pos)
    let crossV2 = normal.cross(this.vertices[(maxIndex + 1) % this.vertices.length])
    let p
    if(crossV1<cross&&cross<crossV2){
      return new Collision([new Contact(b.pos.sub(normal.scale(b.radius)), b.radius - maxSeparation)], normal, ab, bb)
    }else if (crossV2<cross){
      p = this.vertices[(maxIndex + 1) % this.vertices.length]
    }else{
      p = this.vertices[maxIndex]
    }
    let rp=p.sub(b.pos)
    if(rp.distance()>b.radius){
      return null
    }
    return new Collision([new Contact(p, b.radius - rp.distance())], rp.normalize().scale(-1),ab,bb)
  }
}
