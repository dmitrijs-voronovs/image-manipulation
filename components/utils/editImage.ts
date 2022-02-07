import { CamanInstance } from "../../types/Caman";
import { ValueConfig } from "../../config/valueConfig";
import { applyFilter } from "./applyFilter";

export const editImage = (
  caman: CamanInstance,
  config: Partial<ValueConfig>,
  cb?: () => void
) => {
  caman.reloadCanvasData();
  caman.revert(false);

  Object.entries(config).forEach(([filter, rawVal]) => {
    applyFilter(rawVal, filter, caman);
  });
  // caman.invert();

  // caman.noise(100);
  // caman.newLayer(function () {
  //   // Object.entries(config).forEach(([filter, rawVal]) => {
  //   //   if (!filtersRequireReloading.includes(filter))
  //   //     applyFilter(rawVal, filter, this);
  //   // });
  //   this.copyParent();
  //   this.fillColor("#a021bd");
  //   this.opacity(100);
  //   // this.filter.invert();
  //   this.setBlendingMode("overlay");
  //   // this.filter.noise(999);
  //   // this.copyParent();
  //   // this.filter.invert();
  //   // // this.filter.invert();
  //   // this.filter.greyscale();
  //   // this.filter.brightness(50);
  //   // this.filter.boxBlur();
  // });

  // caman.crop(300, 300, 200, 200);
  // caman.brightness(50);
  // caman.rotate(15);
  //
  // caman.render(function () {
  //   // caman.rotate(30);
  //   // caman.resize(5);
  //   // caman.render(function () {
  //   //   // caman.render()
  //   // });
  // });

  // caman.newLayer(function () {
  // const src =
  //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQQAAABQCAYAAAD/YAtfAAAD6klEQVR4nO3c6Y0jIRCGYWdCKIRCKIRCKIRCKLU/dlxdzdDQF7ZHfkt6pB3uktbfzmqPhzxEAEAeIo93PwDA5yAQACgCAYAiEAAoAgGAIhAAKAIBgCIQACgCAYAiEAAoAgGAIhAAKAIBgCIQACgCAYAiEAAoAgGAIhAAKAIBgCIQACgCAYAiEAAoAgGAIhAAKAIBgCIQACgCAYAiEAAoAgGAIhAAKAJhJiciSUSK/K8iIuHA/vRzxrv7OMOLSJal8s/Yu9+FLgJhFidLENSVduxPZn0YrI2yDp345t7DRt+jXj6tjy9EIMxSZKki6w+4yPiDYfe6ztos7Spv6ttX70iN3v0f6ONLEQgzBFkq7xi3vKzLd+5JZl2R9W9PRPZ9J3I3+6ZoxmPnXZ/Yx5ciEGbwsvyEdtWcrdbebOZj5w5XneUG46/y7Lu+276r/IE+vhSBMJOvvnayrnp9MHN5cLZdm6q5ZObCi3vu9dea+9Q+vhSB8EpBliqN+WLm/eCsZNaGzj1px7tsZTOeq7k9Pdo9tge/ccedfeAyAuFVnKw/8LGaj2Yuyf8PkO+cZ89yjbueVXa8rS63Mb6nz2DW55+znKyDIkzqA5cRCK+SZV2umi9mzv44N9bW6+t5V501eluU3x/YUL0hHug1ynbV59zZBy4jEF4hyrpiNe+lX7lxpq3WnaP5mqvuS+Zrd7BfJ+0/RsyNs+7uA5cQCLN5WVdurInVmiTjv7dgq3XvaL6lvvP5lqM9l6rfbL4uL+gDpxEIsxVZl2usyWY+mfFkxnO1x1br3tF8i5Pf1XpvT9jRS5zcB04jEGaKsq6wsa6YNd6MezNeOntcNec6+0ay2ZtP9Gz3b/Viz53VB04hEGZxsq7UWWtr71wx465zd7nw5tbZI0d7mdEHTiMQZkmyVBmstbV3zp4fqrlg5tKBN0f5XfFg30d7mdEHTiMQZrHlB2vLxlpvxku1J5q5VM0lMxd3vteZPVnW3/q7A30f7eXuPnAJgTBDkKXyjvXJrE87xh9y/78BiGZPqHqIB3q352z1Ys+7uw9cQiDMkGWpLMsfI1rRrHeyrizjv8j0kPv+lWCs7nqO26rfvOVML3f1gcsIhBn2lt0TOuti566ysafI/l9VbSUzngZv3tLrJUzsA5cRCDMU2Vf1Pi/n/tuxaO4scvy/XrNl7/M73rzlTC9X+8BlBAIARSAAUAQCAEUgAFAEAgBFIABQBAIARSAAUAQCAEUgAFAEAgBFIABQBAIARSAAUAQCAEUgAFAEAgBFIABQBAIARSAAUAQCAEUgAFAEAgBFIABQBAIARSAAUAQCAEUgAFAEAgD1DxOuXDVQeFT8AAAAAElFTkSuQmCC";
  // const img = document.createElement("img");
  // img.src = src;
  // this.overlayImage(img);
  // });

  caman.render(cb);

  //
  // this.newLayer(function() {
  //
  //
  //     this.setBlendingMode('normal');
  //     this.opacity(50);
  //     this.overlayImage("/00.jpg")
  //     Object.entries(config).forEach(([filter, rawVal]) => {
  //         const val = rawVal ?? getDefaultFilterValue(filter)
  //         if (Array.isArray(val)) {
  //             console.log('arr', val);
  //             this.filter[filter](...val)
  //         } else if (typeof val === 'boolean') {
  //             if (val) this.filter[filter]();
  //         } else if (typeof val === 'string') {
  //             if (val) this.filter[filter](val);
  //         } else {
  //             console.log('val', val);
  //             this.filter[filter](val)
  //         }
  //     })
  //
  //     this.newLayer(function() {
  //
  //
  //         this.setBlendingMode('exclusion');
  //         this.opacity(50);
  //         this.overlayImage("/01.jpg")
  //         Object.entries(config).forEach(([filter, rawVal]) => {
  //             const val = rawVal ?? getDefaultFilterValue(filter)
  //             if (Array.isArray(val)) {
  //                 console.log('arr', val);
  //                 this.filter[filter](...val)
  //             } else if (typeof val === 'boolean') {
  //                 if (val) this.filter[filter]();
  //             } else if (typeof val === 'string') {
  //                 if (val) this.filter[filter](val);
  //             } else {
  //                 console.log('val', val);
  //                 this.filter[filter](val)
  //             }
  //         })
  //
  //         // this.fillColor('#f49600');
  //         // this.invert(true);
  //     })
  //
  //     // this.fillColor('#f49600');
  //     // this.invert(true);
  // })
};
