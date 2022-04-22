import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Governance } from '../api/Governance'
import { ProposalAttributes, ProposalStatus } from '../entities/Proposal/types'

export default function useProposalVotingPower(account: string | null, proposal: ProposalAttributes | null) {
  const [votingPower, votingPowerState] = useAsyncMemo(
    () =>
      account && proposal!.status === ProposalStatus.Active
        ? Governance.get().getVotingPower(proposal!.id)
        : Promise.resolve(0),
    [account, proposal],
    { callWithTruthyDeps: true }
  )

  return {
    votingPower,
    isLoadingVotingPower: votingPowerState.loading
  }
}