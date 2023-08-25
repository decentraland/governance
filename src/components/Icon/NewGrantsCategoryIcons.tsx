import { NewGrantCategory } from '../../entities/Grant/types'

import Accelerator from './Grants/Accelerator'
import CoreUnit from './Grants/CoreUnit'
import Documentation from './Grants/Documentation'
import InWorldContent from './Grants/InWorldContent'
import Platform from './Grants/Platform'
import SocialMediaContent from './Grants/SocialMediaContent'
import Sponsorship from './Grants/Sponsorship'

export function getNewGrantsCategoryIcon(category: NewGrantCategory) {
  switch (category) {
    case NewGrantCategory.Accelerator:
      return Accelerator
    case NewGrantCategory.CoreUnit:
      return CoreUnit
    case NewGrantCategory.Documentation:
      return Documentation
    case NewGrantCategory.InWorldContent:
      return InWorldContent
    case NewGrantCategory.Platform:
      return Platform
    case NewGrantCategory.SocialMediaContent:
      return SocialMediaContent
    case NewGrantCategory.Sponsorship:
    default:
      return Sponsorship
  }
}
