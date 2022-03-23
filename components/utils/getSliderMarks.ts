export function getSliderMarks(min: number, max: number, markCount = 10) {
  const total = min > max ? min - max : max - min;
  const markStep = total / markCount;
  return Array.from({ length: markCount - 1 }).reduce<Record<string, string>>(
    (acc, _, i) => {
      const relativeMarker = markStep * (i + 1);
      const marker = min < 0 ? relativeMarker + min : relativeMarker - min;
      acc[marker] = String(marker.toFixed(1));
      return acc;
    },
    {}
  );
}
