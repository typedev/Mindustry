# Инструкция по копированию спрайтов

## Откуда копировать
Исходная папка: `mods/1ourarobas/1ourarobas/sprites/`

## Куда копировать
Целевая папка: `mods/tank-t1/sprites/`

## Копирование файлов

### 1. Материалы
**Откуда**: `mods/1ourarobas/1ourarobas/sprites/items/`
**Куда**: `mods/tank-t1/sprites/items/`

Скопировать и переименовать:
- `4oxizirc.png` → `oxizirc.png`
- `6zinc.png` → `zinc.png`
- `2zirconium.png` → `zirconium.png`

### 2. Юнит
**Откуда**: `mods/1ourarobas/1ourarobas/sprites/units/tank/`
**Куда**: `mods/tank-t1/sprites/units/`

Скопировать (без переименования):
- `tank-t1.png`
- `tank-t1-ui.png`
- `tank-t1-cell.png`
- `tank-t1-full.png`
- `tank-t1-treads.png`

### 3. Оружие
**Откуда**: `mods/1ourarobas/1ourarobas/sprites/units/wearpons/`
**Куда**: `mods/tank-t1/sprites/units/weapons/`

Скопировать и переименовать:
- `tank-t1-wearpon.png` → `tank-t1-weapon.png`

### 4. Фабрика
**Откуда**: `mods/1ourarobas/1ourarobas/sprites/blocks/units/`
**Куда**: `mods/tank-t1/sprites/blocks/units/`

Скопировать и переименовать:
- `unt-2tank-fabricator.png` → `tank-fabricator.png`
- `unt-2tank-fabricator-top.png` → `tank-fabricator-top.png`

## Командная строка (для тех, кто предпочитает)

```bash
# Переход в папку Mindustry
cd "C:\Program Files (x86)\Steam\steamapps\common\Mindustry"

# Материалы
copy "mods\1ourarobas\1ourarobas\sprites\items\4oxizirc.png" "mods\tank-t1\sprites\items\oxizirc.png"
copy "mods\1ourarobas\1ourarobas\sprites\items\6zinc.png" "mods\tank-t1\sprites\items\zinc.png"
copy "mods\1ourarobas\1ourarobas\sprites\items\2zirconium.png" "mods\tank-t1\sprites\items\zirconium.png"

# Юнит
copy "mods\1ourarobas\1ourarobas\sprites\units\tank\tank-t1.png" "mods\tank-t1\sprites\units\"
copy "mods\1ourarobas\1ourarobas\sprites\units\tank\tank-t1-ui.png" "mods\tank-t1\sprites\units\"
copy "mods\1ourarobas\1ourarobas\sprites\units\tank\tank-t1-cell.png" "mods\tank-t1\sprites\units\"
copy "mods\1ourarobas\1ourarobas\sprites\units\tank\tank-t1-full.png" "mods\tank-t1\sprites\units\"
copy "mods\1ourarobas\1ourarobas\sprites\units\tank\tank-t1-treads.png" "mods\tank-t1\sprites\units\"

# Оружие
copy "mods\1ourarobas\1ourarobas\sprites\units\wearpons\tank-t1-wearpon.png" "mods\tank-t1\sprites\units\weapons\tank-t1-weapon.png"

# Фабрика
copy "mods\1ourarobas\1ourarobas\sprites\blocks\units\unt-2tank-fabricator.png" "mods\tank-t1\sprites\blocks\units\tank-fabricator.png"
copy "mods\1ourarobas\1ourarobas\sprites\blocks\units\unt-2tank-fabricator-top.png" "mods\tank-t1\sprites\blocks\units\tank-fabricator-top.png"
```

## Проверка
После копирования структура должна выглядеть так:

```
mods/tank-t1/
├── sprites/
│   ├── items/
│   │   ├── oxizirc.png
│   │   ├── zinc.png
│   │   └── zirconium.png
│   ├── units/
│   │   ├── tank-t1.png
│   │   ├── tank-t1-ui.png
│   │   ├── tank-t1-cell.png
│   │   ├── tank-t1-full.png
│   │   ├── tank-t1-treads.png
│   │   └── weapons/
│   │       └── tank-t1-weapon.png
│   └── blocks/
│       └── units/
│           ├── tank-fabricator.png
│           └── tank-fabricator-top.png
``` 