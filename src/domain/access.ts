export type ViewerStatus = 'guest' | 'customer' | 'restricted';

/**
 * Decides what a logged-in customer may do from their *current* PrestaShop group.
 * Fails closed: any group not explicitly allowed to order is treated as restricted.
 */
export function accessForGroup(groupId: number | null | undefined, orderingGroupIds: readonly number[]): Exclude<ViewerStatus, 'guest'> {
  return groupId != null && orderingGroupIds.includes(groupId) ? 'customer' : 'restricted';
}

/** Every logged-in customer sees prices (merchant rule); only guests do not. */
export const canSeePrices = (s: ViewerStatus) => s !== 'guest';
export const canOrder = (s: ViewerStatus) => s === 'customer';
