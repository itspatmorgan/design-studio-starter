"use client";

// Adapted from Untitled UI's MIT application/tabs component. See ../../LICENSE.
// Marketing keeps horizontal underline tabs; React Aria owns keyboard and selection behavior.
import type { ComponentPropsWithRef } from 'react';
import { Tab as AriaTab, TabList as AriaTabList, TabPanel as AriaTabPanel, Tabs as AriaTabs } from 'react-aria-components';
import { cx } from '../../utils/cx';

export function TabList({ className, ...props }: ComponentPropsWithRef<typeof AriaTabList>) {
  return <AriaTabList {...props} className={(state) => cx('flex flex-wrap gap-6 border-b border-border-secondary', typeof className === 'function' ? className(state) : className)} />;
}
export function Tab({ className, ...props }: ComponentPropsWithRef<typeof AriaTab>) {
  return <AriaTab {...props} className={(state) => cx(
    'cursor-pointer border-b-2 border-transparent px-0.5 pb-3 text-sm font-semibold text-text-tertiary outline-brand transition duration-100 ease-linear',
    (state.isSelected || state.isHovered) && 'border-text-brand-secondary text-text-brand-secondary',
    state.isFocusVisible && 'outline-2 outline-offset-2',
    state.isDisabled && 'cursor-not-allowed opacity-50',
    typeof className === 'function' ? className(state) : className,
  )} />;
}
export function TabPanel({ className, ...props }: ComponentPropsWithRef<typeof AriaTabPanel>) {
  return <AriaTabPanel {...props} className={(state) => cx('outline-brand focus-visible:outline-2 focus-visible:outline-offset-2', typeof className === 'function' ? className(state) : className)} />;
}
export const Tabs = Object.assign(function Tabs({ className, ...props }: ComponentPropsWithRef<typeof AriaTabs>) {
  return <AriaTabs keyboardActivation="manual" {...props} className={(state) => cx('flex w-full flex-col', typeof className === 'function' ? className(state) : className)} />;
}, { List: TabList, Item: Tab, Panel: TabPanel });
