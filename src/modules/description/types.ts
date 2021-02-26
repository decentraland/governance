import ForwardingPathDescription from '@aragon/connect-core/dist/cjs/utils/descriptor'

export { ForwardingPathDescription }

export type StepDescribed = ForwardingPathDescription['describedSteps'][0]

export type ProposalDescription = {
  description?: string
  describedSteps?: StepDescribed[]
  firstDescribedSteps?: StepDescribed[]
  firstDescriptionAnnotated?: Annotation[][]
}

export type Annotation =
  | DclQuestionAnnotation
  | TextAnnotation
  | Byte32Annotation
  | AddressAnnotation
  | AppAnnotation
  | RoleAnnotation
  | ApmPackageAnnotation
  | KernelAnnotation
  | DclDomainAnnotation
  | DclNameAnnotation
  | DclPositionAnnotation

export type DclPositionAnnotation = {
  type: 'dcl:position',
  value: {
    x: number,
    y: number,
    position: string
  }
}

export type DclQuestionAnnotation = {
  type: 'dcl:question',
  value: string
}

export type DclNameAnnotation = {
  type: 'dcl:name',
  value: string
}

export type DclBigNumberAnnotation = {
  type: 'dcl-uint256',
  value: string
}

export type DclDomainAnnotation = {
  type: 'dcl:domain',
  value: string
}

export type TextAnnotation = {
  type: 'text',
  value: string
}

export type Byte32Annotation = {
  type: 'bytes32',
  value: string
}

export type AddressAnnotation = {
  type: 'address',
  value: string
}

export type AppAnnotation = {
  type: 'app',
  value: {
    address: string,
    appId: string,
    codeAddress: string,
    contentUri: string,
    isForwarder: boolean,
    isUpgradeable: boolean,
    kernelAddress: string,
    name: string,
    registryAddress: string,
    repoAddress: string,
    version: string
  }
}

export type RoleAnnotation = {
  type: "role",
  value: {
    name: string,
    id: string,
    params: any[],
    bytes: string
  }
}

export type ApmPackageAnnotation = {
  type: "apmPackage",
  value: {
    address: string
    appId: string
    codeAddress: string
    contentUri: string
    isForwarder: boolean,
    isUpgradeable: boolean,
    kernelAddress: string
    name: string
    registryAddress: string
    repoAddress: string
    version: string
  }
}

export type KernelAnnotation = {
  type: "kernelNamespace",
  value: {
    name: string
    hash: string
  }
}
