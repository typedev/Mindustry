// Snake Unit Logic for Mindustry
print("[Snake] Loading snake logic...");

var snakeHeads = new java.util.HashMap();

// Event to apply snake AI to new serpent-head units
Events.on(EventType.UnitCreateEvent, cons(event => {
    if (!event.unit) return;
    
    var unit = event.unit;
    
    // Check if this is a serpent head
    if (unit.type && unit.type.name.equals("snake-units-serpent-head")) {
        print("[Snake] Serpent head detected!");
        
        try {
            var snakeAI = extend(AIController, {
                segments: new Seq(),
                trail: new Seq(),
                maxSegments: 3,
                trailLength: 100,
                segmentSpacing: 8,
                headUnit: unit,
                
                updateUnit() {
                    this.super$updateUnit();
                    
                    // Record position
                    var pos = new Vec2(this.headUnit.x, this.headUnit.y);
                    if (this.trail.add) {
                        this.trail.add(pos);
                    } else {
                        this.trail.push(pos);
                    }
                    
                    // Limit trail size - handle both Seq and JS arrays
                    if (this.trail.removeIndex) {
                        // This is a Seq object
                        while (this.trail.size > this.trailLength) {
                            this.trail.removeIndex(0);
                        }
                    } else {
                        // This is a JS array
                        while (this.trail.length > this.trailLength) {
                            this.trail.shift();
                        }
                    }
                    
                    // Spawn segments if needed
                    var segmentCount = this.segments.add ? this.segments.size : this.segments.length;
                    if (segmentCount === 0) {
                        this.spawnSegments();
                    }
                    
                    // Update segment positions
                    this.updateSegments();
                },
                
                spawnSegments() {
                    var segmentType = null;
                    Vars.content.units().each(cons(unitType => {
                        if (unitType.name.equals("snake-units-serpent-segment")) {
                            segmentType = unitType;
                        }
                    }));
                    
                    if (!segmentType) {
                        print("[Snake] Segment type not found");
                        return;
                    }
                    
                    // Spawn segments behind the head
                    for (var i = 0; i < this.maxSegments; i++) {
                        var offsetDistance = (i + 1) * 16;
                        var segment = segmentType.spawn(
                            this.headUnit.x - offsetDistance, 
                            this.headUnit.y
                        );
                        segment.team = this.headUnit.team;
                        
                        // Add initial trail positions for immediate following
                        for (var j = 0; j < offsetDistance / 2; j++) {
                            var trailPos = new Vec2(this.headUnit.x - j * 2, this.headUnit.y);
                            if (this.trail.add) {
                                this.trail.add(trailPos);
                            } else {
                                this.trail.push(trailPos);
                            }
                        }
                        
                        if (this.segments.add) {
                            this.segments.add(segment);
                        } else {
                            this.segments.push(segment);
                        }
                    }
                    print("[Snake] Spawned " + this.maxSegments + " segments");
                },
                
                updateSegments() {
                    var segmentCount = this.segments.add ? this.segments.size : this.segments.length;
                    var trailSize = this.trail.add ? this.trail.size : this.trail.length;
                    
                    for (var i = 0; i < segmentCount; i++) {
                        var segment = this.segments.get ? this.segments.get(i) : this.segments[i];
                        if (!segment.isValid()) continue;
                        
                        // Calculate target position in trail
                        var targetIndex = (i + 1) * this.segmentSpacing;
                        
                        if (trailSize > targetIndex) {
                            var target = this.trail.get ? 
                                this.trail.get(trailSize - 1 - targetIndex) : 
                                this.trail[trailSize - 1 - targetIndex];
                            
                            var dx = target.x - segment.x;
                            var dy = target.y - segment.y;
                            var dist = Math.sqrt(dx * dx + dy * dy);
                            
                            // More responsive movement
                            if (dist > 4) {
                                var speed = Math.min(dist * 0.15, 3.0);
                                var moveX = (dx / dist) * speed;
                                var moveY = (dy / dist) * speed;
                                
                                segment.set(segment.x + moveX, segment.y + moveY);
                                segment.rotation = Math.atan2(moveY, moveX) * 180 / Math.PI;
                            }
                        }
                    }
                },
                
                removed() {
                    print("[Snake] Cleaning up segments");
                    if (this.segments.each) {
                        this.segments.each(cons(segment => {
                            if (segment.isValid()) {
                                segment.kill();
                            }
                        }));
                    } else {
                        for (var i = 0; i < this.segments.length; i++) {
                            var segment = this.segments[i];
                            if (segment.isValid()) {
                                segment.kill();
                            }
                        }
                    }
                    snakeHeads.remove(this.headUnit.id);
                }
            });
            
            unit.controller(snakeAI);
            snakeHeads.put(unit.id, snakeAI);
            print("[Snake] Snake AI applied successfully");
        } catch (e) {
            print("[Snake] Error applying AI: " + e);
        }
    }
}));

print("[Snake] Snake logic loaded successfully!"); 