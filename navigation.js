(function (root, factory) {
  const navigation = factory();
  if (typeof module === 'object' && module.exports) module.exports = navigation;
  else root.GameNavigation = navigation;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const bounds = Object.freeze({ minX: 4, maxX: 96, minY: 23, maxY: 88 });
  const maps = Object.freeze({
    camp: Object.freeze({
      width: 1664, height: 936,
      obstacles: Object.freeze([
        { id: 'camp-house-complex', label: 'Casa de operaciones, techo, muros y porche', points: [[4, 14], [43, 14], [44, 27], [42, 31], [42, 36], [39, 39], [35, 39], [35, 36], [28, 36], [28, 40], [25, 42], [22, 46], [17, 49], [4, 46]] },
        { id: 'camp-house-rocks', label: 'Piedras junto a la casa', points: [[4, 46], [16, 46], [21, 49], [19, 52], [9, 53], [3, 50]] },
        { id: 'camp-back-fence-left', label: 'Tramo de cerco trasero', points: [[0, 28], [17, 28], [19, 30], [0, 31]] },
        { id: 'camp-back-fence-middle', label: 'Tramo de cerco trasero', points: [[42, 27], [53, 27], [54, 29], [42, 30]] },
        { id: 'camp-guardhouse', label: 'Caseta de acceso', points: [[65, 15], [75, 15], [78, 21], [77, 29], [74, 35], [68, 37], [64, 32], [63, 24]] },
        { id: 'camp-compound-fence-north', label: 'Cerco del sector de estanques', points: [[76, 23], [100, 22], [100, 25], [77, 27]] },
        { id: 'camp-compound-fence-west', label: 'Cerco del sector de estanques', points: [[75, 28], [77, 28], [77, 43], [75, 45]] },
        { id: 'camp-compound-fence-east', label: 'Cerco del sector de estanques', points: [[98, 27], [100, 27], [100, 51], [98, 51]] },
        { id: 'camp-compound-fence-south', label: 'Cerco del sector de estanques', points: [[78, 49], [98, 49], [98, 52], [78, 52]] },
        { id: 'camp-fuel-tanks', label: 'Estanques de combustible', points: [[84, 29], [97, 28], [98, 42], [95, 45], [85, 43]] },
        { id: 'camp-barrels', label: 'Tambores junto al cerco', points: [[78, 43], [85, 42], [87, 48], [84, 51], [78, 50]] },
        { id: 'camp-bench-north', label: 'Banca y basurero', points: [[76, 53], [86, 52], [90, 57], [89, 62], [85, 64], [77, 61]] },
        { id: 'camp-bench-south', label: 'Banca del patio', points: [[66, 68], [75, 65], [80, 68], [81, 73], [77, 77], [69, 77], [65, 73]] },
        { id: 'camp-lamp', label: 'Farol del patio', points: [[63, 66], [64.5, 66], [65, 70], [64.5, 73], [62.8, 73], [62.4, 70]] },
        { id: 'camp-tent', label: 'Carpa de colación', points: [[0, 50], [20, 50], [24, 56], [23, 66], [20, 69], [0, 67]] },
        { id: 'camp-picnic-table', label: 'Mesa y bancas de colación', points: [[5, 66], [21, 64], [26, 69], [25, 79], [21, 82], [6, 81], [2, 75]] },
        { id: 'camp-cooler', label: 'Cooler junto a la carpa', points: [[7, 81], [12, 80], [14, 86], [8, 87]] },
        { id: 'camp-crates', label: 'Cajas de suministros', points: [[0, 70], [6, 70], [8, 82], [2, 84]] },
        { id: 'camp-rock-border', label: 'Rocas del borde del patio', points: [[58, 81], [69, 79], [77, 81], [85, 79], [93, 81], [100, 78], [100, 96], [67, 96], [60, 90]] },
        { id: 'camp-cacti', label: 'Cactus del borde del patio', points: [[91, 66], [96, 64], [99, 69], [99, 79], [95, 82], [91, 77]] },
        { id: 'camp-flowers-east', label: 'Flores junto a las rocas', points: [[79, 72], [83, 70], [86, 73], [85, 77], [81, 78], [78, 76]] }
      ])
    }),
    office: Object.freeze({
      width: 1664, height: 936,
      obstacles: Object.freeze([
        { id: 'office-bookcase', label: 'Librero y macetero colgante', points: [[5, 10], [27, 10], [28, 51], [25, 54], [5, 52]] },
        { id: 'office-filing-cabinets', label: 'Archivadores', points: [[28, 10], [40, 10], [41, 41], [38, 44], [28, 42]] },
        { id: 'office-crates', label: 'Cajas junto al librero', points: [[1, 39], [11, 39], [12, 54], [8, 57], [2, 54]] },
        { id: 'office-map-table', label: 'Mesa de mapas y bancos', points: [[5, 47], [34, 47], [35, 78], [30, 82], [7, 80]] },
        { id: 'office-cactus-pot', label: 'Cactus en macetero', points: [[1, 72], [5, 69], [8, 75], [8, 89], [4, 92], [1, 88]] },
        { id: 'office-chair', label: 'Sillón detrás del escritorio', points: [[57, 22], [65, 22], [68, 31], [65, 38], [58, 38], [55, 32]] },
        { id: 'office-desk', label: 'Escritorio y objetos de trabajo', points: [[46, 29], [74, 27], [76, 37], [75, 54], [71, 58], [51, 58], [46, 54]] },
        { id: 'office-side-cabinet', label: 'Mueble lateral, roca y farol', points: [[80, 36], [96, 36], [97, 56], [94, 59], [81, 57]] },
        { id: 'office-bin', label: 'Paragüero y tubos', points: [[95, 50], [99, 50], [100, 63], [96, 65], [94, 59]] },
        { id: 'office-door-panel', label: 'Hoja de la puerta', points: [[91, 61], [95, 60], [97, 81], [93, 84]] }
      ])
    }),
    station: Object.freeze({
      width: 1672, height: 941,
      obstacles: Object.freeze([
        { id: 'station-west-cliffs', label: 'Acantilado y roquerío del borde oeste', points: [[0, 0], [9, 0], [12, 12], [11, 22], [8, 31], [10, 38], [7, 47], [0, 50]] },
        { id: 'station-pump-house', label: 'Edificio de bombeo', points: [[5, 21], [18, 18], [33, 19], [37, 24], [38, 36], [35, 44], [29, 49], [17, 52], [7, 50], [4, 44]] },
        { id: 'station-pump-platform', label: 'Bombas, barandas y plataforma', points: [[19, 41], [31, 39], [36, 42], [40, 46], [40, 51], [35, 53], [24, 53], [19, 49], [17, 46]] },
        { id: 'station-treatment-building', label: 'Edificio de tratamiento y estanques', points: [[41, 21], [56, 18], [64, 20], [67, 25], [66, 31], [62, 36], [57, 41], [48, 42], [43, 39], [40, 34], [39, 27]] },
        { id: 'station-filter-rack', label: 'Filtros, tubería y estructura de soporte', points: [[55, 30], [62, 29], [67, 32], [69, 36], [67, 40], [63, 44], [58, 43], [55, 39], [53, 35]] },
        { id: 'station-pump-pipe', label: 'Tubería de bombeo y soportes', points: [[20, 59], [22, 56], [25, 54], [29, 55], [31, 58], [30, 61], [26, 64], [22, 63], [20, 61]] },
        { id: 'station-east-shed', label: 'Caseta técnica y cerco posterior', points: [[70, 22], [83, 22], [88, 27], [88, 35], [83, 39], [72, 38], [68, 32]] },
        { id: 'station-west-water', label: 'Poza y roquerío de la quebrada oeste', points: [[0, 74], [10, 71], [20, 74], [29, 81], [34, 89], [32, 100], [0, 100]] },
        { id: 'station-east-pool', label: 'Poza y vegetación densa del borde este', points: [[88, 42], [100, 40], [100, 69], [96, 70], [91, 66], [88, 59], [84, 51]] },
        { id: 'station-southeast-wetland', label: 'Humedal y rocas del borde sureste', points: [[91, 70], [100, 68], [100, 100], [61, 100], [62, 91], [75, 84], [84, 78], [88, 73]] },
        { id: 'station-bottom-rocks', label: 'Rocas del borde sur', points: [[0, 94], [21, 94], [28, 100], [0, 100]] }
      ])
    })
  });

  function rectMetrics(map, rect) {
    const scale = Math.max(rect.width / map.width, rect.height / map.height);
    const drawnWidth = map.width * scale;
    const drawnHeight = map.height * scale;
    return {
      scale,
      left: (rect.width - drawnWidth) / 2,
      top: (rect.height - drawnHeight) / 2
    };
  }

  function imagePointToPixels(point, map, rect, metrics = rectMetrics(map, rect)) {
    return {
      x: (point[0] / 100 * map.width * metrics.scale) + metrics.left,
      y: (point[1] / 100 * map.height * metrics.scale) + metrics.top
    };
  }

  function scenePointToPixels(x, y, rect) {
    return { x: x / 100 * rect.width, y: y / 100 * rect.height };
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      const crosses = (a.y > point.y) !== (b.y > point.y) &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / ((b.y - a.y) || Number.EPSILON) + a.x;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x, dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)) : 0;
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  }

  function dynamicObstacleBlocks(x, y, rect, obstacles) {
    if (!rect || rect.width <= 0 || rect.height <= 0 || !obstacles?.length) return false;
    const point = scenePointToPixels(x, y, rect);
    return obstacles.some(obstacle => {
      if (!Number.isFinite(obstacle.x) || !Number.isFinite(obstacle.y) || !Number.isFinite(obstacle.radiusPx)) return false;
      const center = scenePointToPixels(obstacle.x, obstacle.y, rect);
      return Math.hypot(point.x - center.x, point.y - center.y) < obstacle.radiusPx;
    });
  }

  function isBlocked(sceneName, x, y, rect, clearancePx = 0, dynamicObstacles = []) {
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) return true;
    if (dynamicObstacleBlocks(x, y, rect, dynamicObstacles)) return true;
    const map = maps[sceneName];
    if (!map || !rect || rect.width <= 0 || rect.height <= 0) return false;
    const point = scenePointToPixels(x, y, rect);
    const metrics = rectMetrics(map, rect);
    for (const obstacle of map.obstacles) {
      const polygon = obstacle.points.map(p => imagePointToPixels(p, map, rect, metrics));
      if (pointInPolygon(point, polygon)) return true;
      if (clearancePx > 0) {
        for (let i = 0; i < polygon.length; i++) {
          if (distanceToSegment(point, polygon[i], polygon[(i + 1) % polygon.length]) <= clearancePx) return true;
        }
      }
    }
    return false;
  }

  function MinHeap() { this.items = []; }
  MinHeap.prototype.push = function (item) {
    const items = this.items;
    let index = items.length;
    items.push(item);
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[parent].score <= item.score) break;
      items[index] = items[parent]; index = parent;
    }
    items[index] = item;
  };
  MinHeap.prototype.pop = function () {
    const items = this.items;
    if (!items.length) return null;
    const first = items[0], last = items.pop();
    if (items.length) {
      let index = 0;
      while (true) {
        const left = index * 2 + 1, right = left + 1;
        if (left >= items.length) break;
        const child = right < items.length && items[right].score < items[left].score ? right : left;
        if (items[child].score >= last.score) break;
        items[index] = items[child]; index = child;
      }
      items[index] = last;
    }
    return first;
  };

  function buildGrid(sceneName, rect, clearancePx, dynamicObstacles = []) {
    const widthPx = rect.width * (bounds.maxX - bounds.minX) / 100;
    const heightPx = rect.height * (bounds.maxY - bounds.minY) / 100;
    const stepPx = Math.max(19, Math.min(30, Math.min(rect.width, rect.height) * 0.035));
    const cols = Math.max(2, Math.ceil(widthPx / stepPx) + 1);
    const rows = Math.max(2, Math.ceil(heightPx / stepPx) + 1);
    const xs = Array.from({ length: cols }, (_, c) => bounds.minX + c / (cols - 1) * (bounds.maxX - bounds.minX));
    const ys = Array.from({ length: rows }, (_, r) => bounds.minY + r / (rows - 1) * (bounds.maxY - bounds.minY));
    const blocked = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      blocked[r * cols + c] = isBlocked(sceneName, xs[c], ys[r], rect, clearancePx, dynamicObstacles) ? 1 : 0;
    }
    return { cols, rows, xs, ys, blocked, rect };
  }

  function nearestGridIndex(grid, point, maxDistancePx = Infinity) {
    const targetPx = scenePointToPixels(point.x, point.y, grid.rect);
    let best = -1, bestDistance = Infinity;
    for (let r = 0; r < grid.rows; r++) for (let c = 0; c < grid.cols; c++) {
      const index = r * grid.cols + c;
      if (grid.blocked[index]) continue;
      const p = scenePointToPixels(grid.xs[c], grid.ys[r], grid.rect);
      const distance = Math.hypot(p.x - targetPx.x, p.y - targetPx.y);
      if (distance < bestDistance) { best = index; bestDistance = distance; }
    }
    return bestDistance <= maxDistancePx ? { index: best, distancePx: bestDistance } : null;
  }

  function reconstructPath(cameFrom, index, startIndex, grid) {
    const path = [];
    while (index !== startIndex && index >= 0) {
      const row = Math.floor(index / grid.cols), col = index % grid.cols;
      path.push({ x: grid.xs[col], y: grid.ys[row] });
      index = cameFrom[index];
    }
    path.reverse();
    return path;
  }

  function findPath(sceneName, start, target, rect, options = {}) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    const clearancePx = options.clearancePx || 0;
    const grid = buildGrid(sceneName, rect, clearancePx, options.dynamicObstacles || []);
    const cellPx = Math.max(rect.width / grid.cols, rect.height / grid.rows);
    const startCandidate = nearestGridIndex(grid, start, cellPx * 2.4);
    if (!startCandidate) return null;
    const interactionRangePct = options.interactionRangePct || 0;
    const clickTolerancePx = Math.hypot(rect.width / (grid.cols - 1), rect.height / (grid.rows - 1)) * 0.55;
    const targetPx = scenePointToPixels(target.x, target.y, rect);
    const goals = new Uint8Array(grid.cols * grid.rows);
    let goalCount = 0;
    for (let r = 0; r < grid.rows; r++) for (let c = 0; c < grid.cols; c++) {
      const index = r * grid.cols + c;
      if (grid.blocked[index]) continue;
      const p = scenePointToPixels(grid.xs[c], grid.ys[r], rect);
      const inInteractionRange = interactionRangePct > 0 && Math.hypot(grid.xs[c] - target.x, grid.ys[r] - target.y) <= interactionRangePct;
      const inClickTolerance = interactionRangePct <= 0 && Math.hypot(p.x - targetPx.x, p.y - targetPx.y) <= clickTolerancePx;
      if (inInteractionRange || inClickTolerance) { goals[index] = 1; goalCount++; }
    }
    if (!goalCount) return null;

    const count = grid.cols * grid.rows;
    const scores = new Float64Array(count); scores.fill(Infinity);
    const cameFrom = new Int32Array(count); cameFrom.fill(-1);
    const closed = new Uint8Array(count);
    const startIndex = startCandidate.index;
    const startRow = Math.floor(startIndex / grid.cols), startCol = startIndex % grid.cols;
    const pointAt = index => ({ x: grid.xs[index % grid.cols], y: grid.ys[Math.floor(index / grid.cols)] });
    const heuristic = index => {
      const p = scenePointToPixels(pointAt(index).x, pointAt(index).y, rect);
      return Math.hypot(p.x - targetPx.x, p.y - targetPx.y);
    };
    const heap = new MinHeap();
    scores[startIndex] = 0;
    heap.push({ index: startIndex, score: heuristic(startIndex) });
    let goalIndex = -1;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    while (heap.items.length) {
      const current = heap.pop().index;
      if (closed[current]) continue;
      if (goals[current]) { goalIndex = current; break; }
      closed[current] = 1;
      const row = Math.floor(current / grid.cols), col = current % grid.cols;
      for (const [dc, dr] of directions) {
        const nc = col + dc, nr = row + dr;
        if (nc < 0 || nr < 0 || nc >= grid.cols || nr >= grid.rows) continue;
        const next = nr * grid.cols + nc;
        if (grid.blocked[next] || closed[next]) continue;
        if (dc && dr && (grid.blocked[row * grid.cols + nc] || grid.blocked[nr * grid.cols + col])) continue;
        const a = scenePointToPixels(grid.xs[col], grid.ys[row], rect);
        const b = scenePointToPixels(grid.xs[nc], grid.ys[nr], rect);
        const tentative = scores[current] + Math.hypot(b.x - a.x, b.y - a.y);
        if (tentative >= scores[next]) continue;
        cameFrom[next] = current;
        scores[next] = tentative;
        heap.push({ index: next, score: tentative + heuristic(next) });
      }
    }
    if (goalIndex < 0) return null;
    const path = reconstructPath(cameFrom, goalIndex, startIndex, grid);
    return { points: path, endpoint: path[path.length - 1] || pointAt(startIndex), start: pointAt(startIndex) };
  }

  function findNearestWalkable(sceneName, point, rect, clearancePx = 0) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    const grid = buildGrid(sceneName, rect, clearancePx);
    const nearest = nearestGridIndex(grid, point);
    if (!nearest) return null;
    const index = nearest.index;
    return { x: grid.xs[index % grid.cols], y: grid.ys[Math.floor(index / grid.cols)] };
  }

  function renderOverlay(svg, sceneName, rect) {
    if (!svg) return;
    svg.replaceChildren();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const map = maps[sceneName];
    if (!map) return;
    const ns = 'http://www.w3.org/2000/svg';
    const add = (tag, attrs, parent = svg) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      parent.appendChild(node);
      return node;
    };
    add('rect', { x: bounds.minX * 10, y: bounds.minY * 10, width: (bounds.maxX - bounds.minX) * 10, height: (bounds.maxY - bounds.minY) * 10, class: 'nav-walkable' });
    const metrics = rectMetrics(map, rect);
    map.obstacles.forEach(obstacle => {
      const points = obstacle.points.map(point => {
        const pixel = imagePointToPixels(point, map, rect, metrics);
        return `${pixel.x / rect.width * 1000},${pixel.y / rect.height * 1000}`;
      }).join(' ');
      const polygon = add('polygon', { points, class: 'nav-blocked', 'data-obstacle': obstacle.id });
      const title = document.createElementNS(ns, 'title'); title.textContent = obstacle.label; polygon.appendChild(title);
    });
  }

  return Object.freeze({ maps, bounds, isBlocked, findPath, findNearestWalkable, renderOverlay });
});
