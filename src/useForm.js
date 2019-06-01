import { useReducer } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import reducerFactory from './reducerFactory'
import defaultInitialState from './initialState'
import actionTypes from './actionTypes'
import defaultValidators from './validators'
import { toucheAllValues, validateAllLevel } from './helpers'

let reducer

function useForm({
  initialValues = {},
  submitHandler,
  customInitialState = {},
  customReducers,
  isMounted,
  validators,
  validate,
  errorClassName,
  validationPolicy = 'onBlur-and-onChange',
  errorDisplayPolicy = 'touched-and-submitted',
}) {
  if (!reducer) {
    reducer = reducerFactory(customReducers)
  }

  let enabledValidators = {
    ...defaultValidators
  }
  if (validators) {
    enabledValidators = {
      ...defaultValidators,
      ...validators,
    }
  }
  
  const initialState = {
    ...defaultInitialState,
    ...customInitialState,
    initialValues: initialValues || {},
    values: initialValues || {},
    validators: enabledValidators,
  }

  const [formState, dispatch] = useReducer(reducer, initialState)

  const setFormState = newState => {
    dispatch({
      type: actionTypes.SET_FORM_STATE,
      payload: newState,
    })
  }

  const setErrors = errors => {
    dispatch({
      type: actionTypes.SET_ERRORS,
      payload: errors,
    })
  }

  const setError = error => {
    dispatch({
      type: actionTypes.SET_ERROR,
      payload: error,
    })
  }
  
  const change = async (name, value) => {
    const newValues = cloneDeep(formState.values)
    set(newValues, name, value)
    
    const newState = {
      values: newValues,
    }

    if (formState.fields[name]) {
      if (!formState.fields[name].validationDisabled
        && ['onChange', 'onBlur-and-onChange'].includes(formState.fields[name].validationPolicy)) {
        const errors = validateAllLevel(formState.fields, newValues, validate, setError)
        const valid = Object.keys(errors).length === 0
        newState.errors = errors
        newState.valid = valid
      }
    }

    setFormState(newState)
  }

  const setValues = values => {
    const newValues = cloneDeep(formState.values)
    
    let shouldValidationRun = false

    Object
      .keys(values)
      .forEach(name => {
        set(newValues, name, values[name])

        if (formState.fields[name]) {
          if (!shouldValidationRun) {
            if (!formState.fields[name].validationDisabled
              && ['onChange', 'onBlur-and-onChange'].includes(formState.fields[name].validationPolicy)) {
              shouldValidationRun = true
            }
          }
        }
      })
  
    const newState = {
      values: newValues,
    }
  
    if (shouldValidationRun) {
      const errors = validateAllLevel(formState.fields, newValues, validate, setError)
      const valid = Object.keys(errors).length === 0
      newState.errors = errors
      newState.valid = valid
    }

    setFormState(newState)
  }

  const onChange = e => {
    change(
      e.target.name, 
      e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value
    )
  }

  const touch = name => {
    dispatch({
      type: actionTypes.SET_TOUCHED,
      payload: name
    })
  }

  const onBlur = async e => {
    touch(e.target.name)
    if (!formState.fields[e.target.name].validationDisabled &&
      ['onBlur', 'onBlur-and-onChange'].includes(formState.fields[e.target.name].validationPolicy)) {
      const errors = validateAllLevel(formState.fields, formState.values, validate)
      setFormState({ errors })
    }
  }

  const focus = name => {
    dispatch({
      type: actionTypes.SET_FOCUSED,
      payload: name
    })
  }

  const onFocus = e => {
    focus(e.target.name) 
  }

  const setSubmitting = submitting => {
    dispatch({
      type: actionTypes.SET_SUBMITTING,
      payload: submitting,
    })
  }

  const setValid = isValid => {
    dispatch({
      type: actionTypes.SET_VALID,
      payload: isValid,
    })
  }

  const setSubmitted = submitted => {
    dispatch({
      type: actionTypes.SET_SUBMITTED,
      payload: submitted,
    })
  }

  const registerField = (name, options) => {
    if (options.initialValue === undefined) {
      options.initialValue = initialValues[name]
    }
    dispatch({
      type: actionTypes.REGISTER_FIELD,
      payload: { name, options },
    })
  }

  const unregisterField = name => {
    dispatch({
      type: actionTypes.UNREGISTER_FIELD,
      payload: name,
    })
  }

  const setValidating = validating => {
    dispatch({
      type: actionTypes.SET_VALIDATING,
      payload: true
    })
  }

  const setAllTouched = () => {
    dispatch({
      type: actionTypes.SET_ALL_TOUCHED,
      payload: toucheAllValues(formState.fields)
    })
  }

  const onSubmit = async e => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const touched = toucheAllValues(formState.fields)

    setFormState({
      submitting: true,
      submitted: true,
      validating: true,
      touched,
    })

    const errors = validateAllLevel(formState.fields, formState.values, validate, setError)

    const valid = Object.keys(errors).length === 0
    
    setValidating(false)

    if (!valid) {
      setFormState({
        submitting: false,
        errors,
        valid: false,
      })
      return
    }

    await submitHandler(formState.values, { setSubmitting, setValues })

    if (isMounted) {
      setSubmitting(false)
    }
  }

  return {
    ...formState,
    dispatch,
    change,
    setValues,
    onChange,
    touch,
    onBlur,
    focus,
    onFocus,
    setValid,
    setSubmitting,
    setSubmitted,
    registerField,
    unregisterField,
    setErrors,
    setError,
    onSubmit,
    validationPolicy,
    errorDisplayPolicy,
    errorClassName,
  }
}

export default useForm
