class Contact {
  pos
  penetration
  targetVel
  normalImpulseSum = 0
  tangentImpulseSum = 0
  constructor(pos, penetration) {
    this.pos = pos
    this.penetration = penetration
  }
}
class Collision {
  contacts
  normal
  a
  b
  constructor(contacts, normal, a, b) {
    this.contacts = contacts
    this.normal = normal
    this.a = a
    this.b = b
  }
  init(conifg) {
    for (let contact of this.contacts) {
      let ra = contact.pos.sub(this.a.pos)
      let rb = contact.pos.sub(this.b.pos)
      let rv = this.b.vel.add(rb.crossZWith(this.b.angleVel)).sub(this.a.vel.add(ra.crossZWith(this.a.angleVel)))

      let restitution = Math.max(this.a.restitution, this.b.restitution)
      contact.targetVel = -Math.min(0, rv.dot(this.normal) + conifg.minElastic) * restitution + Math.max(0, contact.penetration - conifg.slop) * conifg.baumgarte / conifg.dt
    }
  }
  warmStart(config,oldCollision){
    for (let i = 0; i < Math.min(this.contacts.length, oldCollision.contacts.length); i++) {
      let contact = this.contacts[i];
      let ra = contact.pos.sub(this.a.pos)
      let rb = contact.pos.sub(this.b.pos)
      let oldContact = oldCollision.contacts[i];

      this.b.applyImpulse(this.normal.scale(oldContact.normalImpulseSum), rb)
      this.a.applyImpulse(this.normal.scale(-oldContact.normalImpulseSum), ra)
      this.b.applyImpulse(this.normal.crossZWith(oldContact.tangentImpulseSum), rb)
      this.a.applyImpulse(this.normal.crossZWith(-oldContact.tangentImpulseSum), ra)
      contact.normalImpulseSum = oldContact.normalImpulseSum;
      contact.tangentImpulseSum = oldContact.tangentImpulseSum;
    }
  }
  solve(conifg) {
    for (let contact of this.contacts) {
      let ra = contact.pos.sub(this.a.pos)
      let rb = contact.pos.sub(this.b.pos)
      let rv = this.b.vel.add(rb.crossZWith(this.b.angleVel)).sub(this.a.vel.add(ra.crossZWith(this.a.angleVel)))
      let normalInvMassSum = this.a.invMass + this.b.invMass + this.a.invInertia * ra.cross(this.normal) ** 2 + this.b.invInertia * rb.cross(this.normal) ** 2
      let normalImpulseDiff = (contact.targetVel-rv.dot(this.normal)) / normalInvMassSum;
      let normalImpulseSum=Math.max(contact.normalImpulseSum+normalImpulseDiff,0)
      normalImpulseDiff =normalImpulseSum-contact.normalImpulseSum
      contact.normalImpulseSum=normalImpulseSum

      this.b.applyImpulse(this.normal.scale(normalImpulseDiff), rb)
      this.a.applyImpulse(this.normal.scale(-normalImpulseDiff), ra)

      rv = this.b.vel.add(rb.crossZWith(this.b.angleVel)).sub(this.a.vel.add(ra.crossZWith(this.a.angleVel)))
      let tangentInvMassSum = this.a.invMass + this.b.invMass + this.a.invInertia * ra.dot(this.normal) ** 2 + this.b.invInertia * rb.dot(this.normal) ** 2
      let tangentImpulseDiff = rv.cross(this.normal) / tangentInvMassSum;
      let friction=Math.sqrt(this.a.friction*this.b.friction)
      let maxFriction=friction*normalImpulseSum
      let tangentImpulseSum = Math.max(-maxFriction, Math.min(maxFriction,contact.tangentImpulseSum + tangentImpulseDiff))
      tangentImpulseDiff = tangentImpulseSum - contact.tangentImpulseSum
      contact.tangentImpulseSum = tangentImpulseSum

      this.b.applyImpulse(this.normal.crossZWith(tangentImpulseDiff), rb)
      this.a.applyImpulse(this.normal.crossZWith(-tangentImpulseDiff), ra)
    }
  }
}
