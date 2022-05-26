import { Delegation, filterDelegationFrom, filterDelegationTo } from '../api/Snapshot'

const DCL_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || 'dcl_space'
const DELEGATE_ADDR = '0x6cd7694d30c10bdab1e644fc1964043a95ceea5f'
const DELEGATORS_ADDRS = [
  '0x549a9021661a85b6bc51c07b3a451135848d0050',
  '0x27079b36C611Ebe21fb477ADc91bf75e2555A450',
  '0x35a72b36C611Ebe21fb477ADc91bf75e25578Ae2',
]
const RANDOM_SPACE_DELEGATION = {
  delegator: DELEGATORS_ADDRS[0],
  delegate: DELEGATE_ADDR,
  space: DCL_SPACE,
}

const RANDOM_GLOBAL_DELEGATION = {
  delegator: DELEGATORS_ADDRS[1],
  delegate: DELEGATE_ADDR,
  space: '',
}

const DUPLICATED_SPACE_DELEGATION = {
  delegator: DELEGATORS_ADDRS[2],
  delegate: DELEGATE_ADDR,
  space: DCL_SPACE,
}

const DUPLICATED_GLOBAL_DELEGATION = {
  delegator: DELEGATORS_ADDRS[2],
  delegate: DELEGATE_ADDR,
  space: '',
}

describe('filterDelegationTo', () => {
  let delegations: Delegation[]

  describe('when no delegation was made', () => {
    beforeAll(() => {
      delegations = []
    })

    it('should return an empty array', () => {
      expect(filterDelegationTo(delegations, DCL_SPACE)).toStrictEqual([] as Delegation[])
    })
  })

  describe('when only one delegation was made on dcl space', () => {
    beforeAll(() => {
      delegations = [
        {
          delegator: DELEGATORS_ADDRS[0],
          delegate: DELEGATE_ADDR,
          space: DCL_SPACE,
        },
      ]
    })

    it('should return the dlc space delegation', () => {
      expect(filterDelegationTo(delegations, DCL_SPACE)).toStrictEqual(delegations)
    })
  })

  describe('when only one delegation was made globally', () => {
    beforeAll(() => {
      delegations = [
        {
          delegator: DELEGATORS_ADDRS[0],
          delegate: DELEGATE_ADDR,
          space: '',
        },
      ]
    })

    it('should return the gobal delegation', () => {
      expect(filterDelegationTo(delegations, DCL_SPACE)).toStrictEqual(delegations)
    })
  })

  describe('when a delegation was made globally and another was made on dcl space', () => {
    const global_delegation: Delegation = {
      delegator: DELEGATORS_ADDRS[0],
      delegate: DELEGATE_ADDR,
      space: '',
    }

    const dcl_space_delegation: Delegation = {
      delegator: DELEGATORS_ADDRS[1],
      delegate: DELEGATE_ADDR,
      space: DCL_SPACE,
    }

    beforeAll(() => {
      delegations = [global_delegation, dcl_space_delegation]
    })

    it('dcl space delegation should be returned', () => {
      expect(filterDelegationTo(delegations, DCL_SPACE)).toStrictEqual([dcl_space_delegation])
    })
  })
})

describe('filterDelegationFrom', () => {
  let delegations: Delegation[]

  describe('when no delegation was made', () => {
    beforeAll(() => {
      delegations = []
    })

    it('should return an empty array', () => {
      expect(filterDelegationFrom(delegations, DCL_SPACE)).toStrictEqual([] as Delegation[])
    })
  })

  describe('when a user made a global delegation and a dcl space delegation', () => {
    beforeAll(() => {
      delegations = [
        RANDOM_SPACE_DELEGATION,
        RANDOM_GLOBAL_DELEGATION,
        DUPLICATED_SPACE_DELEGATION,
        DUPLICATED_GLOBAL_DELEGATION,
      ]
    })

    it('should return non duplicates prioritizing the space over the global delegation', () => {
      expect(filterDelegationFrom(delegations, DCL_SPACE)).toStrictEqual([
        RANDOM_SPACE_DELEGATION,
        RANDOM_GLOBAL_DELEGATION,
        DUPLICATED_SPACE_DELEGATION,
      ])
    })
  })

  describe('when an user has several different delegators', () => {
    beforeAll(() => {
      delegations = [
        {
          delegator: '0x252ba78469235c352f58f28f7c98db62dd385146',
          delegate: '0x3fb38cee8d0ba7dcf59403a8c397626dc9c7a13b',
          space: 'snapshot.dcl.eth',
        },
        {
          delegator: '0x53887f0dee06c6459bc928f9f39beccac3947325',
          delegate: '0x3fb38cee8d0ba7dcf59403a8c397626dc9c7a13b',
          space: 'snapshot.dcl.eth',
        },
        {
          delegator: '0x983a902bb91876e4d12787843900274598350828',
          delegate: '0x3fb38cee8d0ba7dcf59403a8c397626dc9c7a13b',
          space: 'snapshot.dcl.eth',
        },
      ]
    })

    it('should return all of them', () => {
      expect(filterDelegationFrom(delegations, DCL_SPACE)).toStrictEqual(delegations)
    })
  })
})
