/**
 * LARK·MEDIA Context Menu Viewport & Collision Calculation Engine
 * Guarantees context menu and submenus remain completely visible within the viewport
 * across 1080p, 1440p, 720p, mobile/tablet, zoom levels, and resized windows.
 */

export interface ViewportRect {
  width: number;
  height: number;
}

export interface PositionInput {
  cursorX: number;
  cursorY: number;
  menuWidth: number;
  menuHeight: number;
  viewport: ViewportRect;
  padding?: number;
}

export interface MenuPositionResult {
  x: number;
  y: number;
  flippedHorizontal: boolean;
  flippedVertical: boolean;
  maxHeight: number;
}

export interface SubmenuPositionInput {
  parentX: number;
  parentY: number;
  parentWidth: number;
  itemTop: number;
  submenuWidth: number;
  submenuHeight: number;
  viewport: ViewportRect;
  padding?: number;
}

export interface SubmenuPositionResult {
  x: number;
  y: number;
  openLeft: boolean;
  maxHeight: number;
}

/**
 * Calculates clamped & collision-free viewport coordinates for the context menu.
 */
export function calculateMenuPosition({
  cursorX,
  cursorY,
  menuWidth,
  menuHeight,
  viewport,
  padding = 8,
}: PositionInput): MenuPositionResult {
  const { width: vw, height: vh } = viewport;
  const safePadding = Math.max(4, padding);

  let x = cursorX;
  let y = cursorY;
  let flippedHorizontal = false;
  let flippedVertical = false;

  // Horizontal Collision Detection
  if (cursorX + menuWidth + safePadding > vw) {
    // Flip leftward
    x = cursorX - menuWidth;
    flippedHorizontal = true;
    // If flipping left also causes left overflow, clamp strictly within viewport
    if (x < safePadding) {
      x = Math.max(safePadding, vw - menuWidth - safePadding);
    }
  } else {
    x = Math.max(safePadding, cursorX);
  }

  // Vertical Collision Detection
  if (cursorY + menuHeight + safePadding > vh) {
    // Flip upward
    y = cursorY - menuHeight;
    flippedVertical = true;
    // If flipping upward also causes top overflow, clamp strictly within viewport
    if (y < safePadding) {
      y = Math.max(safePadding, vh - menuHeight - safePadding);
    }
  } else {
    y = Math.max(safePadding, cursorY);
  }

  // Final viewport boundary clamping
  const clampedX = Math.max(safePadding, Math.min(vw - menuWidth - safePadding, x));
  const clampedY = Math.max(safePadding, Math.min(vh - menuHeight - safePadding, y));

  // Safe maximum inner height constraint
  const maxHeight = Math.max(160, vh - (safePadding * 2));

  return {
    x: Math.round(clampedX),
    y: Math.round(clampedY),
    flippedHorizontal,
    flippedVertical,
    maxHeight,
  };
}

/**
 * Calculates collision-free viewport coordinates for nested submenus.
 */
export function calculateSubmenuPosition({
  parentX,
  parentY,
  parentWidth,
  itemTop,
  submenuWidth,
  submenuHeight,
  viewport,
  padding = 8,
}: SubmenuPositionInput): SubmenuPositionResult {
  const { width: vw, height: vh } = viewport;
  const safePadding = Math.max(4, padding);

  let openLeft = false;
  let x = parentX + parentWidth - 4;

  // If opening right would overflow viewport, open to the left
  if (x + submenuWidth + safePadding > vw) {
    x = parentX - submenuWidth + 4;
    openLeft = true;
    if (x < safePadding) {
      x = Math.max(safePadding, vw - submenuWidth - safePadding);
    }
  }

  // Vertical alignment with trigger item, with viewport clamping
  const targetY = parentY + itemTop;
  let y = targetY;

  if (targetY + submenuHeight + safePadding > vh) {
    y = Math.max(safePadding, vh - submenuHeight - safePadding);
  } else {
    y = Math.max(safePadding, targetY);
  }

  const maxHeight = Math.max(140, vh - (safePadding * 2));

  return {
    x: Math.round(x),
    y: Math.round(y),
    openLeft,
    maxHeight,
  };
}

export interface TriggerSubmenuPositionInput {
  triggerRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    height?: number;
  };
  submenuWidth: number;
  submenuHeight: number;
  viewport: ViewportRect;
  padding?: number;
}

/**
 * Calculates exact viewport-anchored submenu coordinates directly from the trigger element's bounding box.
 */
export function calculateSubmenuPositionFromTrigger({
  triggerRect,
  submenuWidth,
  submenuHeight,
  viewport,
  padding = 8,
}: TriggerSubmenuPositionInput): SubmenuPositionResult {
  const { width: vw, height: vh } = viewport;
  const safePadding = Math.max(4, padding);

  let openLeft = false;
  // Default to opening to the right of the trigger button with a 4px bridge
  let x = triggerRect.right + 4;

  // If opening to the right causes viewport overflow, flip to the left side
  if (x + submenuWidth + safePadding > vw) {
    x = triggerRect.left - submenuWidth - 4;
    openLeft = true;
    // If opening left also overflows the left screen edge, clamp strictly within viewport
    if (x < safePadding) {
      x = Math.max(safePadding, vw - submenuWidth - safePadding);
    }
  }

  // Align top with the trigger button
  let y = triggerRect.top - 4;

  // If bottom overflows viewport, shift upward
  if (y + submenuHeight + safePadding > vh) {
    y = Math.max(safePadding, vh - submenuHeight - safePadding);
  }
  // If shifted too high, clamp to top padding
  if (y < safePadding) {
    y = safePadding;
  }

  const maxHeight = Math.max(160, vh - (safePadding * 2));

  return {
    x: Math.round(x),
    y: Math.round(y),
    openLeft,
    maxHeight,
  };
}
