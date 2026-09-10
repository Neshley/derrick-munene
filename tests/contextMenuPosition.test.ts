import { describe, it, expect } from 'vitest';
import { calculateMenuPosition, calculateSubmenuPosition } from '../src/components/media/contextMenuPosition';

describe('Media Track Context Menu Viewport Positioning', () => {
  const defaultViewport = { width: 1920, height: 1080 };
  const menuWidth = 256;
  const menuHeight = 360;

  it('positions menu directly at cursor when fully within viewport bounds', () => {
    const result = calculateMenuPosition({
      cursorX: 300,
      cursorY: 400,
      menuWidth,
      menuHeight,
      viewport: defaultViewport,
      padding: 10,
    });

    expect(result.x).toBe(300);
    expect(result.y).toBe(400);
    expect(result.flippedHorizontal).toBe(false);
    expect(result.flippedVertical).toBe(false);
  });

  it('flips horizontally when cursor is near the right edge of viewport', () => {
    const result = calculateMenuPosition({
      cursorX: 1800,
      cursorY: 200,
      menuWidth,
      menuHeight,
      viewport: defaultViewport,
      padding: 10,
    });

    expect(result.flippedHorizontal).toBe(true);
    expect(result.x).toBe(1800 - menuWidth);
    expect(result.x + menuWidth).toBeLessThanOrEqual(defaultViewport.width - 10);
  });

  it('flips vertically when cursor is near the bottom edge of viewport', () => {
    const result = calculateMenuPosition({
      cursorX: 500,
      cursorY: 950,
      menuWidth,
      menuHeight,
      viewport: defaultViewport,
      padding: 10,
    });

    expect(result.flippedVertical).toBe(true);
    expect(result.y).toBe(950 - menuHeight);
    expect(result.y + menuHeight).toBeLessThanOrEqual(defaultViewport.height - 10);
  });

  it('clamps safely within viewport on small mobile screen', () => {
    const mobileViewport = { width: 375, height: 667 };
    const result = calculateMenuPosition({
      cursorX: 350,
      cursorY: 600,
      menuWidth,
      menuHeight,
      viewport: mobileViewport,
      padding: 8,
    });

    expect(result.x).toBeGreaterThanOrEqual(8);
    expect(result.x + menuWidth).toBeLessThanOrEqual(mobileViewport.width);
    expect(result.y).toBeGreaterThanOrEqual(8);
    expect(result.y + menuHeight).toBeLessThanOrEqual(mobileViewport.height);
  });

  it('calculates submenu position correctly and flips left when close to right boundary', () => {
    const parentX = 1700;
    const parentY = 300;
    const parentWidth = 250;
    const submenuWidth = 220;
    const submenuHeight = 200;

    const result = calculateSubmenuPosition({
      parentX,
      parentY,
      parentWidth,
      itemTop: 40,
      submenuWidth,
      submenuHeight,
      viewport: defaultViewport,
      padding: 10,
    });

    expect(result.openLeft).toBe(true);
    expect(result.x).toBeLessThan(parentX);
  });
});
