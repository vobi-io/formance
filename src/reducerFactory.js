import set from 'lodash/set'
import cloneDeep from 'lodash/clonedeep'
import { validateAllLevel } from './helpers'
import {
  SET_FORM_STATE,
  SET_VALUE,
  SET_VALUES,
  SET_ERROR,
  SET_ERRORS,
  UNSET_ERRORS,
  SET_TOUCHED,
  SET_ALL_TOUCHED,
  SET_FOCUSED,
  SET_SUBMITTED,
  SET_SUBMITTING,
  SET_VALIDATING,
  SET_VALID,
  REGISTER_FIELD,
  UNREGISTER_FIELD,
} from './actionTypes'

function reducerFactory(customReducers) {
  return function reducer(state, action) {
    if (customReducers) {
      const reduce = customReducers[action.type]
      if (reduce) {
        return reduce(state, action) 
      }
    }
    
    switch (action.type) {
    case SET_FORM_STATE:
      return {
        ...state,
        ...action.payload,
      }

    case REGISTER_FIELD: {
      const newState = {}
      if (typeof action.payload.options.initialValue !== 'undefined') {
        const newValues = cloneDeep(state.values)
        set(newValues, action.payload.name, action.payload.options.initialValue)
        newState.values = newValues
      }
      if (typeof action.payload.options.validations !== 'undefined') {
        newState.validations = {
          ...state.validations,
          [action.payload.name]: action.payload.options.validations
        }
      }
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.name]: action.payload.options,
        },
        ...newState
      }
    }

    case UNREGISTER_FIELD: {
      const { [action.payload]: f, ...fieldsWithout } = state.fields
      return {
        ...state,
        fields: {
          ...fieldsWithout,
        }
      }
    }

    case SET_VALUE: {
      const newValues = cloneDeep(state.values)
      set(newValues, action.payload.name, action.payload.value)
      
      const newState = {
        ...state,
        values: newValues,
      }

      if (!state.fields[action.payload.name].validationDisabled
        && ['onChange', 'onBlur-and-onChange'].includes(state.fields[action.payload.name].validationPolicy)) {
        const errors = validateAllLevel(state.fields, newValues, action.payload.validate)
        newState.errors = errors
        newState.valid = Object.keys(errors).length === 0
      }
      
      // const { errors, valid } = validate(
      //   newValues,
      //   state.errors,
      //   state.validations,
      //   state.validators,
      // )
      
      // if (state.fields[action.payload.name]
      //   && typeof state.fields[action.payload.name].validate === 'function') {
      //     const fieldError = state.fields[action.payload.name].validate(action.payload.value)
      //     if (fieldError) {
      //       if(!errors[action.payload.name]) {
      //         errors[action.payload.name] = []
      //       }
      //       errors[action.payload.name].push(fieldError)
      //     }
      // }

      return newState
    }

    case SET_ERROR:
      return {
        ...state,
        valid: false,
        errors: {
          ...state.errors,
          ...action.payload,
        },
      }

    case SET_ERRORS:
      return {
        ...state,
        valid: false,
        errors: {
          ...state.errors,
          ...action.payload,
        },
      }
    
    case UNSET_ERRORS:
      return {
        ...state,
        errors: action.payload.reduce((errs, name) => {
          const { [name]: v, ...stateWithout } = errs
          return stateWithout
        }, state.errors),
      }

    case SET_VALID:
      return {
        ...state,
        valid: action.payload,
      }

    case SET_VALUES: {
      const newValues = cloneDeep(state.values)
      action.payload.forEach(field => {
        set(newValues, field.name, field.value)
      })
      return {
        ...state,
        values: newValues,
      }
    }

    case SET_TOUCHED:
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload]: true,
        },
        focused: null
      }

    case SET_ALL_TOUCHED:
      return {
        ...state,
        touched: {
          ...action.payload,
        },
        focused: null
      }

    case SET_FOCUSED:
      return {
        ...state,
        focused: action.payload,
        visited: {
          ...state.visited,
          [action.payload]: true,
        },
      }
      
    case SET_SUBMITTING:
      return {
        ...state,
        submitting: action.payload,
      }

    case SET_SUBMITTED:
      return {
        ...state,
        submitted: action.payload,
      }

    case SET_VALIDATING:
      return {
        ...state,
        validating: action.payload,
      }

    default:
      return state
    }
  }
}

export default reducerFactory
