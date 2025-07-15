# Руководство по настройке и модификации мода Snake Units

## Быстрая настройка

### Основные параметры в `snake-logic.js`:

```javascript
// Строка 12-17: Основные настройки змеи
maxSegments: 5,                    // Количество сегментов (2-20 рекомендуется)
segmentSpacing: 10,                // Расстояние между сегментами (8-20)
historySize: 20,                   // Буфер сглаживания (10-50)
```

```javascript
// Строка 96: Минимальное движение
var minMoveThreshold = 1.5;        // Устранение дрожания (0.5-3.0)
```

```javascript
// Строка 117: Скорость интерполяции
var moveSpeed = 0.25;              // Плавность движения (0.1-1.0)
```

```javascript
// Строка 252: Частота обновлений
Timer.schedule(() => { ... }, 0, 0.016);  // 60 FPS (0.016-0.05)
```

## Настройка поведения

### 1. Изменение длины змеи

**Простое изменение:**
```javascript
maxSegments: 8,  // Увеличить до 8 сегментов
```

**Динамическое изменение (требует модификации):**
```javascript
// Добавить в объект snake:
growSegment() {
    if (this.segments.size < this.maxSegments) {
        // Код создания нового сегмента
    }
},

shrinkSegment() {
    if (this.segments.size > 1) {
        var lastSegment = this.segments.get(this.segments.size - 1);
        if (lastSegment && lastSegment.isValid()) {
            lastSegment.kill();
        }
        this.segments.remove(this.segments.size - 1);
    }
}
```

### 2. Настройка плавности движения

**Более плавное движение:**
```javascript
var minMoveThreshold = 0.8;        // Меньше порог
var moveSpeed = 0.15;              // Медленнее интерполяция
historySize: 30,                   // Больше буфер сглаживания
```

**Более отзывчивое движение:**
```javascript
var minMoveThreshold = 2.5;        // Больше порог
var moveSpeed = 0.4;               // Быстрее интерполяция
historySize: 10,                   // Меньше буфер сглаживания
```

### 3. Настройка расстояний

**Более компактная змея:**
```javascript
segmentSpacing: 6,                 // Меньше расстояние
// И изменить пороги движения:
} else if (dist > segmentSpacing * 1.8) {  // Было 2.0
} else if (dist > segmentSpacing * 0.5) {  // Было 0.7
```

**Более растянутая змея:**
```javascript
segmentSpacing: 16,                // Больше расстояние
// И изменить пороги движения:
} else if (dist > segmentSpacing * 2.5) {  // Было 2.0
} else if (dist > segmentSpacing * 0.9) {  // Было 0.7
```

## Продвинутые модификации

### 1. Добавление разных типов сегментов

```javascript
// В функции spawnSegments() заменить:
for (var i = 0; i < this.maxSegments; i++) {
    var segmentType = this.getSegmentType(i);  // Новая функция
    var segment = segmentType.spawn(
        this.head.x - offsetDistance, 
        this.head.y
    );
    // Добавить уникальные свойства сегмента
    segment.segmentIndex = i;
    segment.segmentRole = this.getSegmentRole(i);
}

// Добавить новые функции:
getSegmentType(index) {
    // Возвращать разные типы в зависимости от позиции
    if (index === 0) return basicSegmentType;
    if (index < 3) return armoredSegmentType;
    return weaponSegmentType;
},

getSegmentRole(index) {
    if (index === 0) return "neck";
    if (index < this.maxSegments / 2) return "body";
    return "tail";
}
```

### 2. Система здоровья сегментов

```javascript
// Добавить в объект snake:
segmentHealth: new Seq(),

// При создании сегментов:
this.segmentHealth.add(100);  // Начальное здоровье

// Обработка урона:
damageSegment(index, damage) {
    var currentHealth = this.segmentHealth.get(index);
    currentHealth -= damage;
    this.segmentHealth.set(index, currentHealth);
    
    if (currentHealth <= 0) {
        this.removeSegment(index);
    }
},

removeSegment(index) {
    var segment = this.segments.get(index);
    if (segment && segment.isValid()) {
        segment.kill();
    }
    this.segments.remove(index);
    this.segmentHealth.remove(index);
    this.maxSegments--; // Постоянное уменьшение
}
```

### 3. Специальные способности

```javascript
// Добавить в объект snake:
specialAbilities: {
    lastAttackTime: 0,
    
    bodySlam() {
        var currentTime = Time.millis();
        if (currentTime - this.lastAttackTime < 5000) return; // Кулдаун 5 сек
        
        // Нанести урон всем врагам рядом с сегментами
        this.segments.each(cons(segment => {
            Units.nearbyEnemies(segment.team, segment.x, segment.y, 32, cons(enemy => {
                enemy.damage(50);
            }));
        }));
        
        this.lastAttackTime = currentTime;
    },
    
    coil() {
        // Свернуться в кольцо для защиты
        var center = new Vec2(this.head.x, this.head.y);
        var radius = this.segments.size * 2;
        
        for (var i = 0; i < this.segments.size; i++) {
            var angle = (i / this.segments.size) * 2 * Math.PI;
            var targetX = center.x + Math.cos(angle) * radius;
            var targetY = center.y + Math.sin(angle) * radius;
            
            var segment = this.segments.get(i);
            segment.set(targetX, targetY);
        }
    }
}
```

### 4. Интеграция с игровыми событиями

```javascript
// Рост при уничтожении врагов:
Events.on(EventType.UnitDestroyEvent, cons(event => {
    var killedUnit = event.unit;
    
    // Найти змею, которая могла убить этого врага
    var iterator = snakeSystem.snakes.values().iterator();
    while (iterator.hasNext()) {
        var snake = iterator.next();
        if (snake.head.team !== killedUnit.team) {
            var distToHead = Mathf.dst(snake.head.x, snake.head.y, killedUnit.x, killedUnit.y);
            
            // Если голова рядом с убитым врагом
            if (distToHead < 64) {
                snake.growFromKill(killedUnit);
                break;
            }
        }
    }
}));

// Функция роста:
growFromKill(killedUnit) {
    if (this.segments.size < this.maxSegments + 3) { // Ограничение роста
        this.spawnAdditionalSegment();
        // Восстановление здоровья
        this.head.heal(10);
    }
}
```

## Отладка и диагностика

### Включение расширенного логирования:

```javascript
// В начале файла добавить:
var DEBUG_MODE = true;

// Заменить все print() на:
function debugLog(message) {
    if (DEBUG_MODE) {
        print("[Snake Debug] " + message);
    }
}

// Добавить мониторинг производительности:
var performanceCounter = 0;
var lastPerformanceReport = 0;

// В функции update():
performanceCounter++;
var currentTime = Time.millis();
if (currentTime - lastPerformanceReport > 5000) { // Каждые 5 секунд
    debugLog("Active snakes: " + snakeSystem.snakes.size() + 
             ", Updates per second: " + (performanceCounter / 5));
    performanceCounter = 0;
    lastPerformanceReport = currentTime;
}
```

### Визуальная отладка:

```javascript
// Добавить в updateSegments():
if (DEBUG_MODE) {
    // Рисование линий между сегментами
    Draw.color(Color.red);
    for (var i = 0; i < this.segments.size - 1; i++) {
        var seg1 = this.segments.get(i);
        var seg2 = this.segments.get(i + 1);
        if (seg1 && seg2 && seg1.isValid() && seg2.isValid()) {
            Lines.line(seg1.x, seg1.y, seg2.x, seg2.y);
        }
    }
    Draw.reset();
}
```

## Оптимизация производительности

### Для большого количества змей:

```javascript
// Уменьшить частоту обновлений:
Timer.schedule(() => { snakeSystem.update(); }, 0, 0.033); // 30 FPS

// Упростить проверки валидности:
if (this.updateCounter % 40 === 0) { // Каждые 40 кадров вместо 20

// Ограничить размер буфера истории:
historySize: 10, // Вместо 20

// Увеличить пороги движения:
var minMoveThreshold = 2.5; // Меньше мелких движений
```

### Для слабых устройств:

```javascript
// Адаптивная частота обновлений:
var targetFPS = 30;
var updateInterval = 1.0 / targetFPS;

Timer.schedule(() => {
    var startTime = Time.nanos();
    snakeSystem.update();
    var updateTime = (Time.nanos() - startTime) / 1000000; // В миллисекундах
    
    // Если обновление занимает слишком много времени, снизить частоту
    if (updateTime > updateInterval * 500) { // 50% от бюджета кадра
        targetFPS = Math.max(20, targetFPS - 1);
        updateInterval = 1.0 / targetFPS;
    }
}, 0, updateInterval);
```

## Заключение

Данное руководство покрывает основные аспекты настройки и модификации мода Snake Units. Для более сложных изменений рекомендуется изучить техническую документацию и исходный код системы.

**Рекомендации по безопасности:**
- Всегда делайте резервные копии перед изменениями
- Тестируйте изменения на небольших картах
- Следите за производительностью при добавлении новых функций
- Используйте отладочный режим для диагностики проблем 