import classNames from 'classnames'

import { CatalystType, HiringType, PoiType, ProposalType, isHiringType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import { navigate } from '../../utils/locations'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'
import AddPoi from '../Icon/ProposalCategories/AddPoi'
import BanName from '../Icon/ProposalCategories/BanName'
import Bid from '../Icon/ProposalCategories/Bid'
import Catalyst from '../Icon/ProposalCategories/Catalyst'
import CatalystAdd from '../Icon/ProposalCategories/CatalystAdd'
import CatalystRemove from '../Icon/ProposalCategories/CatalystRemove'
import Draft from '../Icon/ProposalCategories/Draft'
import Governance from '../Icon/ProposalCategories/Governance'
import Grant from '../Icon/ProposalCategories/Grant'
import Hiring from '../Icon/ProposalCategories/Hiring'
import HiringAdd from '../Icon/ProposalCategories/HiringAdd'
import HiringRemove from '../Icon/ProposalCategories/HiringRemove'
import LinkedWearables from '../Icon/ProposalCategories/LinkedWearables'
import Pitch from '../Icon/ProposalCategories/Pitch'
import Poi from '../Icon/ProposalCategories/Poi'
import Poll from '../Icon/ProposalCategories/Poll'
import RemovePoi from '../Icon/ProposalCategories/RemovePoi'
import Tender from '../Icon/ProposalCategories/Tender'

import './CategoryBanner.css'

const Box = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />

export const categoryIcons = {
  [ProposalType.Catalyst]: Catalyst,
  [ProposalType.POI]: Poi,
  [PoiType.AddPOI]: AddPoi,
  [PoiType.RemovePOI]: RemovePoi,
  [ProposalType.BanName]: BanName,
  [ProposalType.Grant]: Grant,
  [ProposalType.Poll]: Poll,
  [ProposalType.Draft]: Draft,
  [ProposalType.Governance]: Governance,
  [ProposalType.LinkedWearables]: LinkedWearables,
  [ProposalType.Pitch]: Pitch,
  [ProposalType.Tender]: Tender,
  [ProposalType.Bid]: Bid,
  [ProposalType.Hiring]: Hiring,
  [HiringType.Add]: HiringAdd,
  [HiringType.Remove]: HiringRemove,
  [CatalystType.Add]: CatalystAdd,
  [CatalystType.Remove]: CatalystRemove,
}

type Props = Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  active?: boolean
  isNew?: boolean
  type: ProposalType | PoiType | HiringType | CatalystType
  onClick?: () => void
}

export default function CategoryBanner({ active = true, isNew, type, onClick, href }: Props) {
  const t = useFormatMessage()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement>) {
    if (!e.defaultPrevented) {
      e.preventDefault()
    }

    if (!active) {
      return
    }

    if (onClick) {
      onClick()
    }

    if (href) {
      navigate(href)
    }
  }

  const isLink = active && href
  const Component = isLink ? Link : Box
  const Icon = categoryIcons[type]

  return (
    <Component
      href={href}
      onClick={handleClick}
      className={classNames(
        'CategoryBanner',
        `CategoryBanner--${type}`,
        active && 'CategoryBanner--active',
        !isLink && !!onClick && 'CategoryBanner--clickable'
      )}
    >
      <div className={classNames('CategoryBanner__Icon', !active && 'CategoryBanner__Icon--inactive')}>
        <Icon />
      </div>
      <div>
        <div className="CategoryBanner__TitleContainer">
          <Text className="CategoryBanner__Title" size="lg" weight="medium">
            {t(`category.${type}_title`)}
          </Text>
          {isNew && <span className="CategoryBanner__Badge NewBadge">{t(`category.new`)}</span>}
          {!active && (
            <span className="CategoryBanner__Badge CategoryBanner__PausedBadge">
              {t(`category.${isHiringType(type) ? 'not_available' : 'paused'}`)}
            </span>
          )}
        </div>
        <Text weight="normal">{t(`category.${type}_description`)}</Text>
        {!active && (
          <Markdown componentsClassNames={{ p: 'CategoryBanner__PausedText' }}>{t(`category.${type}_paused`)}</Markdown>
        )}
      </div>
    </Component>
  )
}
