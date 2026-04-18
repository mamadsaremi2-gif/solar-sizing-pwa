import React from 'react';
import { cn } from './utils';

function marker(name) {
  const Comp = ({ children }) => <>{children}</>;
  Comp.displayName = name;
  return Comp;
}

export const SelectTrigger = marker('SelectTrigger');
export const SelectValue = marker('SelectValue');
export const SelectContent = marker('SelectContent');
export const SelectItem = marker('SelectItem');

function flattenChildren(children) {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    const nested = child.props?.children ? flattenChildren(child.props.children) : [];
    return [child, ...nested];
  });
}

function extractOptions(children) {
  const flat = flattenChildren(children);
  const trigger = flat.find((child) => child.type?.displayName === 'SelectTrigger');
  const valueNode = flat.find((child) => child.type?.displayName === 'SelectValue');
  const items = flat.filter((child) => child.type?.displayName === 'SelectItem');
  return {
    triggerClassName: trigger?.props?.className || '',
    placeholder: valueNode?.props?.placeholder || '',
    items: items.map((item) => ({ value: item.props.value, label: item.props.children })),
  };
}

export function Select({ value, defaultValue, onValueChange, children }) {
  const { triggerClassName, placeholder, items } = extractOptions(children);
  const controlledValue = value ?? defaultValue ?? '';

  return (
    <select
      value={controlledValue}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200',
        triggerClassName,
      )}
    >
      {placeholder && !controlledValue ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {items.map((item) => (
        <option key={String(item.value)} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
