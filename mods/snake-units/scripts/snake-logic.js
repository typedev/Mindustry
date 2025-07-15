// Snake Unit Logic for Mindustry
print("[Snake] Loading snake logic...");

var snakeSystem = {
    snakes: new java.util.HashMap(),
    
    createSnake(headUnit) {
        var snake = {
            head: headUnit,
            segments: new Seq(),
            maxSegments: 3,
            segmentSpacing: 16,
            updateCounter: 0,
            headHistory: new Seq(), // История позиций головы для сглаживания
            historySize: 10,
            
            update() {
                this.updateCounter++;
                
                // Записываем историю позиций головы
                var headPos = new Vec2(this.head.x, this.head.y);
                this.headHistory.add(headPos);
                while (this.headHistory.size > this.historySize) {
                    this.headHistory.remove(0);
                }
                
                // Не проверяем isValid() слишком часто - только каждые 20 обновлений
                if (this.updateCounter % 20 === 0) {
                    if (!this.head.isValid()) {
                        print("[Snake] Head " + this.head.id + " became invalid after " + this.updateCounter + " updates");
                        this.cleanup();
                        return false;
                    }
                }
                
                // Создаем сегменты после небольшой задержки
                if (this.segments.size === 0 && this.updateCounter > 5) {
                    this.spawnSegments();
                }
                
                // Очищаем невалидные сегменты
                this.cleanupInvalidSegments();
                
                // Обновляем позиции сегментов
                this.updateSegments();
                
                return true;
            },
            
            spawnSegments() {
                var segmentType = null;
                Vars.content.units().each(cons(unitType => {
                    if (unitType.name.equals("snake-units-serpent-segment")) {
                        segmentType = unitType;
                    }
                }));
                
                if (!segmentType) {
                    print("[Snake] ERROR: Segment type not found!");
                    return;
                }
                
                print("[Snake] Spawning segments for head " + this.head.id);
                
                // Создаем сегменты позади головы
                for (var i = 0; i < this.maxSegments; i++) {
                    var offsetDistance = (i + 1) * this.segmentSpacing;
                    var segment = segmentType.spawn(
                        this.head.x - offsetDistance, 
                        this.head.y
                    );
                    segment.team = this.head.team;
                    this.segments.add(segment);
                }
                print("[Snake] Spawned " + this.segments.size + " segments");
            },
            
            cleanupInvalidSegments() {
                for (var i = this.segments.size - 1; i >= 0; i--) {
                    var segment = this.segments.get(i);
                    if (!segment || !segment.isValid()) {
                        this.segments.removeIndex(i);
                    }
                }
            },
            
            updateSegments() {
                for (var i = 0; i < this.segments.size; i++) {
                    var segment = this.segments.get(i);
                    if (!segment || !segment.isValid()) continue;
                    
                    var target;
                    
                    // Первый сегмент следует за сглаженной позицией головы
                    if (i === 0) {
                        target = this.getSmoothedHeadPosition(2); // Небольшая задержка для сглаживания
                    } else {
                        // Остальные сегменты следуют за предыдущим сегментом
                        var prevSegment = this.segments.get(i - 1);
                        if (prevSegment && prevSegment.isValid()) {
                            target = new Vec2(prevSegment.x, prevSegment.y);
                        } else {
                            continue;
                        }
                    }
                    
                    var dx = target.x - segment.x;
                    var dy = target.y - segment.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Умное движение - мгновенное для больших расстояний, плавное для малых
                    if (dist > this.segmentSpacing * 2) {
                        // Большое расстояние - быстрое приближение
                        var ratio = this.segmentSpacing / dist;
                        var desiredX = target.x - dx * ratio;
                        var desiredY = target.y - dy * ratio;
                        segment.set(desiredX, desiredY);
                        segment.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
                    } else if (dist > this.segmentSpacing) {
                        // Среднее расстояние - плавная интерполяция с высокой скоростью
                        var ratio = this.segmentSpacing / dist;
                        var desiredX = target.x - dx * ratio;
                        var desiredY = target.y - dy * ratio;
                        
                        // Очень высокая скорость интерполяции для плавности
                        var moveSpeed = 0.95;
                        var moveX = (desiredX - segment.x) * moveSpeed;
                        var moveY = (desiredY - segment.y) * moveSpeed;
                        
                        segment.set(segment.x + moveX, segment.y + moveY);
                        segment.rotation = Math.atan2(moveY, moveX) * 180 / Math.PI;
                    }
                    // Если расстояние меньше segmentSpacing - не двигаемся (устраняет дрожание)
                }
            },
            
            getSmoothedHeadPosition(delay) {
                // Возвращаем позицию головы с небольшой задержкой для сглаживания
                var historyIndex = this.headHistory.size - 1 - delay;
                if (historyIndex >= 0 && historyIndex < this.headHistory.size) {
                    return this.headHistory.get(historyIndex);
                } else if (this.headHistory.size > 0) {
                    return this.headHistory.get(this.headHistory.size - 1);
                } else {
                    return new Vec2(this.head.x, this.head.y);
                }
            },
            
            cleanup() {
                print("[Snake] Cleaning up snake " + this.head.id);
                this.segments.each(cons(segment => {
                    if (segment && segment.isValid()) {
                        segment.kill();
                    }
                }));
                this.segments.clear();
                this.headHistory.clear();
                snakeSystem.snakes.remove(this.head.id);
            }
        };
        
        this.snakes.put(headUnit.id, snake);
        print("[Snake] Created snake for head " + headUnit.id);
        return snake;
    },
    
    update() {
        var iterator = this.snakes.values().iterator();
        var snakesToRemove = new Seq();
        
        while (iterator.hasNext()) {
            var snake = iterator.next();
            if (!snake.update()) {
                snakesToRemove.add(snake.head.id);
            }
        }
        
        // Удаляем неактивные змеи
        snakesToRemove.each(cons(headId => {
            this.snakes.remove(headId);
        }));
    },
    
    getSnake(headUnit) {
        return this.snakes.get(headUnit.id);
    },
    
    hasSnake(headUnit) {
        return this.snakes.containsKey(headUnit.id);
    }
};

// Event to register new serpent-head units
Events.on(EventType.UnitCreateEvent, cons(event => {
    if (!event.unit) return;
    
    var unit = event.unit;
    
    // Check if this is a serpent head
    if (unit.type && unit.type.name.equals("snake-units-serpent-head")) {
        snakeSystem.createSnake(unit);
    }
}));

// Global update timer - максимальная частота для идеальной плавности
Timer.schedule(() => {
    snakeSystem.update();
}, 0, 0.016); // Обновление каждые 16ms (~60 FPS) для максимальной плавности

// Cleanup when units are destroyed
Events.on(EventType.UnitDestroyEvent, cons(event => {
    if (!event.unit) return;
    
    var unit = event.unit;
    
    if (unit.type && unit.type.name.equals("snake-units-serpent-head")) {
        var snake = snakeSystem.getSnake(unit);
        if (snake) {
            snake.cleanup();
        }
    }
}));

print("[Snake] Snake logic loaded successfully!"); 