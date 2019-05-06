import get from 'lodash/get'

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

export const validateFields = (fields, values, setError) => {
  const errors = {}

  const promises = []

  Object
    .keys(fields)
    .map(async fieldName => {
      if (fields[fieldName].validate && typeof fields[fieldName].validate === 'function') {
        const value = get(values, fieldName)
        const fieldError = fields[fieldName].validate(value, values)
        if (isPromise(fieldError)) {
          promises.push(
            fieldError
              .then(err => {
                setError({
                  [fieldName]: err
                })
              })
          )
        } else {
          if (fieldError) {
            errors[fieldName] = fieldError
          }
        }
      }
    })
  
  Promise
    .all(promises)
    .then(errs => {
      
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