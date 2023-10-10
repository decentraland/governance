import useFormatMessage from '../../hooks/useFormatMessage'
import Helper from '../Helper/Helper'
import Lock from '../Icon/Lock'

const CalculationHelper = () => {
  const t = useFormatMessage()

  return <Helper icon={<Lock />} text={t('page.submit_grant.funding_section.calculation_helper')} />
}

export default CalculationHelper
