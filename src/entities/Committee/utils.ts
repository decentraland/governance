import { Committee, CommitteeName, DclData } from '../../clients/DclData'

export async function getCommitteesWithOpenSlots(): Promise<Committee[]> {
  // const { teams: committees } = await DclData.get().getData()
  // return committees.filter((committee) => committee.size > committee.members.length)

  // TODO: Remove this mock
  return [
    {
      name: CommitteeName.DAOCommitee,
      description:
        "Their principal responsibility is to enact binding proposals on-chain like listing Point of Interests, sending Grants, and any other operations involving the DAO's smart contracts.",
      size: 4,
      members: [
        {
          address: '0xbfa6d24e6a061e9aea3447163fdfe045177dd40e',
          name: 'Yemel',
          avatar: 'https://peer.decentraland.org/content/contents/QmUvDC3wSSTg7Hnej2A6sp3KZPqSULtvkJfvMBJBrLSb8p',
        },
        {
          address: '0xbef99f5f55cf7cdb3a70998c57061b7e1386a9b0',
          name: 'Kyllian',
          avatar: 'https://decentraland.org/images/male.png',
        },
        {
          address: '0x88013D7eD946dD8292268a6FF69165a97A89a639',
          name: 'Tobik',
          avatar:
            'https://peer.decentraland.org/content/contents/bafkreif25t6mav5bgkajwr6l6wptzh5lkmonuw7pzricrin6fyhoazfruu',
        },
      ],
    },
  ]
}

export async function hasOpenSlots(name: CommitteeName): Promise<boolean> {
  const committees = await getCommitteesWithOpenSlots()
  return !!committees.find((committee) => committee.name === name)
}
