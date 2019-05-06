import get from 'lodash/get'
import validators from './validators'

const isPromise = v =>
  v !== null 
  && typeof v === 'object' 
  && typeof v.then === 'function'

export const toucheAllValues = fields => {
  const result = {}

  Object
    .keys(fields)
    .forEach(k => {
      result[k] = true
    })

  return result
}

export const singleValidation = (validate, value, values) => {
  if (typeof validate === 'function') {
    return validate(value, values)
  }

  if (typeof validate === 'string') {
    if (validators[validate]) {
      return validators[validate](value, values)
    }
  }

  if (typeof validate === 'object') {
    if (typeof validate.validate === 'function') {
      return validate.validate(value, values)
    }
  }

  return undefined
}

export const validateSingleField = (validate, value, values) => {
  if (Array.isArray(validate)) {
    for (let i = 0; i < validate.length; i++) {
      const err = singleValidation(validate[i], value, values)
      if (err !== undefined) {
        return err
      }
    }
  } else {
    return singleValidation(validate, value, values)
  }

  return undefined
}

export const validateFields = (fields, values, setError) => {
  const errors = {}

  Object
    .keys(fields)
    .map(async fieldName => {
      if (fields[fieldName].validate) {
        const value = get(values, fieldName)
        const fieldError = validateSingleField(fields[fieldName].validate, value, values)
        if (typeof fieldError !== 'undefined') {
          errors[fieldName] = fieldError
        }
      }
    })

  return errors
}

export const validateAllLevel = (fields, values, validateForm, setError) => {
  let errors = {}

  if (validateForm) {
    const formErrors = validateForm(values)
    errors = {
      ...formErrors
    }
  }
  
  const fieldErrors = validateFields(fields, values, setError)
  
  errors = {
    ...errors,
    ...fieldErrors,
  }
  
  return errors
}