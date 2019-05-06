import React, { useContext, useEffect, useRef } from 'react'
import get from 'lodash/get'
import FormContext from './context'
import FieldError from './FieldError'

const guessInitialValue = (component, type) => {
  switch (component) {
    case 'select':
    case 'textarea':
      return ''
    case 'input':
      switch (type) {
        case 'radio':
        case 'checkbox':
          return false
        default:
          return ''
      }
    default:
      return undefined
  }
}

const Field = ({
  name,
  type,
  value,
  label,
  labelComponent,
  displayError,
  initialValue,
  isRequired,
  validate,
  validationDisabled,
  validationPolicy,
  errorDisplayPolicy,
  component = 'input',
  render,
  children,
  ...props,
}) => {
  const form = useContext(FormContext)

  const firstTime = useRef(false)
  if (!firstTime.current) {
    const options = {}
    
    options.validationPolicy = validationPolicy
      ? validationPolicy
      : form.validationPolicy
    
    options.errorDisplayPolicy = errorDisplayPolicy
      ? errorDisplayPolicy
      : form.errorDisplayPolicy
    
    if (initialValue !== undefined) {
      options.initialValue = initialValue
    }
    if (isRequired) {
      options.validations = []
      options.validations.push('isRequired')
    }
    if (validate) {
      options.validate = validate
    }
    if (validationDisabled) {
      options.validationDisabled = validationDisabled
    }
    
    form.registerField(name, options)

    firstTime.current = true
  }

  useEffect(() => {
    return () => {
      form.unregisterField(name)
    }
  // eslint-disable-next-line
  }, [])

  let fieldValue
  if (type === 'radio' || type === 'checkbox') {
    fieldValue = value
  } else {
    fieldValue = get(form.values, name)
  }
  
  const field = {
    name,
    value: fieldValue === undefined 
      ? initialValue === undefined
        ? guessInitialValue(component, type)
        : initialValue
      : fieldValue,
    onBlur: form.onBlur,
    onChange: form.onChange,
    onFocus: form.onFocus,
    ...props,
  }
  if (type) {
    field.type = type
  }
  if (type === 'radio') {
    field.checked = value === get(form.values, name)
  }

  if (render) {
    if (typeof render !== 'function') {
      throw new TypeError('`render` prop should be a function')
    }

    return render({ field, form })
  }

  if (component !== 'select' && children) {
    if (typeof children !== 'function') {
      throw new TypeError('`render` prop should be a function')
    }

    return children({ field, form })
  }

  let rawComponent
  if (typeof component === 'string') {
    if (component === 'input') {
      rawComponent = React.createElement(
        'input',
        field
      )
    } else if (component === 'select') {
      if (!children) {
        throw new Error('`render` prop should be a function')
      }
      rawComponent = React.createElement(
        'select',
        field,
        children,
      )
    } else if (component === 'textarea') {
      rawComponent = React.createElement(
        'textarea',
        field,
      )
    }
  } else {
    rawComponent = React.createElement(
      component,
      field
    )
  }

  if (labelComponent) {
    return React.createElement(
      React.Fragment,
      null,
      labelComponent,
      rawComponent,
      displayError ? <FieldError name={name} /> : null
    )
  } else if (label) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'label',
        null,
        label,
      ),
      rawComponent,
      displayError ? <FieldError name={name} /> : null
    )
  } else if (displayError) {
    return React.createElement(
      React.Fragment,
      null,
      rawComponent,
      <FieldError name={name} />
    )
  }

  return rawComponent
}

export default Field
