export type Point2D = {
  x: number;
  y: number;
};

export type TreemapItem = {
  color: string;
  label: string;
  value: number;
};

export type TreemapRect = TreemapItem & {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type FunnelStep = {
  color: string;
  label: string;
  value: number;
};

export type FunnelSegment = FunnelStep & {
  centerY: number;
  points: string;
};

export function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function scaleLinear(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
) {
  if (domainMax === domainMin) {
    return rangeMin;
  }

  const ratio = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + ratio * (rangeMax - rangeMin);
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): Point2D {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
) {
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const innerWidth = Math.max(1, width - padding * 2);
  const innerHeight = Math.max(1, height - padding * 2);
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: padding + stepX * index,
    y: padding + innerHeight - scaleLinear(value, minValue, maxValue, 0, innerHeight),
  }));
}

export function buildPolyline(points: Point2D[]) {
  return points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}

export function buildLinePath(points: Point2D[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

export function buildAreaPath(points: Point2D[], baseline: number) {
  if (!points.length) {
    return '';
  }

  const head = points[0];
  const tail = points[points.length - 1];

  return `${buildLinePath(points)} L ${tail.x.toFixed(1)} ${baseline.toFixed(1)} L ${head.x.toFixed(1)} ${baseline.toFixed(1)} Z`;
}

export function buildRadarPoints(
  values: number[],
  maxValue: number,
  centerX: number,
  centerY: number,
  radius: number,
) {
  return values.map((value, index) => {
    const angle = (360 / values.length) * index;
    const pointRadius = scaleLinear(value, 0, maxValue, 0, radius);
    return polarToCartesian(centerX, centerY, pointRadius, angle);
  });
}

export function buildTreemapLayout(
  items: TreemapItem[],
  width: number,
  height: number,
  vertical = true,
): TreemapRect[] {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const rects: TreemapRect[] = [];
  let offset = 0;

  items.forEach(item => {
    const ratio = total > 0 ? item.value / total : 0;

    if (vertical) {
      const rectWidth = width * ratio;
      rects.push({
        ...item,
        x: offset,
        y: 0,
        width: rectWidth,
        height,
      });
      offset += rectWidth;
      return;
    }

    const rectHeight = height * ratio;
    rects.push({
      ...item,
      x: 0,
      y: offset,
      width,
      height: rectHeight,
    });
    offset += rectHeight;
  });

  return rects;
}

export function buildFunnelLayout(
  steps: FunnelStep[],
  width: number,
  height: number,
  gap = 12,
) {
  const maxValue = Math.max(...steps.map(step => step.value));
  const segmentHeight = (height - gap * (steps.length - 1)) / steps.length;

  return steps.map((step, index) => {
    const topWidth = scaleLinear(step.value, 0, maxValue, width * 0.36, width);
    const nextValue =
      index === steps.length - 1 ? step.value * 0.72 : steps[index + 1].value;
    const bottomWidth = scaleLinear(nextValue, 0, maxValue, width * 0.28, width);
    const topLeft = (width - topWidth) / 2;
    const bottomLeft = (width - bottomWidth) / 2;
    const y = index * (segmentHeight + gap);
    const bottomY = y + segmentHeight;

    return {
      ...step,
      centerY: y + segmentHeight / 2,
      points: `${topLeft.toFixed(1)},${y.toFixed(1)} ${(topLeft + topWidth).toFixed(1)},${y.toFixed(1)} ${(bottomLeft + bottomWidth).toFixed(1)},${bottomY.toFixed(1)} ${bottomLeft.toFixed(1)},${bottomY.toFixed(1)}`,
    };
  });
}
