'use client';

import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'medium',
  className = '' 
}: ResponsiveGridProps) {
  const gapClasses = {
    small: 'gap-2 sm:gap-3',
    medium: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8'
  };

  const getColumnClasses = () => {
    const classes = ['grid'];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getColumnClasses()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'small' | 'medium' | 'large';
  responsive?: {
    direction?: {
      sm?: 'row' | 'col';
      md?: 'row' | 'col';
      lg?: 'row' | 'col';
    };
    justify?: {
      sm?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
      md?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
      lg?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    };
  };
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'medium',
  responsive,
  className = ''
}: ResponsiveFlexProps) {
  const gapClasses = {
    small: 'gap-2 sm:gap-3',
    medium: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8'
  };

  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const getResponsiveClasses = () => {
    const classes = [];
    
    if (responsive?.direction?.sm) classes.push(`sm:${directionClasses[responsive.direction.sm]}`);
    if (responsive?.direction?.md) classes.push(`md:${directionClasses[responsive.direction.md]}`);
    if (responsive?.direction?.lg) classes.push(`lg:${directionClasses[responsive.direction.lg]}`);
    
    if (responsive?.justify?.sm) classes.push(`sm:${justifyClasses[responsive.justify.sm]}`);
    if (responsive?.justify?.md) classes.push(`md:${justifyClasses[responsive.justify.md]}`);
    if (responsive?.justify?.lg) classes.push(`lg:${justifyClasses[responsive.justify.lg]}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`
      flex 
      ${directionClasses[direction]} 
      ${wrap ? 'flex-wrap' : ''} 
      ${justifyClasses[justify]} 
      ${alignClasses[align]} 
      ${gapClasses[gap]}
      ${getResponsiveClasses()}
      ${className}
    `}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  size = 'xl',
  padding = true,
  className = '' 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`w-full ${sizeClasses[size]} mx-auto ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: 'small' | 'medium' | 'large';
  divider?: boolean;
  className?: string;
}

export function ResponsiveStack({ 
  children, 
  spacing = 'medium',
  divider = false,
  className = '' 
}: ResponsiveStackProps) {
  const spacingClasses = {
    small: 'space-y-2 sm:space-y-3',
    medium: 'space-y-4 sm:space-y-6',
    large: 'space-y-6 sm:space-y-8'
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {divider 
        ? childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && (
                <hr className="border-gray-200" />
              )}
            </React.Fragment>
          ))
        : children
      }
    </div>
  );
}