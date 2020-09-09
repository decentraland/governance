import ForwardingPathDescription from '@aragon/connect-core/dist/cjs/utils/descriptor'

export type Annotation = {
  type: string
  value: any
}

export { ForwardingPathDescription }

export type VoteDescription = {
  description?: string
  describedSteps?: ForwardingPathDescription['describedSteps']
  firstDescribedSteps?: ForwardingPathDescription['describedSteps']
  firstDescriptionAnnotated?: Annotation[]
}
