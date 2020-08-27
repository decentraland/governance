import { Organization } from './types'
import { STORAGE_LOAD, LoadAction } from 'decentraland-dapps/dist/modules/storage/actions'
import {
  LOAD_ORGANIZATION_FAILURE,
  LOAD_ORGANIZATION_REQUEST,
  LOAD_ORGANIZATION_SUCCESS,
  LoadOrganizationFailureAction,
  LoadOrganizationRequestAction,
  LoadOrganizationSuccessAction
} from './actions'

export type OrganizationState = {
  data: Organization | null
  loading: boolean
  error: string | null
}

const INITIAL_STATE: OrganizationState = {
  data: null,
  loading: false,
  error: null
}

export type OrganizationReducerAction =
  | LoadOrganizationFailureAction
  | LoadOrganizationRequestAction
  | LoadOrganizationSuccessAction
  | LoadAction<any>

export const organizationReducer = (state = INITIAL_STATE, action: OrganizationReducerAction): OrganizationState => {
  switch (action.type) {
    case STORAGE_LOAD:
    case LOAD_ORGANIZATION_REQUEST: {
      return {
        ...state,
        loading: true
      }
    }
    case LOAD_ORGANIZATION_FAILURE: {
      return {
        data: null,
        loading: false,
        error: action.payload.error
      }
    }
    case LOAD_ORGANIZATION_SUCCESS: {
      return {
        data: action.payload.organization,
        loading: false,
        error: null
      }
    }
    default:
      return state
  }
}
