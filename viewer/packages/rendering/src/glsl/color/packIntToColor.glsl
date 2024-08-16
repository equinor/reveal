/**
 * Packs the integer part of the number given to a RGB color.
 */
vec3 packIntToColor(highp int number) {
  float num = float(number);
  float r = floor(num / (255.0 * 255.0)) / 255.0;
  float g = mod(floor(num / 255.0), 255.0) / 255.0;
  float b = mod(num, 255.0) / 255.0;
  return vec3(r, g, b);
}
