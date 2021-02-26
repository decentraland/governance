import contracts from 'modules/common/contracts.json'
import { Agent, BanName, Catalyst, COMMUNITY, POI } from 'modules/app/types'
import { isApp } from 'modules/app/utils'
import { Annotation, ProposalDescription, StepDescribed } from './types'

export function getProposalInitialAddress(description?: ProposalDescription) {
  if (!description?.firstDescribedSteps?.length) {
    return undefined
  }

  return description.firstDescribedSteps[0].to
}

export function createDescription(describedSteps: StepDescribed[] = []): ProposalDescription {
  if (describedSteps.length === 0) {
    return {}
  }

  let firstDescribedSteps = describedSteps
  while (firstDescribedSteps.length && firstDescribedSteps[0].children) {
    firstDescribedSteps = firstDescribedSteps[0].children as any
  }

  let firstDescriptionAnnotated: Annotation[][] = []
  for (const step of firstDescribedSteps) {
    if (step.annotatedDescription) {
      const newAnnotatedDescription: Annotation[] = aggregateAnnotation(step)
      firstDescriptionAnnotated.push(newAnnotatedDescription)
    }
  }

  const description = firstDescribedSteps
    .map((step) => step.description)
    .filter(Boolean)
    .join("\n")

  return { description, describedSteps, firstDescribedSteps, firstDescriptionAnnotated }
}

export function aggregateAnnotation(step: StepDescribed): Annotation[] {
  const annotations = step.annotatedDescription || []

  // Special replacement:
  switch (true) {
    case (
      isApp(step.to, Agent) &&
      annotations.length === 2 &&
      annotations[0].value === `Execute 'Release' on` &&
      annotations[1].value === contracts.mainnet["DAO vesting"]
    ):
      return [
        { type: 'text', value: 'Release funds from the' },
        { type: 'address', value: contracts.mainnet["DAO vesting"] }
      ]

    default:
      // ignore
  }

  // Regular replacement:
  return annotations
    .flatMap((annotation, i) => {
      switch (true) {
        case isApp(step.to, POI) && i === 0: {
          const [first, position, last] = annotation.value.split('"', 3)
          const [x, y] = position.split(',').map(Number)
          return [
            { type: 'text', value: first },
            { type: 'dcl:position', value: { position, x, y } },
            { type: 'text', value: last.slice(0, last.indexOf('.')) }
          ]
        }
        case isApp(step.to, BanName) && i === 0: {
          const [first, name, last] = annotation.value.split('"', 3)
          return [
            { type: 'text', value: first },
            { type: 'dcl:name', value: name },
            { type: 'text', value: last }
          ]
        }
        case isApp(step.to, Catalyst) && annotation.value.startsWith('and domain '): {
          return [
            { type: 'text', value: 'and domain ' },
            { type: 'dcl:domain', value: annotation.value.slice('and domain '.length) }
          ]
        }
        case isApp(step.to, COMMUNITY) && annotation.value.startsWith('Create a new vote about "') && annotation.value.endsWith('"'): {
          return [
            { type: 'dcl:question', value: annotation.value.slice('Create a new vote about "'.length, - '"'.length) }
          ]
        }
        default:
          return annotation
      }
    }) as any
}
