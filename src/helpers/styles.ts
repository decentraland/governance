export enum CategoryIconVariant {
  Normal = 'normal',
  Hover = 'hover',
  Filled = 'filled',
  Circled = 'circled',
}

export interface CategoryIconProps {
  variant: CategoryIconVariant
  size?: number
}

type CategoryIconColor = 'green' | 'red' | 'blue' | 'fuchsia' | 'orange' | 'yellow' | 'purple'

export const getCategoryIconSecondaryColor = (color: CategoryIconColor, variant: CategoryIconVariant) => {
  switch (variant) {
    case CategoryIconVariant.Normal:
      return 'var(--black-400)'
    case CategoryIconVariant.Hover:
      return `var(--${color}-200)`
    case CategoryIconVariant.Filled:
      return `var(--${color}-800)`
  }
}

export const getCategoryIconPrimaryColor = (color: CategoryIconColor, variant: CategoryIconVariant) => {
  switch (variant) {
    case CategoryIconVariant.Normal:
      return 'var(--black-700)'
    case CategoryIconVariant.Hover:
    case CategoryIconVariant.Filled:
      return `var(--${color}-800)`
  }
}
